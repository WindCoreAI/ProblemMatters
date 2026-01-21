# Lessons Learned: Preventing Context Exhaustion in Agent Skills

**Date:** 2026-01-20
**Issue:** discover-problems skill repeatedly getting stuck during execution
**Root Cause:** Context window exhaustion at multiple stages of a complex workflow
**Resolution:** Architectural refactoring with subagent delegation and non-LLM merge

---

## Executive Summary

When building complex agent skills that involve multiple phases (discovery, research, validation, storage), context window exhaustion is a critical failure mode that can cause the agent to "get stuck" without clear error messages. This document captures patterns and anti-patterns discovered while debugging the `discover-problems` skill.

---

## The Problem

### Symptoms
- Agent would process successfully through early phases
- At a certain point (usually during storage/merge), the agent would stop responding
- No explicit error messages - just silence
- Retrying would sometimes work, sometimes fail at different points

### Root Causes Identified

1. **Monolithic Workflow** - Single agent context accumulated all intermediate data
2. **Large Return Values** - Subagents returning full JSON objects back to orchestrator
3. **Shared File Writes** - Multiple subagents trying to append to same file
4. **LLM-Based Merge** - Using an LLM subagent to combine large files

---

## Evolution of Fixes

### Attempt 1: Basic Subagent Delegation ❌

**Approach:** Split workflow into phases, each handled by a subagent

```
Orchestrator → Discovery Subagent → Research Subagents → Validation → Storage
```

**Problem:** Orchestrator still accumulated results from each subagent, causing context bloat.

**Lesson:** Subagent delegation alone is not enough if the orchestrator collects their outputs.

---

### Attempt 2: Minimal Return Values ❌

**Approach:** Have subagents return only status lines instead of full data

```
Before: Subagent returns full problem JSON (~300 lines)
After:  Subagent returns "OK|Title|65|0.85" (1 line)
```

**Problem:** Subagents still wrote to a shared file, causing conflicts and retries that consumed context.

**Lesson:** Even with minimal returns, shared state can cause context accumulation through retries.

---

### Attempt 3: Individual Files per Subagent ❌

**Approach:** Each research subagent writes to its own file

```
problem-1.json  ← Subagent 1
problem-2.json  ← Subagent 2
problem-3.json  ← Subagent 3
...
```

**Problem:** The merge subagent had to read ALL files into its context to combine them.

**Lesson:** Moving the problem to a different subagent doesn't solve it - just relocates it.

---

### Attempt 4: Python Script for Merge ✅

**Approach:** Replace LLM-based merge with a Python script run via Bash

```python
# No LLM involved - just file I/O
for pf in glob.glob("problem-*.json"):
    output["problems"].append(json.load(open(pf)))
json.dump(output, open(OUTPUT_FILE, 'w'))
```

**Result:** Complete success - workflow runs to completion without stalling.

**Lesson:** Not every operation needs an LLM. File manipulation is better done with scripts.

---

## Architecture Patterns

### ✅ DO: Orchestrator as Lightweight Coordinator

```
┌─────────────────────────────────────────────────────┐
│                   ORCHESTRATOR                       │
│                                                      │
│  ✓ Parse input arguments                            │
│  ✓ Launch subagents with Task tool                  │
│  ✓ Track success/failure counts (integers only)     │
│  ✓ Display progress to user                         │
│  ✓ Run non-LLM scripts for data manipulation        │
│                                                      │
│  ✗ Never do web searches                            │
│  ✗ Never read large files into context              │
│  ✗ Never accumulate data from subagents             │
└─────────────────────────────────────────────────────┘
```

### ✅ DO: Subagents Write to Isolated Files

```
Subagent 1 → writes → problem-1.json
Subagent 2 → writes → problem-2.json
Subagent 3 → writes → problem-3.json

(No shared file access during parallel execution)
```

### ✅ DO: Minimal Return Values

| Bad Return | Good Return |
|------------|-------------|
| Full 300-line JSON object | `OK\|Title\|65\|0.85` |
| List of all problems found | `Found 10 candidates` |
| Detailed error with stack trace | `FAIL\|Title\|timeout` |

### ✅ DO: Non-LLM Operations for Data Manipulation

| Operation | Use LLM? | Better Alternative |
|-----------|----------|-------------------|
| Web search | Yes | WebSearch tool |
| Research & analysis | Yes | Subagent |
| File merging | **No** | Python script |
| JSON validation | **No** | `python3 -c "import json; json.load(...)"` |
| File counting | **No** | `ls -1 | wc -l` |
| Directory creation | **No** | `mkdir -p` |

### ❌ DON'T: Accumulate in Orchestrator

```
# BAD - orchestrator context grows with each subagent
results = []
for candidate in candidates:
    result = await research_subagent(candidate)
    results.append(result)  # ← Context grows!

# GOOD - orchestrator only tracks counts
success_count = 0
for candidate in candidates:
    status = await research_subagent(candidate)  # Returns "OK|Title|65"
    if status.startswith("OK"):
        success_count += 1  # ← Context stays small
```

### ❌ DON'T: Use LLM Subagent for Large File Operations

```
# BAD - merge subagent reads all files into LLM context
Merge Subagent:
  - Read problem-1.json (250 lines)
  - Read problem-2.json (260 lines)
  - Read problem-3.json (240 lines)
  - ... (10 files = 2500+ lines in context)
  - Generate combined output
  - → CONTEXT EXHAUSTION

# GOOD - Python script handles files directly
python3 << 'EOF'
import json, glob
output = {"problems": []}
for f in glob.glob("problem-*.json"):
    output["problems"].append(json.load(open(f)))
json.dump(output, open("output.json", "w"))
EOF
```

### ❌ DON'T: Have Multiple Subagents Write to Same File

```
# BAD - race conditions and retry loops
Subagent 1 ─┐
Subagent 2 ─┼─→ shared-output.json  ← Conflicts!
Subagent 3 ─┘

# GOOD - isolated files, merged later
Subagent 1 → problem-1.json ─┐
Subagent 2 → problem-2.json ─┼─→ Python merge → output.json
Subagent 3 → problem-3.json ─┘
```

---

## Context Budget Guidelines

### Estimated Context Costs

| Item | Approximate Tokens |
|------|-------------------|
| Web search results (1 query) | 500-2000 |
| WebFetch page content | 1000-5000 |
| Problem JSON (full) | 800-1500 |
| Candidate list (10 items) | 300-500 |
| Status line response | 10-20 |

### Safe Limits per Subagent

| Subagent Type | Recommended Max Context |
|---------------|------------------------|
| Discovery (web searches) | 5-7 searches |
| Research (per problem) | 2-3 WebFetch + 2-3 WebSearch |
| Orchestrator | Track counts only, no data |

### Warning Signs of Context Exhaustion

1. Agent stops responding mid-task
2. Responses become increasingly slow
3. Agent starts "forgetting" earlier instructions
4. Repeated read/write failures on files
5. Agent attempts same operation multiple times

---

## Decision Framework

When designing an agent skill, ask these questions:

### 1. Does this operation need an LLM?

```
Need LLM:
- Understanding/analyzing content
- Making decisions based on context
- Generating natural language
- Research and synthesis

Don't need LLM:
- File I/O operations
- JSON manipulation
- Directory operations
- Counting/aggregation
- Data format conversion
```

### 2. How much data flows back to the orchestrator?

```
Safe: Status codes, counts, short identifiers
Risky: Full objects, lists, detailed reports
Dangerous: File contents, search results, accumulated data
```

### 3. Do subagents share any state?

```
Safe: Each subagent writes to its own file
Risky: Subagents append to shared file sequentially
Dangerous: Parallel subagents writing to same file
```

### 4. What's the total context cost of this workflow?

```
Calculate:
- Input parsing: ~100 tokens
- Per subagent launch: ~200 tokens prompt + return
- Web searches: ~1000 tokens each
- File reads: ~tokens = lines × 10

If total > 50,000 tokens: Consider splitting into phases
If total > 100,000 tokens: Mandatory subagent isolation
```

---

## Checklist for New Agent Skills

Before implementing a complex agent skill, verify:

- [ ] Orchestrator only tracks counts/status, not data
- [ ] Subagents return minimal status strings
- [ ] Each parallel subagent writes to isolated file
- [ ] File merging uses Python/Bash, not LLM
- [ ] No subagent reads output from another subagent
- [ ] Total context cost estimated and within limits
- [ ] Graceful degradation if subagent fails
- [ ] Progress feedback to user at each phase

---

## References

- Original issue: discover-problems skill getting stuck at merge phase
- Related files: `.claude/commands/discover-problems.md`
- Architecture spec: `docs/specifications/agentic-problem-discovery-flow.md`

---

## Appendix: Final Working Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     ORCHESTRATOR (Minimal Context)               │
│                                                                  │
│  1. Parse args                                                   │
│  2. mkdir scratchpad                                             │
│  3. Launch Discovery Subagent → "Found 10 candidates"            │
│  4. Read candidates.json (small file)                            │
│  5. For each candidate:                                          │
│     └─ Launch Research Subagent → "OK|Title|65|0.85"            │
│  6. Run Python merge script → "MERGED|10|output.json"            │
│  7. Write session log                                            │
│  8. Report to user                                               │
└─────────────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ Discovery       │  │ Research        │  │ Python Merge    │
│ Subagent        │  │ Subagents ×10   │  │ (No LLM)        │
│                 │  │                 │  │                 │
│ - WebSearch ×5  │  │ - WebSearch ×3  │  │ - glob files    │
│ - Write JSON    │  │ - Write JSON    │  │ - json.load()   │
│ - Return count  │  │ - Return status │  │ - json.dump()   │
└─────────────────┘  └─────────────────┘  └─────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
   candidates.json    problem-{N}.json      field.json
      (small)          (isolated)           (merged)
```
