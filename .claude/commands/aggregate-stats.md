---
description: Aggregate statistics from field-level problem files and update index/metadata files. Run this after discover-problems sessions complete.
---

## Overview

This skill scans all field-level problem files and aggregates statistics into the index and metadata files. It should be run after one or more `discover-problems` sessions complete to update the centralized statistics.

**When to use:**
- After completing parallel `discover-problems` sessions
- After manually adding/editing problem files
- To rebuild statistics from scratch

## Data Location

All research data is stored in: `research-viewer/public/research-data/`

## Workflow

### Step 1: Scan All Field Files

Recursively find all field problem files:

```
research-viewer/public/research-data/industries/{industry}/{domain}/fields/*.json
```

For each file, extract:
- Industry, domain, and field metadata
- Problem count
- Average severity, tractability, neglectedness
- Problem types distribution

### Step 2: Aggregate Domain Statistics

For each domain, aggregate from all its field files:

```json
{
  "statistics": {
    "totalProblems": <sum of all field problems>,
    "totalFields": <count of field files>,
    "avgSeverity": <weighted average>,
    "avgTractability": <weighted average>,
    "fieldProblems": {
      "<field-slug>": <count>,
      ...
    }
  }
}
```

Update file: `industries/{industry}/{domain}/_metadata.json`

### Step 3: Aggregate Industry Statistics

For each industry, aggregate from all its domains:

```json
{
  "statistics": {
    "totalProblems": <sum from all domains>,
    "avgSeverity": <weighted average>,
    "avgTractability": <weighted average>,
    "topProblemTypes": [...]
  },
  "domains": [
    {
      "id": "...",
      "name": "...",
      "slug": "...",
      "fieldCount": <count>,
      "problemCount": <count>
    }
  ]
}
```

Update file: `industries/{industry}/_metadata.json`

### Step 4: Update Master Index

Aggregate global statistics:

```json
{
  "version": "1.0.0",
  "lastUpdated": "<current ISO timestamp>",
  "statistics": {
    "totalProblems": <global count>,
    "totalIndustries": <count>,
    "totalDomains": <count>,
    "totalFields": <count>,
    "problemsByIndustry": {
      "<industry-slug>": <count>,
      ...
    },
    "lastResearchSession": "<timestamp>"
  },
  "industries": [
    {
      "id": "...",
      "name": "...",
      "slug": "...",
      "path": "industries/<slug>",
      "domainCount": <count>,
      "problemCount": <count>,
      "lastUpdated": "<timestamp>"
    }
  ],
  "recentSessions": [<last 10 sessions>]
}
```

Update file: `index.json`

### Step 5: Scan Session Files

Find all session files in `sessions/` directory:
- Sort by timestamp (newest first)
- Keep the 10 most recent for the index
- Extract summary info for each

### Step 6: Update Research Checklist

Update the research checklist at `docs/research/research-checklist.md`:

1. **Update Quick Stats table** with new aggregated values:
   - Total problems per industry
   - Average severity and tractability
   - Field counts and completion status

2. **Mark completed fields** - For any field that now has problems in the research data:
   - Change status from `⬜` to `✅`
   - Add the current date in "Last Updated" column
   - Add the problem count in "Problems Found" column

3. **Update the Total row** with:
   - Total problems: `{totalProblems}`
   - Total fields completed: `{totalFields}`
   - Average severity: `{avgSeverity}`
   - Average tractability: `{avgTractability}`

4. **Update the footer** with the new aggregation timestamp

### Step 7: Report Summary

```markdown
## Statistics Aggregation Complete

**Timestamp:** {timestamp}

### Global Statistics

| Metric | Value |
|--------|-------|
| Total Problems | {count} |
| Total Industries | {count} |
| Total Domains | {count} |
| Total Fields | {count} |

### By Industry

| Industry | Domains | Problems |
|----------|---------|----------|
| {name} | {count} | {count} |
| ... | ... | ... |

### Files Updated

- `research-viewer/public/research-data/index.json`
- `research-viewer/public/research-data/industries/{industry}/_metadata.json` (for each industry)
- `research-viewer/public/research-data/industries/{industry}/{domain}/_metadata.json` (for each domain)
- `docs/research/research-checklist.md`
```

## Implementation Notes

1. **Read all field files first** before writing any metadata to ensure consistency
2. **Preserve existing metadata fields** that are not statistics (e.g., descriptions, icons, colors)
3. **Handle missing directories gracefully** - create if needed
4. **Use ISO 8601 timestamps** in UTC
5. **Sort industries/domains alphabetically** in the index for consistent ordering

## Example Execution

```bash
# After running multiple discover-problems in parallel:
/discover-problems technology-software software-engineering web-development &
/discover-problems technology-software software-engineering mobile-development &
/discover-problems healthcare clinical-care &

# Wait for all to complete, then aggregate:
/aggregate-stats
```
