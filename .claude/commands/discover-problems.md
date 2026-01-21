---
description: Discover and catalog industry problems using an agentic multi-phase workflow with web search, research, and validation.
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Overview

This skill implements the **Agentic Problem Discovery Flow** using **subagent delegation** to avoid context exhaustion. You act as the **Orchestrator Agent**, coordinating specialized subagents for each phase.

> **CRITICAL: Subagent Architecture**
>
> This workflow delegates heavy processing to subagents to prevent context window exhaustion.
> Each phase runs in a separate subagent with its own clean context.
> Problems are processed and stored **incrementally** - one at a time.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     ORCHESTRATOR (You - Lightweight)                     │
│         - Parse input, coordinate phases, track progress                 │
│         - DO NOT perform web searches or heavy processing directly       │
└─────────────────────────┬───────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    PHASE 1: DISCOVERY SUBAGENT                           │
│                    (Task tool, runs in background)                       │
│                                                                          │
│  - Performs all web searches                                             │
│  - Extracts problem candidates                                           │
│  - Writes candidates to scratchpad file                                  │
│  - Returns: list of problem titles + brief descriptions                  │
└─────────────────────────┬───────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────────────┐
│              PHASE 2: RESEARCH SUBAGENTS (One per problem)               │
│              (Task tool, can run in parallel batches)                    │
│                                                                          │
│  For each problem candidate:                                             │
│  - Deep research with WebFetch                                           │
│  - Generate full problem JSON                                            │
│  - Validate and score                                                    │
│  - Write directly to field file (append)                                 │
│  - Returns: success/failure + problem summary                            │
└─────────────────────────┬───────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    PHASE 3: FINALIZATION (Orchestrator)                  │
│                                                                          │
│  - Collect results from all research subagents                           │
│  - Write session log                                                     │
│  - Report summary to user                                                │
└─────────────────────────────────────────────────────────────────────────┘
```

## Workflow Steps

### Step 0: Parse Research Request

Parse the user's input to determine the research target:

- **Industry** (required): One of the 16 industries from the taxonomy
- **Domain** (optional): Specific domain within the industry
- **Field** (optional): Specific field within the domain

**Configuration defaults:**
- `maxProblems`: 10 (can be overridden with `--max N`)
- `depthLevel`: deep (options: shallow, standard, deep)
- `minConfidence`: 0.7

If the input is empty or unclear, prompt the user with available industries.

**Read the taxonomy file** to validate the target:
```
docs/research/industry-taxonomy-hierarchy.md
```

### Step 1: Initialize Session

1. Generate session ID: `session-YYYYMMDD-HHMMSS`
2. Determine the output file path:
   ```
   research-viewer/public/research-data/industries/{industry-slug}/{domain-slug}/fields/{field-slug}.json
   ```
3. Check if the field file exists and count existing problems
4. Create the scratchpad directory for this session:
   ```
   {scratchpad}/discover-{session-id}/
   ```

**Display to user:**
```markdown
## Initializing Research Session

**Session ID:** {session-id}
**Target:** {industry} > {domain} > {field}
**Output:** {output-file-path}
**Max Problems:** {maxProblems}

Starting Discovery Phase...
```

### Step 2: Discovery Phase (SUBAGENT)

**Launch a subagent using the Task tool** to perform discovery:

```
Use the Task tool with:
- subagent_type: "general-purpose"
- description: "Discover {field} problems"
- prompt: [See DISCOVERY_SUBAGENT_PROMPT below]
```

**DISCOVERY_SUBAGENT_PROMPT:**

```
You are the Discovery Agent for Problem Matters. Your task is to find problem candidates in:

Industry: {industry_name} ({industry_slug})
Domain: {domain_name} ({domain_slug})
Field: {field_name} ({field_slug})

## Your Task

1. Execute these web searches (use WebSearch tool):
   - "{field_name} {domain_name} challenges problems 2025 2026"
   - "{field_name} industry pain points issues"
   - "{field_name} unsolved problems research gaps"
   - "{field_name} technical limitations bottlenecks"
   - "{field_name} emerging challenges future risks"

2. From the search results, identify {target_count} distinct problem candidates.

3. For each candidate, extract:
   - title: Concise problem title (10-15 words)
   - description: Brief description (2-3 sentences)
   - sources: List of 2-3 relevant URLs from search results
   - significance: Why this problem matters

4. Write the candidates to this file using the Write tool:
   {scratchpad_path}/candidates.json

   Format:
   ```json
   {
     "candidates": [
       {
         "id": "candidate-1",
         "title": "...",
         "description": "...",
         "sources": ["url1", "url2"],
         "significance": "..."
       }
     ],
     "searchesPerformed": 5,
     "totalResultsAnalyzed": N
   }
   ```

5. Return a summary of candidates found.

## Quality Guidelines
- Focus on REAL, SIGNIFICANT problems (not minor inconveniences)
- Problems should be specific to {field_name}, not generic
- Avoid duplicating problems that may already exist
- Each candidate should have at least one credible source
```

**Wait for the subagent to complete**, then read the candidates file.

### Step 3: Research Phase (SUBAGENTS - One Per Problem)

For each problem candidate, **launch a separate subagent**:

> **IMPORTANT: Process problems incrementally**
> - Launch 2-3 research subagents in parallel (not all at once)
> - Each subagent writes directly to the output file
> - This prevents context exhaustion and provides incremental progress

```
Use the Task tool with:
- subagent_type: "general-purpose"
- description: "Research: {problem_title_short}"
- prompt: [See RESEARCH_SUBAGENT_PROMPT below]
```

**RESEARCH_SUBAGENT_PROMPT:**

```
You are the Research Agent for Problem Matters. Research and store ONE problem.

## Problem Candidate
Title: {candidate_title}
Description: {candidate_description}
Sources: {candidate_sources}

## Target Taxonomy
Industry: {industry_name} (slug: {industry_slug}, id: {industry_id})
Domain: {domain_name} (slug: {domain_slug}, id: {domain_id})
Field: {field_name} (slug: {field_slug}, id: {field_id})

## Your Task

### 1. Deep Research
Use WebFetch to read 2-3 of the source URLs. Extract:
- Detailed problem description (200-400 words)
- Root causes (3-5)
- Consequences (3-5)
- Existing solutions and their limitations (2-4)
- Solution gaps and opportunities (2-4)
- Affected stakeholders (3-5)
- Metrics (economic impact, affected population)

### 2. Validate & Score
Calculate scores (0-10 scale):

**SEVERITY** (weight: 0.35):
- affectedPopulation: How many people/orgs affected?
- economicImpact: Financial cost of the problem?
- qualityOfLife: Impact on wellbeing?
- productivityImpact: Impact on efficiency?
- overall: Average of above

**TRACTABILITY** (weight: 0.25):
- technicalFeasibility: Can it be solved with current tech?
- resourceRequirements: How much effort needed? (inverse: high effort = low score)
- existingProgress: How much progress already made?
- barriers: How many barriers exist? (inverse)
- overall: Average of above

**NEGLECTEDNESS** (weight: 0.25):
- researchActivity: How much research exists? (inverse)
- fundingLevel: How much funding? (inverse)
- organizationCount: How many orgs working on it? (inverse)
- mediaAttention: How much coverage? (inverse)
- overall: Average of above

**URGENCY**: critical=10, high=7.5, medium=5, low=2.5

**IMPACT SCORE** = (Severity * 0.35) + (Tractability * 0.25) + (Neglectedness * 0.25) + (Urgency * 0.15)

**CONFIDENCE**: 0-1 based on source quality and evidence strength

### 3. Generate Problem JSON

Create the full problem object:

```json
{
  "id": "{generate_uuid}",
  "title": "{refined_title}",
  "slug": "{slug_from_title}",
  "description": "{full_description}",
  "summary": "{50-100_word_summary}",
  "industry": {"id": "{industry_id}", "name": "{industry_name}", "slug": "{industry_slug}"},
  "domain": {"id": "{domain_id}", "name": "{domain_name}", "slug": "{domain_slug}"},
  "field": {"id": "{field_id}", "name": "{field_name}", "slug": "{field_slug}"},
  "problemType": "{technical|process|resource|knowledge|coordination|regulatory|market|environmental|social|ethical}",
  "problemSubtypes": ["{tag1}", "{tag2}"],
  "scope": "{individual|team|organization|industry|global}",
  "maturity": "{emerging|growing|mature|declining}",
  "urgency": "{critical|high|medium|low}",
  "severity": {"overall": N, "affectedPopulation": N, "economicImpact": N, "qualityOfLife": N, "productivityImpact": N},
  "tractability": {"overall": N, "technicalFeasibility": N, "resourceRequirements": N, "existingProgress": N, "barriers": N},
  "neglectedness": {"overall": N, "researchActivity": N, "fundingLevel": N, "organizationCount": N, "mediaAttention": N},
  "impactScore": N,
  "rootCauses": [{"description": "...", "category": "...", "contributionLevel": "high|medium|low", "evidence": "..."}],
  "consequences": [{"description": "...", "type": "...", "affectedArea": "...", "timeframe": "immediate|short-term|medium-term|long-term"}],
  "existingSolutions": [{"name": "...", "description": "...", "type": "...", "effectiveness": N, "adoption": "...", "limitations": ["..."]}],
  "solutionGaps": [{"description": "...", "gapType": "...", "opportunity": "...", "difficulty": "low|medium|high|very-high"}],
  "stakeholders": [{"type": "...", "description": "...", "examples": ["..."], "interest": "low|medium|high", "influence": "low|medium|high"}],
  "sources": [{"type": "...", "title": "...", "url": "...", "publishedAt": "...", "relevantExcerpt": "..."}],
  "tags": ["..."],
  "keywords": ["..."],
  "metrics": {"economicImpactUSD": N, "affectedPopulation": "...", "trendDirection": "increasing|stable|decreasing"},
  "researchSession": "{session_id}",
  "confidence": N,
  "verificationStatus": "ai-verified",
  "createdAt": "{iso_timestamp}",
  "updatedAt": "{iso_timestamp}",
  "version": 1
}
```

### 4. Store the Problem

Read the existing field file (if it exists):
```
{output_file_path}
```

If it exists:
- Parse the JSON
- Append your problem to the `problems` array
- Write back the updated file

If it doesn't exist, create it with this structure:
```json
{
  "field": {"id": "{field_id}", "name": "{field_name}", "slug": "{field_slug}", "description": "..."},
  "domain": {"id": "{domain_id}", "name": "{domain_name}", "slug": "{domain_slug}"},
  "industry": {"id": "{industry_id}", "name": "{industry_name}", "slug": "{industry_slug}"},
  "problems": [YOUR_PROBLEM]
}
```

### 5. Return Result

Return a brief summary:
- Problem title
- Impact score
- Confidence score
- Success or any issues encountered

If confidence < 0.7, still store but note it as low confidence.
```

### Step 4: Track Progress & Handle Results

As each research subagent completes:

1. **Update the user on progress:**
   ```markdown
   ✓ Problem {N}/{total}: "{title}" (Impact: {score}, Confidence: {conf})
   ```

2. **Track results:**
   - Count successful stores
   - Count failures/skips
   - Collect problem summaries for final report

3. **Launch next batch** if more candidates remain (2-3 at a time)

### Step 5: Finalize Session

After all research subagents complete:

1. **Write session log** to `research-viewer/public/research-data/sessions/{session-id}.json`:
   ```json
   {
     "id": "{session-id}",
     "startedAt": "{start_timestamp}",
     "completedAt": "{end_timestamp}",
     "target": {"industry": "...", "domain": "...", "field": "..."},
     "configuration": {"maxProblems": N, "depthLevel": "...", "minConfidence": 0.7},
     "status": "completed",
     "results": {
       "candidatesDiscovered": N,
       "problemsStored": N,
       "problemsSkipped": N,
       "problemIds": ["..."]
     }
   }
   ```

2. **Report to user:**
   ```markdown
   ## Problem Discovery Complete

   **Session:** {session-id}
   **Target:** {industry} > {domain} > {field}

   ### Results

   | Metric | Count |
   |--------|-------|
   | Candidates Discovered | {N} |
   | Problems Stored | {N} |
   | Skipped (low confidence) | {N} |

   ### Problems Added

   1. **{title}** (Impact: {score})
      {summary}

   2. ...

   ### Output File
   `{output_file_path}`

   ### Next Steps
   - Run `/aggregate-stats` to update index files
   - Run `/discover-problems {other-field}` for more research
   ```

## Error Handling

- **Discovery subagent fails:** Report error, allow retry
- **Research subagent fails:** Log error, continue with other problems
- **File write conflict:** Read-modify-write with retry
- **Low confidence:** Store anyway but flag in results

## Important Notes

1. **DO NOT perform web searches directly** - always delegate to subagents
2. **Process problems incrementally** - 2-3 parallel subagents max
3. **Each subagent writes its own output** - no accumulation in orchestrator context
4. **Keep orchestrator lightweight** - only coordinate and report
5. **Use scratchpad for intermediate files** - candidates.json, etc.

## Directory Structure

```
research-viewer/public/research-data/
├── industries/
│   └── {industry-slug}/
│       └── {domain-slug}/
│           └── fields/
│               └── {field-slug}.json  ← Problems written here
└── sessions/
    └── {session-id}.json              ← Session log written here
```

## Subagent Delegation Summary

| Phase | Subagent Type | Parallelism | Output |
|-------|--------------|-------------|--------|
| Discovery | general-purpose | 1 (sequential) | candidates.json in scratchpad |
| Research | general-purpose | 2-3 parallel | Appends to field file directly |
| Finalize | Orchestrator | N/A | Session log + user report |
