---
description: Discover and catalog industry problems using an agentic multi-phase workflow with web search, research, and validation.
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Overview

This skill implements the **Agentic Problem Discovery Flow** using **subagent delegation** to avoid context exhaustion.

> **CRITICAL ARCHITECTURE RULES**
>
> 1. **Orchestrator stays lightweight** - NEVER do web searches, NEVER read large files
> 2. **Each subagent writes to its OWN file** - NO shared file writes during research
> 3. **Final merge is a separate subagent** - Orchestrator doesn't read problem content
> 4. **Subagents return minimal status only** - Just success/fail + title + score

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     ORCHESTRATOR (You - MINIMAL CONTEXT)                 │
│                                                                          │
│  ONLY does:                                                              │
│  - Parse input arguments                                                 │
│  - Launch subagents with Task tool                                       │
│  - Track success/failure counts                                          │
│  - Display progress to user                                              │
│                                                                          │
│  NEVER does:                                                             │
│  - Web searches                                                          │
│  - Read problem JSON files                                               │
│  - Accumulate problem data in context                                    │
└─────────────────────────┬───────────────────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ DISCOVERY       │ │ RESEARCH        │ │ MERGE           │
│ SUBAGENT        │ │ SUBAGENTS (x10) │ │ SUBAGENT        │
│                 │ │                 │ │                 │
│ Writes:         │ │ Each writes:    │ │ Reads all       │
│ candidates.json │ │ problem-N.json  │ │ problem-N.json  │
│                 │ │ (individual)    │ │ Writes final    │
│ Returns:        │ │                 │ │ field file      │
│ count only      │ │ Returns:        │ │                 │
│                 │ │ title + score   │ │ Returns:        │
│                 │ │ only            │ │ count + summary │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

## Workflow Steps

### Step 0: Parse Research Request

Parse the user's input to determine:
- **Industry** (required)
- **Domain** (optional)
- **Field** (optional)

**Configuration defaults:**
- `maxProblems`: 10 (override with `--max N`)
- `depthLevel`: deep

If input is empty, prompt user for target.

**Quick validation** - just check the taxonomy file exists:
```
docs/research/industry-taxonomy-hierarchy.md
```

### Step 1: Initialize Session (LIGHTWEIGHT)

1. Generate session ID: `session-YYYYMMDD-HHMMSS`
2. Create scratchpad directory using Bash:
   ```bash
   mkdir -p {scratchpad}/discover-{session-id}/problems
   ```
3. Display to user:
   ```
   ## Starting Problem Discovery

   Session: {session-id}
   Target: {industry} > {domain} > {field}
   Max Problems: {N}

   Launching discovery...
   ```

**DO NOT:**
- Read the output field file
- Count existing problems
- Read taxonomy details

### Step 2: Discovery Phase (SUBAGENT)

Launch ONE subagent for discovery:

```
Task tool:
- subagent_type: "general-purpose"
- description: "Discover {field} problems"
- prompt: <see below>
```

**DISCOVERY PROMPT:**
```
You are the Discovery Agent. Find problem candidates for:
- Industry: {industry}
- Domain: {domain}
- Field: {field}

## Instructions

1. Run 5 web searches using WebSearch tool:
   - "{field} {domain} challenges problems 2025 2026"
   - "{field} pain points issues"
   - "{field} unsolved problems gaps"
   - "{field} limitations bottlenecks"
   - "{field} emerging challenges risks"

2. Identify up to {maxProblems} distinct problem candidates

3. Write to file: {scratchpad}/discover-{session-id}/candidates.json
   ```json
   {
     "count": N,
     "candidates": [
       {
         "id": "1",
         "title": "Problem title here",
         "brief": "2-3 sentence description",
         "sources": ["url1", "url2"]
       }
     ]
   }
   ```

4. Return ONLY this text (nothing else):
   "Found {N} candidates. File written."

## Important
- Keep candidate descriptions SHORT (2-3 sentences max)
- Return minimal text - just the count confirmation
```

**After subagent completes:**
- Read ONLY `candidates.json` (small file)
- Extract candidate count and titles
- DO NOT include full descriptions in your context

### Step 3: Research Phase (INDIVIDUAL SUBAGENTS)

For each candidate, launch a subagent that writes to its **OWN file**.

> **CRITICAL: NO SHARED FILE WRITES**
> Each research subagent writes to: `{scratchpad}/discover-{session-id}/problems/problem-{N}.json`
> This prevents file conflicts and context accumulation.

Launch **2-3 subagents in parallel** per batch.

```
Task tool:
- subagent_type: "general-purpose"
- description: "Research problem {N}"
- prompt: <see below>
```

**RESEARCH PROMPT:**
```
You are Research Agent #{N}. Research ONE problem and save it.

## Problem to Research
Title: {candidate_title}
Brief: {candidate_brief}
Sources: {sources}

## Taxonomy (use these exact values)
- Industry: {industry_name} | slug: {industry_slug} | id: {industry_id}
- Domain: {domain_name} | slug: {domain_slug} | id: {domain_id}
- Field: {field_name} | slug: {field_slug} | id: {field_id}

## Instructions

### 1. Research (use WebSearch, limit WebFetch attempts)
If WebFetch returns 403, skip that URL and use WebSearch results instead.
Extract:
- Full description (200-400 words)
- 3-5 root causes
- 3-5 consequences
- 2-4 existing solutions
- 2-4 solution gaps
- 3-5 stakeholders

### 2. Score (0-10 scale)
- Severity: affected population, economic impact, quality of life, productivity
- Tractability: technical feasibility, resources needed, existing progress, barriers
- Neglectedness: research activity, funding, organizations working on it
- Impact Score = (Severity×0.35) + (Tractability×0.25) + (Neglectedness×0.25) + (Urgency×0.15)
- Confidence: 0-1 based on evidence quality

### 3. Write to file
Save complete problem JSON to:
{scratchpad}/discover-{session-id}/problems/problem-{N}.json

Use this exact structure:
{
  "id": "prob-{field_slug}-{N}",
  "title": "...",
  "slug": "...",
  "description": "...",
  "summary": "...",
  "industry": {"id": "{industry_id}", "name": "{industry_name}", "slug": "{industry_slug}"},
  "domain": {"id": "{domain_id}", "name": "{domain_name}", "slug": "{domain_slug}"},
  "field": {"id": "{field_id}", "name": "{field_name}", "slug": "{field_slug}"},
  "problemType": "technical|process|resource|knowledge|coordination|regulatory|market|environmental|social|ethical",
  "problemSubtypes": [],
  "scope": "individual|team|organization|industry|global",
  "maturity": "emerging|growing|mature|declining",
  "urgency": "critical|high|medium|low",
  "severity": {"overall": N, "affectedPopulation": N, "economicImpact": N, "qualityOfLife": N, "productivityImpact": N},
  "tractability": {"overall": N, "technicalFeasibility": N, "resourceRequirements": N, "existingProgress": N, "barriers": N},
  "neglectedness": {"overall": N, "researchActivity": N, "fundingLevel": N, "organizationCount": N, "mediaAttention": N},
  "impactScore": N,
  "rootCauses": [...],
  "consequences": [...],
  "existingSolutions": [...],
  "solutionGaps": [...],
  "stakeholders": [...],
  "sources": [...],
  "tags": [],
  "keywords": [],
  "metrics": {},
  "researchSession": "{session_id}",
  "confidence": N,
  "verificationStatus": "ai-verified",
  "createdAt": "{timestamp}",
  "updatedAt": "{timestamp}",
  "version": 1
}

### 4. Return ONLY this (nothing else):
"OK|{title}|{impactScore}|{confidence}"

Or if failed:
"FAIL|{title}|{reason}"

## Important
- If WebFetch gives 403, use WebSearch results instead
- DO NOT return the full problem JSON
- ONLY return the status line
```

**Orchestrator handling:**
- Parse the simple status line: `OK|Title|Score|Confidence` or `FAIL|Title|Reason`
- Track counts only
- Display: `✓ Problem {N}: "{title}" (Impact: {score})`
- DO NOT ask subagent to return problem content

### Step 4: Merge Phase (SUBAGENT)

After all research subagents complete, launch ONE merge subagent:

```
Task tool:
- subagent_type: "general-purpose"
- description: "Merge {field} problems"
- prompt: <see below>
```

**MERGE PROMPT:**
```
You are the Merge Agent. Combine individual problem files into the final output.

## Input Location
Problem files: {scratchpad}/discover-{session-id}/problems/problem-*.json

## Output Location
Final file: research-viewer/public/research-data/industries/{industry_slug}/{domain_slug}/fields/{field_slug}.json

## Taxonomy
- Industry: {industry_name} | slug: {industry_slug} | id: {industry_id}
- Domain: {domain_name} | slug: {domain_slug} | id: {domain_id}
- Field: {field_name} | slug: {field_slug} | id: {field_id}
- Field description: {field_description}

## Instructions

1. Create output directory if needed:
   ```bash
   mkdir -p research-viewer/public/research-data/industries/{industry_slug}/{domain_slug}/fields
   ```

2. Read each problem-N.json file from the problems directory

3. Check if output file exists:
   - If YES: Read it, append new problems to the "problems" array
   - If NO: Create new file with field/domain/industry metadata

4. Write the merged file with this structure:
   ```json
   {
     "field": {"id": "{field_id}", "name": "{field_name}", "slug": "{field_slug}", "description": "..."},
     "domain": {"id": "{domain_id}", "name": "{domain_name}", "slug": "{domain_slug}"},
     "industry": {"id": "{industry_id}", "name": "{industry_name}", "slug": "{industry_slug}"},
     "problems": [... all problems ...]
   }
   ```

5. Validate JSON is valid using:
   ```bash
   python3 -c "import json; d=json.load(open('...')); print(f'Valid: {len(d[\"problems\"])} problems')"
   ```

6. Return ONLY:
   "MERGED|{count}|{output_file_path}"
```

### Step 5: Finalize (ORCHESTRATOR)

After merge subagent completes:

1. **Write session log** (small file, OK to do directly):
   ```json
   {
     "id": "{session-id}",
     "completedAt": "{timestamp}",
     "target": {"industry": "...", "domain": "...", "field": "..."},
     "results": {
       "candidatesFound": N,
       "problemsResearched": N,
       "problemsStored": N,
       "failures": N
     }
   }
   ```
   Location: `research-viewer/public/research-data/sessions/{session-id}.json`

2. **Report to user:**
   ```markdown
   ## Problem Discovery Complete

   **Session:** {session-id}
   **Target:** {industry} > {domain} > {field}

   ### Results
   | Metric | Count |
   |--------|-------|
   | Candidates Found | {N} |
   | Problems Stored | {N} |
   | Failed | {N} |

   ### Problems Added
   1. {title} (Impact: {score})
   2. {title} (Impact: {score})
   ...

   ### Output
   `{output_file_path}`

   ### Next Steps
   - Run `/aggregate-stats` to update indexes
   ```

3. **Cleanup** (optional):
   ```bash
   rm -rf {scratchpad}/discover-{session-id}
   ```

## Critical Rules for Orchestrator

| DO | DON'T |
|----|-------|
| Launch subagents | Do web searches |
| Track success/fail counts | Read problem JSON content |
| Display progress messages | Accumulate problem data |
| Parse simple status lines | Ask subagents for detailed returns |
| Write small session log | Read/write large field files |

## Subagent Return Format

All subagents return **minimal status lines** only:

| Subagent | Return Format |
|----------|---------------|
| Discovery | `Found {N} candidates. File written.` |
| Research | `OK\|{title}\|{score}\|{confidence}` or `FAIL\|{title}\|{reason}` |
| Merge | `MERGED\|{count}\|{filepath}` |

## File Structure

```
{scratchpad}/discover-{session-id}/
├── candidates.json          # Discovery output (small)
└── problems/
    ├── problem-1.json       # Individual problem files
    ├── problem-2.json
    └── ...

research-viewer/public/research-data/
├── industries/{ind}/{dom}/fields/{field}.json  # Final merged output
└── sessions/{session-id}.json                   # Session log
```

## Error Handling

- **WebFetch 403**: Subagent uses WebSearch results instead
- **Research subagent fails**: Continue with others, track failure count
- **Merge fails**: Report error, individual files preserved for retry
