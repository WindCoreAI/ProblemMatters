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
> 3. **Merge uses Python script** - NOT an LLM subagent (avoids context exhaustion)
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
│  - Run Python merge script (NO LLM needed)                               │
│  - Display progress to user                                              │
│                                                                          │
│  NEVER does:                                                             │
│  - Web searches                                                          │
│  - Read problem JSON files into context                                  │
│  - Use LLM subagent for merge (causes context exhaustion)                │
└─────────────────────────┬───────────────────────────────────────────────┘
                          │
          ┌───────────────┴───────────────┐
          ▼                               ▼
┌─────────────────┐             ┌───────────────────────┐
│ DISCOVERY       │             │ RESEARCH              │
│ SUBAGENT        │             │ SUBAGENTS (x10)       │
│                 │             │                       │
│ Writes:         │             │ Each writes:          │
│ candidates.json │             │ problem-N.json        │
│                 │             │ problem-N.report.md   │
│ Returns:        │             │ (individual files)    │
│ count only      │             │                       │
│                 │             │ Returns:              │
│                 │             │ title + score         │
└─────────────────┘             └───────────────────────┘
                                        │
                                        ▼
                              ┌───────────────────────┐
                              │ PYTHON MERGE          │
                              │ (Bash script)         │
                              │                       │
                              │ Combines all          │
                              │ problem-N.json        │
                              │ into field file       │
                              │                       │
                              │ Copies reports to     │
                              │ fields/reports/       │
                              └───────────────────────┘
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
- Read taxonomy details into context

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
> Each research subagent writes to:
> - `{scratchpad}/discover-{session-id}/problems/problem-{N}.json` (structured data)
> - `{scratchpad}/discover-{session-id}/problems/problem-{N}.report.md` (detailed report)
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

### 3. Write problem JSON
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

### 4. Write research report
Save a detailed markdown report to:
{scratchpad}/discover-{session-id}/problems/problem-{N}.report.md

Use this exact structure:
```markdown
# {Problem Title}

## Executive Summary

{2-3 paragraph high-level overview of the problem, its significance, and key findings}

## Background & Context

{Industry context, how the problem emerged, historical perspective, current state of the problem}

## Problem Analysis

### Root Causes

{Detailed analysis of each root cause with supporting evidence from research. Include specific examples, statistics, and expert opinions where available.}

### Consequences & Impact

{Comprehensive breakdown of economic, social, operational, and environmental impacts. Include quantitative data where available (e.g., "$X billion annual cost", "affects Y million users").}

## Current Solutions Landscape

{Analysis of existing solutions, their strengths, adoption levels, and limitations. Compare different approaches and explain why the problem persists despite these solutions.}

## Solution Gaps & Opportunities

{Detailed breakdown of unaddressed needs and market opportunities. Explain what's missing in current solutions and where innovation is needed.}

## Stakeholder Analysis

{Who is affected by this problem, who contributes to it, who has decision-making power, and who funds solutions. Include their interests and influence levels.}

## Research Sources

{Formatted list of sources used, with brief annotations about what each source contributed to the research}

- [Source Title](URL) - Brief description of contribution
- ...

## Methodology Note

This report was generated through AI-assisted research on {date}.
Research involved web searches across industry publications, academic sources, and expert forums.
Confidence level: {confidence}%
```

### 5. Return ONLY this (nothing else):
"OK|{title}|{impactScore}|{confidence}"

Or if failed:
"FAIL|{title}|{reason}"

## Important
- If WebFetch gives 403, use WebSearch results instead
- DO NOT return the full problem JSON or report content
- ONLY return the status line
- The report should synthesize research into a narrative - it's NOT just a reformatting of the JSON data
```

**Orchestrator handling:**
- Parse the simple status line: `OK|Title|Score|Confidence` or `FAIL|Title|Reason`
- Track counts only
- Display: `✓ Problem {N}: "{title}" (Impact: {score})`
- DO NOT ask subagent to return problem content

### Step 4: Merge Phase (PYTHON SCRIPT - NO LLM)

> **CRITICAL: Use Python script, NOT an LLM subagent**
> The merge operation processes large JSON files. Using an LLM would cause context exhaustion.
> Instead, run a Python script via Bash that handles the merge without LLM involvement.

After all research subagents complete, run this Python merge script:

```bash
python3 << 'MERGE_SCRIPT'
import json
import glob
import os
import shutil
from datetime import datetime

# Configuration (replace these values)
PROBLEMS_DIR = "{scratchpad}/discover-{session-id}/problems"
OUTPUT_FILE = "research-viewer/public/research-data/industries/{industry_slug}/{domain_slug}/fields/{field_slug}.json"
REPORTS_DIR = "research-viewer/public/research-data/industries/{industry_slug}/{domain_slug}/fields/reports"
INDUSTRY = {"id": "{industry_id}", "name": "{industry_name}", "slug": "{industry_slug}"}
DOMAIN = {"id": "{domain_id}", "name": "{domain_name}", "slug": "{domain_slug}"}
FIELD = {"id": "{field_id}", "name": "{field_name}", "slug": "{field_slug}", "description": "{field_description}"}

# Create output directories
os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
os.makedirs(REPORTS_DIR, exist_ok=True)

# Load existing file or create new structure
if os.path.exists(OUTPUT_FILE):
    with open(OUTPUT_FILE, 'r') as f:
        output = json.load(f)
else:
    output = {
        "field": FIELD,
        "domain": DOMAIN,
        "industry": INDUSTRY,
        "problems": []
    }

# Read and merge all problem files
problem_files = sorted(glob.glob(f"{PROBLEMS_DIR}/problem-*.json"))
new_count = 0
reports_copied = 0
for pf in problem_files:
    try:
        with open(pf, 'r') as f:
            problem = json.load(f)
            output["problems"].append(problem)
            new_count += 1

            # Copy corresponding report if it exists
            problem_num = os.path.basename(pf).replace('problem-', '').replace('.json', '')
            report_file = f"{PROBLEMS_DIR}/problem-{problem_num}.report.md"
            if os.path.exists(report_file):
                slug = problem.get('slug', f'problem-{problem_num}')
                shutil.copy(report_file, f"{REPORTS_DIR}/{slug}.md")
                reports_copied += 1
    except Exception as e:
        print(f"Error reading {pf}: {e}")

# Write merged output
with open(OUTPUT_FILE, 'w') as f:
    json.dump(output, f, indent=2)

print(f"MERGED|{new_count}|{reports_copied}|{OUTPUT_FILE}")
MERGE_SCRIPT
```

**Important:** Replace the placeholder values in the script before running:
- `{scratchpad}` - the scratchpad path
- `{session-id}` - the session ID
- `{industry_slug}`, `{industry_id}`, `{industry_name}`
- `{domain_slug}`, `{domain_id}`, `{domain_name}`
- `{field_slug}`, `{field_id}`, `{field_name}`, `{field_description}`

### Step 5: Finalize (ORCHESTRATOR)

After merge script completes:

1. **Write session log** (small file, OK to do directly):
   ```bash
   cat << 'EOF' > research-viewer/public/research-data/sessions/{session-id}.json
   {
     "id": "{session-id}",
     "completedAt": "{timestamp}",
     "target": {"industry": "{industry}", "domain": "{domain}", "field": "{field}"},
     "results": {
       "candidatesFound": {N},
       "problemsResearched": {N},
       "problemsStored": {N},
       "failures": {N}
     }
   }
   EOF
   ```

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
| Run Python merge script | Use LLM subagent for merge |
| Write small session log | Read large field files |

## Subagent Return Format

All subagents return **minimal status lines** only:

| Subagent | Return Format |
|----------|---------------|
| Discovery | `Found {N} candidates. File written.` |
| Research | `OK\|{title}\|{score}\|{confidence}` or `FAIL\|{title}\|{reason}` |

The merge step is NOT a subagent - it's a Python script run via Bash.

## File Structure

```
{scratchpad}/discover-{session-id}/
├── candidates.json              # Discovery output (small)
└── problems/
    ├── problem-1.json           # Individual problem files
    ├── problem-1.report.md      # Corresponding research report
    ├── problem-2.json
    ├── problem-2.report.md
    └── ...

research-viewer/public/research-data/
├── industries/{ind}/{dom}/fields/
│   ├── {field}.json             # Final merged output
│   └── reports/                 # Research reports directory
│       ├── {problem-slug}.md    # Individual problem reports
│       └── ...
└── sessions/{session-id}.json   # Session log
```

## Error Handling

- **WebFetch 403**: Subagent uses WebSearch results instead
- **Research subagent fails**: Continue with others, track failure count
- **Merge script fails**: Report error, individual files preserved for retry

## Complete Python Merge Script Template

Copy this script and fill in the values before running:

```python
#!/usr/bin/env python3
import json
import glob
import os
import shutil

# === FILL IN THESE VALUES ===
PROBLEMS_DIR = "/path/to/scratchpad/discover-session-XXXXXXXX-XXXXXX/problems"
OUTPUT_FILE = "research-viewer/public/research-data/industries/INDUSTRY/DOMAIN/fields/FIELD.json"
REPORTS_DIR = "research-viewer/public/research-data/industries/INDUSTRY/DOMAIN/fields/reports"
INDUSTRY = {"id": "ind-xxx", "name": "Industry Name", "slug": "industry-slug"}
DOMAIN = {"id": "dom-xxx", "name": "Domain Name", "slug": "domain-slug"}
FIELD = {"id": "fld-xxx", "name": "Field Name", "slug": "field-slug", "description": "Field description"}
# ============================

os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
os.makedirs(REPORTS_DIR, exist_ok=True)

if os.path.exists(OUTPUT_FILE):
    with open(OUTPUT_FILE, 'r') as f:
        output = json.load(f)
else:
    output = {"field": FIELD, "domain": DOMAIN, "industry": INDUSTRY, "problems": []}

problem_files = sorted(glob.glob(f"{PROBLEMS_DIR}/problem-*.json"))
new_count = 0
reports_copied = 0
for pf in problem_files:
    try:
        with open(pf, 'r') as f:
            problem = json.load(f)
            output["problems"].append(problem)
            new_count += 1

            # Copy corresponding report if it exists
            problem_num = os.path.basename(pf).replace('problem-', '').replace('.json', '')
            report_file = f"{PROBLEMS_DIR}/problem-{problem_num}.report.md"
            if os.path.exists(report_file):
                slug = problem.get('slug', f'problem-{problem_num}')
                shutil.copy(report_file, f"{REPORTS_DIR}/{slug}.md")
                reports_copied += 1
    except Exception as e:
        print(f"Error: {pf}: {e}")

with open(OUTPUT_FILE, 'w') as f:
    json.dump(output, f, indent=2)

print(f"MERGED|{new_count}|{reports_copied}|{OUTPUT_FILE}")
```
