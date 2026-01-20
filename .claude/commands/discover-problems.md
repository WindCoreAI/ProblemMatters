---
description: Discover and catalog industry problems using an agentic multi-phase workflow with web search, research, and validation.
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Overview

This skill implements the **Agentic Problem Discovery Flow** as specified in `docs/specifications/agentic-problem-discovery-flow.md`. You will act as the **Orchestrator Agent** coordinating multiple phases of research to discover, analyze, validate, and store industry problems.

## Architecture Reference

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        ORCHESTRATOR AGENT (You)                          │
│                   (Coordinates entire research flow)                     │
└─────────────────────────┬───────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
┌───────────────┐ ┌───────────────┐ ┌───────────────┐
│   DISCOVERY   │ │   RESEARCH    │ │  VALIDATION   │
│    PHASE      │ │    PHASE      │ │    PHASE      │
│               │ │               │ │               │
│ - Web search  │ │ - Deep dive   │ │ - Fact check  │
│ - Source find │ │ - Analysis    │ │ - Scoring     │
│ - Trending    │ │ - Structure   │ │ - Dedup       │
└───────────────┘ └───────────────┘ └───────────────┘
        │                 │                 │
        └─────────────────┼─────────────────┘
                          ▼
                 ┌─────────────────┐
                 │  SYNTHESIS &    │
                 │  STORAGE PHASE  │
                 └─────────────────┘
```

## Workflow Steps

### Step 0: Parse Research Request

Parse the user's input to determine the research target. The input can specify:

- **Industry** (required): One of the 16 industries from the taxonomy
- **Domain** (optional): Specific domain within the industry
- **Field** (optional): Specific field within the domain
- **Specific Topic** (optional): Narrow focus area

**Example inputs:**
- `technology-software` - Research all of Technology & Software
- `healthcare clinical-care` - Research Clinical Care domain
- `financial-services banking digital-banking` - Research Digital Banking field
- `AI safety and alignment in large language models` - Specific topic research

**Configuration defaults:**
- `maxProblems`: 10 (can be overridden with `--max N`)
- `depthLevel`: deep (options: shallow, standard, deep, exhaustive)
- `minConfidence`: 0.7

If the input is empty or unclear, prompt the user:

```markdown
## Select Research Target

Please specify what industry/domain/field you want to research for problems.

**Available Industries:**
1. Technology & Software
2. Healthcare & Life Sciences
3. Financial Services
4. Manufacturing & Industrial
5. Energy & Utilities
6. Retail & Consumer
7. Transportation & Logistics
8. Real Estate & Construction
9. Agriculture & Food
10. Media & Entertainment
11. Telecommunications
12. Education
13. Government & Public Sector
14. Professional Services
15. Hospitality & Tourism
16. Non-Profit & Social Impact

**Example commands:**
- `/discover-problems technology-software software-engineering`
- `/discover-problems healthcare clinical-care --max 15 --depth deep`
- `/discover-problems AI ethics and bias in hiring systems`
```

### Step 1: Initialize Research Session

1. Generate a unique session ID (use timestamp-based format: `session-YYYYMMDD-HHMMSS`)
2. Create session directory: `research-data/sessions/{session-id}/`
3. Log session start with target and configuration
4. Check for existing problems to avoid duplicates

**Session log structure:**
```json
{
  "id": "session-20260120-143052",
  "startedAt": "2026-01-20T14:30:52Z",
  "target": {
    "industry": "technology-software",
    "domain": "software-engineering",
    "field": null
  },
  "configuration": {
    "maxProblems": 10,
    "depthLevel": "standard",
    "minConfidence": 0.7
  },
  "status": "in-progress",
  "steps": []
}
```

### Step 2: Discovery Phase

**Objective:** Find problem candidates through web search and analysis.

**Search Strategy:**
Execute multiple search queries to find industry challenges:

1. **Problem-focused queries:**
   - `{target} challenges problems issues 2025 2026`
   - `{target} pain points frustrations`
   - `{target} unsolved problems research gaps`

2. **Industry-specific queries:**
   - `{target} industry report challenges`
   - `{target} market problems opportunities`

3. **Technical queries:**
   - `{target} technical limitations bottlenecks`
   - `{target} scalability issues performance problems`

4. **Future-focused queries:**
   - `{target} emerging challenges future risks`
   - `{target} trends concerns 2026`

**For each search result, extract:**
- Problem title (concise, 10-15 words)
- Brief description (1-2 sentences)
- Source URL
- Source type (academic, news, forum, industry-report)
- Significance indicators (mentions, recency, authority)
- Suggested taxonomy placement

**Output:** List of 15-30 problem candidates (1.5x target to account for filtering).

Use the WebSearch tool for each query category, then analyze results to identify distinct problems.

### Step 3: Research Phase

**Objective:** Deep analysis of each problem candidate.

For each promising candidate (up to `maxProblems * 1.5`):

1. **Gather additional sources** using WebFetch to read primary sources
2. **Analyze the problem** to extract:

   - **Problem Definition:**
     - Refined title
     - Full description (200-500 words)
     - Summary (50-100 words)
     - Historical context

   - **Taxonomy Classification:**
     - Industry name and slug
     - Domain name and slug
     - Field (if applicable)
     - Reference: `docs/research/industry-taxonomy-hierarchy.md`

   - **Problem Classification:**
     - problemType: technical | process | resource | knowledge | coordination | regulatory | market | environmental | social | ethical
     - scope: individual | team | organization | industry | global
     - maturity: emerging | growing | mature | declining
     - urgency: critical | high | medium | low

   - **Root Causes** (3-7):
     - Description, category, contribution level, evidence

   - **Consequences** (3-7):
     - Description, type, affected area, timeframe

   - **Existing Solutions** (2-5):
     - Name, description, type, effectiveness (1-10), adoption level, limitations

   - **Solution Gaps** (2-5):
     - Description, gap type, opportunity, difficulty

   - **Stakeholders** (3-6):
     - Type, description, examples, interest level, influence level

   - **Metrics:**
     - Economic impact estimate (USD)
     - Affected population/organizations
     - Trend direction
     - Research activity indicators

   - **Sources:**
     - All sources with type, title, URL, date, relevant excerpts

### Step 4: Validation Phase

**Objective:** Verify quality and assign scores.

For each researched problem:

1. **Fact Check:**
   - Verify key claims against sources
   - Check statistics are reasonable
   - Flag unverifiable claims

2. **Source Credibility:**
   - Assess reliability (0-1 scale)
   - Check publication reputation
   - Verify recency

3. **Duplicate Detection:**
   - Compare against existing problems in `research-data/`
   - Check semantic similarity
   - Decide: unique | merge | reject

4. **Calculate Scores (0-10):**

   **SEVERITY:**
   - Affected population scale
   - Economic impact magnitude
   - Quality of life impact
   - Productivity impact

   **TRACTABILITY:**
   - Technical feasibility
   - Resource requirements (inverse)
   - Existing progress
   - Barrier count (inverse)

   **NEGLECTEDNESS:**
   - Research activity (inverse)
   - Funding level (inverse)
   - Organization count (inverse)
   - Media attention (inverse)

   **IMPACT SCORE (composite):**
   ```
   = (Severity * 0.35) + (Tractability * 0.25) + (Neglectedness * 0.25) + (Urgency * 0.15)
   ```
   Where Urgency: critical=10, high=7.5, medium=5, low=2.5

5. **Confidence Assessment:**
   - Overall confidence (0-1)
   - Evidence quality: strong | moderate | weak
   - Data gaps list

**Verdict:** approved | approved_with_edits | needs_more_research | rejected

### Step 5: Synthesis & Storage Phase

**Objective:** Generate final schema-valid entries and store them.

> **IMPORTANT: Parallel-Safe Write Strategy**
>
> This skill is designed to run in parallel with other discover-problems sessions.
> To avoid conflicts, this skill ONLY writes to:
> 1. **Field-specific problem file** - One file per field, isolated from other sessions
> 2. **Session log** - Unique per session
>
> Statistics aggregation (`index.json`, `_metadata.json`) is handled by a separate
> post-processing step. **DO NOT** update index or metadata files from this skill.

For each approved problem:

1. **Generate Identifiers:**
   - UUID for problem ID
   - URL-friendly slug from title (lowercase, hyphenated)

2. **Merge Research + Validation:**
   - Apply any suggested edits
   - Ensure all required fields present
   - Validate against schema in `docs/specifications/research-result-schema.md`

3. **Write Problem Entry:**

   **File location (MUST use field-based structure):**
   ```
   research-viewer/public/research-data/industries/{industry-slug}/{domain-slug}/fields/{field-slug}.json
   ```

   **If field is not specified:** Use `general.json` as the field file for domain-general problems.

   **File structure (FieldProblemsFile):**
   ```json
   {
     "field": {
       "id": "uuid",
       "name": "Field Name",
       "slug": "field-slug",
       "description": "Field description..."
     },
     "domain": {
       "id": "uuid",
       "name": "Domain Name",
       "slug": "domain-slug"
     },
     "industry": {
       "id": "uuid",
       "name": "Industry Name",
       "slug": "industry-slug"
     },
     "problems": [...]
   }
   ```

   If the field file exists, **append** new problems to the `problems` array.
   If not, **create** the file with the field/domain/industry metadata and problems array.

   **Problem JSON structure:**
   ```json
   {
     "id": "uuid",
     "title": "Problem Title",
     "slug": "problem-title-slug",
     "description": "Full description...",
     "summary": "Brief summary...",
     "industry": { "id": "uuid", "name": "Industry Name", "slug": "industry-slug" },
     "domain": { "id": "uuid", "name": "Domain Name", "slug": "domain-slug" },
     "field": { "id": "uuid", "name": "Field Name", "slug": "field-slug" },
     "problemType": "technical",
     "problemSubtypes": ["tag1", "tag2"],
     "scope": "organization",
     "maturity": "growing",
     "urgency": "high",
     "severity": { "overall": 7.5, ... },
     "tractability": { "overall": 5.5, ... },
     "neglectedness": { "overall": 4, ... },
     "impactScore": 72,
     "rootCauses": [...],
     "consequences": [...],
     "existingSolutions": [...],
     "solutionGaps": [...],
     "stakeholders": [...],
     "sources": [...],
     "tags": [...],
     "keywords": [...],
     "metrics": {...},
     "researchSession": "session-id",
     "confidence": 0.85,
     "verificationStatus": "ai-verified",
     "createdAt": "2026-01-20T14:35:00Z",
     "updatedAt": "2026-01-20T14:35:00Z",
     "version": 1
   }
   ```

4. **DO NOT Update Index Files:**

   > **Statistics are aggregated separately.** Do not modify:
   > - `index.json`
   > - `_metadata.json` files
   >
   > After discovery sessions complete, run the aggregation to update statistics.

5. **Finalize Session Log:**
   - Write complete session to `research-viewer/public/research-data/sessions/{session-id}.json`
   - Include all steps, results, errors, and metrics

### Step 6: Report Results

Present a summary to the user:

```markdown
## Problem Discovery Complete

**Session:** {session-id}
**Target:** {industry} > {domain} > {field}
**Duration:** {duration}

### Results Summary

| Metric | Count |
|--------|-------|
| Problems Discovered | {discovered} |
| Problems Stored | {stored} |
| Duplicates Skipped | {duplicates} |
| Low Confidence Skipped | {low_confidence} |

### Top Problems by Impact Score

1. **{title}** (Score: {score})
   - {summary}
   - Severity: {severity} | Tractability: {tractability} | Neglectedness: {neglectedness}

2. ...

### Files Updated

- `research-viewer/public/research-data/industries/{industry}/{domain}/fields/{field}.json`
- `research-viewer/public/research-data/sessions/{session-id}.json`

### Next Steps

- Run `/discover-problems {different-target}` to research another area in parallel
- After all parallel sessions complete, run statistics aggregation to update index files
- Review problems at `research-viewer/public/research-data/` directory
```

## Quality Guidelines

1. **Every problem must have verifiable sources** - No problem without at least one credible reference
2. **Avoid trivial problems** - Focus on significant, impactful challenges
3. **Proper taxonomy classification** - Reference `docs/research/industry-taxonomy-hierarchy.md`
4. **No duplicates** - Check existing problems before adding
5. **Schema compliance** - Validate against `docs/specifications/research-result-schema.md`
6. **Confidence thresholds** - Skip problems below minConfidence (default 0.7)

## Error Handling

- If web search fails, retry up to 3 times with different query variations
- If a source URL is inaccessible, note it and continue with other sources
- If validation fails, log the issue and skip the problem
- Always complete the session log even if errors occur

## Directory Structure Reference

```
research-viewer/public/research-data/
├── index.json                           # Master index (updated by aggregation, NOT by this skill)
├── industries/
│   ├── technology-software/
│   │   ├── _metadata.json               # Industry metadata (updated by aggregation)
│   │   ├── software-engineering/
│   │   │   ├── _metadata.json           # Domain metadata (updated by aggregation)
│   │   │   └── fields/                  # Field-specific problem files (THIS SKILL WRITES HERE)
│   │   │       ├── web-development.json
│   │   │       ├── mobile-development.json
│   │   │       ├── cloud-computing.json
│   │   │       └── general.json         # For domain-general problems without specific field
│   │   └── ...
│   └── ...
└── sessions/
    └── {session-id}.json                # Session logs (THIS SKILL WRITES HERE)
```

**Note:** The `problems.json` file at domain level is DEPRECATED. Always use the `fields/` subfolder structure.

## Important Notes

- This workflow may take significant time for deep research - keep the user informed of progress
- Use parallel searches where possible to speed up discovery
- Prioritize quality over quantity - better to have 5 excellent problems than 10 mediocre ones
- All timestamps should be in ISO 8601 format (UTC)
- Slugs should be lowercase, hyphenated, max 200 characters
