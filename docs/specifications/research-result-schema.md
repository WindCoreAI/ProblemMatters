# Research Result Schema Specification

**Version**: 1.0.0
**Status**: Draft
**Last Updated**: 2026-01-20

---

## Overview

This document defines the JSON schema for storing industry problem research results locally. The schema is designed to:

1. Guide AI/agentic research output storage
2. Enable the web application to load and display results
3. Support search and filtering by industry, domain, and field
4. Maintain data consistency and validation
5. Support incremental updates and versioning

---

## Schema Architecture

### File Organization

```
research-data/
├── index.json                           # Master index of all research
├── industries/
│   ├── technology/
│   │   ├── _metadata.json               # Industry-level metadata
│   │   ├── software-engineering/
│   │   │   ├── _metadata.json           # Domain-level metadata
│   │   │   ├── problems.json            # Problems for this domain
│   │   │   └── fields/
│   │   │       ├── web-development.json # Field-specific problems
│   │   │       └── ...
│   │   └── ...
│   └── ...
├── schemas/
│   ├── problem.schema.json
│   ├── industry.schema.json
│   └── research-session.schema.json
└── sessions/
    └── {session-id}.json                # Research session logs
```

---

## Core Schemas

### 1. Master Index Schema (`index.json`)

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://problemmatters.io/schemas/index.schema.json",
  "title": "Research Index",
  "description": "Master index of all research results",
  "type": "object",
  "required": ["version", "lastUpdated", "statistics", "industries"],
  "properties": {
    "version": {
      "type": "string",
      "pattern": "^\\d+\\.\\d+\\.\\d+$",
      "description": "Schema version following semver"
    },
    "lastUpdated": {
      "type": "string",
      "format": "date-time",
      "description": "ISO 8601 timestamp of last update"
    },
    "statistics": {
      "$ref": "#/definitions/IndexStatistics"
    },
    "industries": {
      "type": "array",
      "items": {
        "$ref": "#/definitions/IndustryReference"
      }
    },
    "recentSessions": {
      "type": "array",
      "items": {
        "$ref": "#/definitions/SessionReference"
      },
      "maxItems": 50
    }
  },
  "definitions": {
    "IndexStatistics": {
      "type": "object",
      "required": ["totalProblems", "totalIndustries", "totalDomains", "totalFields"],
      "properties": {
        "totalProblems": { "type": "integer", "minimum": 0 },
        "totalIndustries": { "type": "integer", "minimum": 0 },
        "totalDomains": { "type": "integer", "minimum": 0 },
        "totalFields": { "type": "integer", "minimum": 0 },
        "problemsByIndustry": {
          "type": "object",
          "additionalProperties": { "type": "integer" }
        },
        "lastResearchSession": {
          "type": "string",
          "format": "date-time"
        }
      }
    },
    "IndustryReference": {
      "type": "object",
      "required": ["id", "name", "slug", "path", "domainCount", "problemCount"],
      "properties": {
        "id": { "type": "string", "format": "uuid" },
        "name": { "type": "string" },
        "slug": { "type": "string", "pattern": "^[a-z0-9-]+$" },
        "path": { "type": "string" },
        "domainCount": { "type": "integer", "minimum": 0 },
        "problemCount": { "type": "integer", "minimum": 0 },
        "lastUpdated": { "type": "string", "format": "date-time" }
      }
    },
    "SessionReference": {
      "type": "object",
      "required": ["id", "timestamp", "targetIndustry"],
      "properties": {
        "id": { "type": "string", "format": "uuid" },
        "timestamp": { "type": "string", "format": "date-time" },
        "targetIndustry": { "type": "string" },
        "targetDomain": { "type": "string" },
        "problemsDiscovered": { "type": "integer", "minimum": 0 },
        "status": {
          "type": "string",
          "enum": ["completed", "in-progress", "failed"]
        }
      }
    }
  }
}
```

### 2. Industry Metadata Schema (`_metadata.json`)

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://problemmatters.io/schemas/industry.schema.json",
  "title": "Industry Metadata",
  "description": "Metadata for an industry category",
  "type": "object",
  "required": ["id", "name", "slug", "description", "domains", "createdAt", "updatedAt"],
  "properties": {
    "id": {
      "type": "string",
      "format": "uuid",
      "description": "Unique identifier for the industry"
    },
    "name": {
      "type": "string",
      "minLength": 1,
      "maxLength": 200,
      "description": "Human-readable industry name"
    },
    "slug": {
      "type": "string",
      "pattern": "^[a-z0-9-]+$",
      "description": "URL-friendly identifier"
    },
    "description": {
      "type": "string",
      "maxLength": 2000,
      "description": "Detailed description of the industry"
    },
    "icon": {
      "type": "string",
      "description": "Icon identifier (e.g., Lucide icon name)"
    },
    "color": {
      "type": "string",
      "pattern": "^#[0-9A-Fa-f]{6}$",
      "description": "Brand color in hex format"
    },
    "keywords": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Search keywords for this industry"
    },
    "naicsCode": {
      "type": "string",
      "description": "North American Industry Classification System code"
    },
    "sicCode": {
      "type": "string",
      "description": "Standard Industrial Classification code"
    },
    "domains": {
      "type": "array",
      "items": {
        "$ref": "#/definitions/DomainReference"
      }
    },
    "statistics": {
      "$ref": "#/definitions/IndustryStatistics"
    },
    "createdAt": {
      "type": "string",
      "format": "date-time"
    },
    "updatedAt": {
      "type": "string",
      "format": "date-time"
    }
  },
  "definitions": {
    "DomainReference": {
      "type": "object",
      "required": ["id", "name", "slug", "fieldCount", "problemCount"],
      "properties": {
        "id": { "type": "string", "format": "uuid" },
        "name": { "type": "string" },
        "slug": { "type": "string", "pattern": "^[a-z0-9-]+$" },
        "description": { "type": "string" },
        "fieldCount": { "type": "integer", "minimum": 0 },
        "problemCount": { "type": "integer", "minimum": 0 }
      }
    },
    "IndustryStatistics": {
      "type": "object",
      "properties": {
        "totalProblems": { "type": "integer", "minimum": 0 },
        "totalDomains": { "type": "integer", "minimum": 0 },
        "totalFields": { "type": "integer", "minimum": 0 },
        "avgSeverity": { "type": "number", "minimum": 0, "maximum": 10 },
        "avgTractability": { "type": "number", "minimum": 0, "maximum": 10 },
        "topProblemTypes": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "type": { "type": "string" },
              "count": { "type": "integer" }
            }
          }
        }
      }
    }
  }
}
```

### 3. Problem Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://problemmatters.io/schemas/problem.schema.json",
  "title": "Problem",
  "description": "A discovered industry problem",
  "type": "object",
  "required": [
    "id", "title", "slug", "description", "industry", "domain",
    "problemType", "severity", "createdAt", "updatedAt"
  ],
  "properties": {
    "id": {
      "type": "string",
      "format": "uuid",
      "description": "Unique problem identifier"
    },
    "title": {
      "type": "string",
      "minLength": 10,
      "maxLength": 300,
      "description": "Concise problem title"
    },
    "slug": {
      "type": "string",
      "pattern": "^[a-z0-9-]+$",
      "maxLength": 200,
      "description": "URL-friendly identifier"
    },
    "description": {
      "type": "string",
      "minLength": 50,
      "maxLength": 5000,
      "description": "Detailed problem description"
    },
    "summary": {
      "type": "string",
      "maxLength": 500,
      "description": "Brief one-paragraph summary"
    },

    "industry": {
      "$ref": "#/definitions/TaxonomyReference",
      "description": "Parent industry classification"
    },
    "domain": {
      "$ref": "#/definitions/TaxonomyReference",
      "description": "Domain within the industry"
    },
    "field": {
      "$ref": "#/definitions/TaxonomyReference",
      "description": "Specific field (optional)"
    },
    "subfield": {
      "$ref": "#/definitions/TaxonomyReference",
      "description": "Subfield specialization (optional)"
    },

    "problemType": {
      "type": "string",
      "enum": [
        "technical",
        "process",
        "resource",
        "knowledge",
        "coordination",
        "regulatory",
        "market",
        "environmental",
        "social",
        "ethical"
      ],
      "description": "Primary problem classification"
    },
    "problemSubtypes": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Additional problem type tags"
    },

    "scope": {
      "type": "string",
      "enum": ["individual", "team", "organization", "industry", "global"],
      "description": "Scale of the problem's impact"
    },
    "maturity": {
      "type": "string",
      "enum": ["emerging", "growing", "mature", "declining"],
      "description": "Problem lifecycle stage"
    },
    "urgency": {
      "type": "string",
      "enum": ["critical", "high", "medium", "low"],
      "description": "Time sensitivity of the problem"
    },

    "severity": {
      "$ref": "#/definitions/SeverityScore"
    },
    "tractability": {
      "$ref": "#/definitions/TractabilityScore"
    },
    "neglectedness": {
      "$ref": "#/definitions/NeglectednessScore"
    },
    "impactScore": {
      "type": "number",
      "minimum": 0,
      "maximum": 100,
      "description": "Composite impact score (calculated)"
    },

    "rootCauses": {
      "type": "array",
      "items": {
        "$ref": "#/definitions/RootCause"
      },
      "description": "Underlying causes of the problem"
    },
    "consequences": {
      "type": "array",
      "items": {
        "$ref": "#/definitions/Consequence"
      },
      "description": "Effects and impacts of the problem"
    },
    "existingSolutions": {
      "type": "array",
      "items": {
        "$ref": "#/definitions/ExistingSolution"
      },
      "description": "Current approaches to address the problem"
    },
    "solutionGaps": {
      "type": "array",
      "items": {
        "$ref": "#/definitions/SolutionGap"
      },
      "description": "Areas where solutions are lacking"
    },

    "stakeholders": {
      "type": "array",
      "items": {
        "$ref": "#/definitions/Stakeholder"
      },
      "description": "Parties affected by or involved in the problem"
    },

    "relatedProblems": {
      "type": "array",
      "items": {
        "$ref": "#/definitions/ProblemRelation"
      },
      "description": "Connections to other problems"
    },

    "sources": {
      "type": "array",
      "items": {
        "$ref": "#/definitions/Source"
      },
      "minItems": 1,
      "description": "Evidence and reference sources"
    },

    "tags": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Searchable tags"
    },
    "keywords": {
      "type": "array",
      "items": { "type": "string" },
      "description": "SEO and search keywords"
    },

    "metrics": {
      "$ref": "#/definitions/ProblemMetrics"
    },

    "researchSession": {
      "type": "string",
      "format": "uuid",
      "description": "ID of the research session that discovered this"
    },
    "confidence": {
      "type": "number",
      "minimum": 0,
      "maximum": 1,
      "description": "AI confidence score for this problem"
    },
    "verificationStatus": {
      "type": "string",
      "enum": ["unverified", "ai-verified", "human-verified", "disputed"],
      "default": "unverified"
    },

    "createdAt": {
      "type": "string",
      "format": "date-time"
    },
    "updatedAt": {
      "type": "string",
      "format": "date-time"
    },
    "version": {
      "type": "integer",
      "minimum": 1,
      "default": 1
    }
  },
  "definitions": {
    "TaxonomyReference": {
      "type": "object",
      "required": ["id", "name", "slug"],
      "properties": {
        "id": { "type": "string", "format": "uuid" },
        "name": { "type": "string" },
        "slug": { "type": "string" }
      }
    },

    "SeverityScore": {
      "type": "object",
      "required": ["overall"],
      "properties": {
        "overall": {
          "type": "number",
          "minimum": 0,
          "maximum": 10,
          "description": "Overall severity (0-10)"
        },
        "affectedPopulation": {
          "type": "object",
          "properties": {
            "score": { "type": "number", "minimum": 0, "maximum": 10 },
            "estimate": { "type": "string" },
            "unit": { "type": "string", "enum": ["individuals", "organizations", "regions"] }
          }
        },
        "economicImpact": {
          "type": "object",
          "properties": {
            "score": { "type": "number", "minimum": 0, "maximum": 10 },
            "estimateUSD": { "type": "number" },
            "timeframe": { "type": "string" }
          }
        },
        "qualityOfLife": {
          "type": "number",
          "minimum": 0,
          "maximum": 10
        },
        "productivity": {
          "type": "number",
          "minimum": 0,
          "maximum": 10
        }
      }
    },

    "TractabilityScore": {
      "type": "object",
      "required": ["overall"],
      "properties": {
        "overall": {
          "type": "number",
          "minimum": 0,
          "maximum": 10,
          "description": "Overall tractability (0=impossible, 10=easily solvable)"
        },
        "technicalFeasibility": {
          "type": "number",
          "minimum": 0,
          "maximum": 10
        },
        "resourceRequirements": {
          "type": "number",
          "minimum": 0,
          "maximum": 10,
          "description": "Higher = fewer resources needed"
        },
        "existingProgress": {
          "type": "number",
          "minimum": 0,
          "maximum": 10
        },
        "barriers": {
          "type": "array",
          "items": { "type": "string" }
        }
      }
    },

    "NeglectednessScore": {
      "type": "object",
      "required": ["overall"],
      "properties": {
        "overall": {
          "type": "number",
          "minimum": 0,
          "maximum": 10,
          "description": "How neglected (0=saturated, 10=completely ignored)"
        },
        "attentionLevel": {
          "type": "string",
          "enum": ["saturated", "well-covered", "moderate", "underserved", "neglected"]
        },
        "activeResearchers": {
          "type": "string",
          "description": "Estimate of people working on this"
        },
        "fundingLevel": {
          "type": "string",
          "description": "Estimated funding"
        }
      }
    },

    "RootCause": {
      "type": "object",
      "required": ["description"],
      "properties": {
        "description": { "type": "string" },
        "category": {
          "type": "string",
          "enum": ["technical", "organizational", "economic", "regulatory", "cultural", "environmental"]
        },
        "contributionLevel": {
          "type": "string",
          "enum": ["primary", "secondary", "contributing"]
        }
      }
    },

    "Consequence": {
      "type": "object",
      "required": ["description"],
      "properties": {
        "description": { "type": "string" },
        "type": {
          "type": "string",
          "enum": ["direct", "indirect", "cascading"]
        },
        "affectedArea": { "type": "string" },
        "timeframe": {
          "type": "string",
          "enum": ["immediate", "short-term", "medium-term", "long-term"]
        }
      }
    },

    "ExistingSolution": {
      "type": "object",
      "required": ["name", "description"],
      "properties": {
        "name": { "type": "string" },
        "description": { "type": "string" },
        "type": {
          "type": "string",
          "enum": ["tool", "methodology", "framework", "product", "service", "policy", "standard"]
        },
        "effectiveness": {
          "type": "number",
          "minimum": 0,
          "maximum": 10
        },
        "adoption": {
          "type": "string",
          "enum": ["experimental", "early", "growing", "mainstream", "declining"]
        },
        "limitations": {
          "type": "array",
          "items": { "type": "string" }
        },
        "url": {
          "type": "string",
          "format": "uri"
        }
      }
    },

    "SolutionGap": {
      "type": "object",
      "required": ["description"],
      "properties": {
        "description": { "type": "string" },
        "gapType": {
          "type": "string",
          "enum": ["coverage", "quality", "accessibility", "cost", "integration", "scale", "awareness"]
        },
        "opportunity": { "type": "string" },
        "difficulty": {
          "type": "string",
          "enum": ["low", "medium", "high", "very-high"]
        }
      }
    },

    "Stakeholder": {
      "type": "object",
      "required": ["type", "description"],
      "properties": {
        "type": {
          "type": "string",
          "enum": ["affected", "contributor", "decision-maker", "funder", "expert"]
        },
        "description": { "type": "string" },
        "examples": {
          "type": "array",
          "items": { "type": "string" }
        },
        "interest": {
          "type": "string",
          "enum": ["low", "medium", "high"]
        },
        "influence": {
          "type": "string",
          "enum": ["low", "medium", "high"]
        }
      }
    },

    "ProblemRelation": {
      "type": "object",
      "required": ["problemId", "relationType"],
      "properties": {
        "problemId": { "type": "string", "format": "uuid" },
        "problemTitle": { "type": "string" },
        "relationType": {
          "type": "string",
          "enum": ["causes", "caused-by", "blocks", "blocked-by", "related-to", "subset-of", "superset-of", "contradicts"]
        },
        "strength": {
          "type": "number",
          "minimum": 0,
          "maximum": 1
        }
      }
    },

    "Source": {
      "type": "object",
      "required": ["type", "title"],
      "properties": {
        "type": {
          "type": "string",
          "enum": ["academic", "industry-report", "news", "patent", "forum", "expert-interview", "survey", "government", "ngo"]
        },
        "title": { "type": "string" },
        "authors": {
          "type": "array",
          "items": { "type": "string" }
        },
        "url": { "type": "string", "format": "uri" },
        "publishedAt": { "type": "string", "format": "date" },
        "accessedAt": { "type": "string", "format": "date" },
        "publisher": { "type": "string" },
        "doi": { "type": "string" },
        "credibilityScore": {
          "type": "number",
          "minimum": 0,
          "maximum": 1
        },
        "relevantExcerpt": { "type": "string" }
      }
    },

    "ProblemMetrics": {
      "type": "object",
      "properties": {
        "searchVolume": {
          "type": "integer",
          "description": "Monthly search volume for related terms"
        },
        "academicPapers": {
          "type": "integer",
          "description": "Number of academic papers in last 5 years"
        },
        "patentApplications": {
          "type": "integer",
          "description": "Related patent applications"
        },
        "mediaArticles": {
          "type": "integer",
          "description": "News articles in last year"
        },
        "trendDirection": {
          "type": "string",
          "enum": ["increasing", "stable", "decreasing"]
        },
        "dataCollectedAt": {
          "type": "string",
          "format": "date-time"
        }
      }
    }
  }
}
```

### 4. Research Session Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://problemmatters.io/schemas/research-session.schema.json",
  "title": "Research Session",
  "description": "Log of an AI research session",
  "type": "object",
  "required": ["id", "startedAt", "target", "status"],
  "properties": {
    "id": {
      "type": "string",
      "format": "uuid"
    },
    "startedAt": {
      "type": "string",
      "format": "date-time"
    },
    "completedAt": {
      "type": "string",
      "format": "date-time"
    },
    "target": {
      "type": "object",
      "required": ["industry"],
      "properties": {
        "industry": { "type": "string" },
        "domain": { "type": "string" },
        "field": { "type": "string" },
        "specificTopic": { "type": "string" }
      }
    },
    "configuration": {
      "type": "object",
      "properties": {
        "model": { "type": "string" },
        "maxProblems": { "type": "integer" },
        "minConfidence": { "type": "number" },
        "sourcesRequired": { "type": "boolean" },
        "depthLevel": {
          "type": "string",
          "enum": ["shallow", "standard", "deep", "exhaustive"]
        }
      }
    },
    "status": {
      "type": "string",
      "enum": ["queued", "in-progress", "completed", "failed", "cancelled"]
    },
    "results": {
      "type": "object",
      "properties": {
        "problemsDiscovered": { "type": "integer" },
        "problemsStored": { "type": "integer" },
        "duplicatesSkipped": { "type": "integer" },
        "lowConfidenceSkipped": { "type": "integer" },
        "problemIds": {
          "type": "array",
          "items": { "type": "string", "format": "uuid" }
        }
      }
    },
    "steps": {
      "type": "array",
      "items": {
        "$ref": "#/definitions/ResearchStep"
      }
    },
    "errors": {
      "type": "array",
      "items": {
        "$ref": "#/definitions/SessionError"
      }
    },
    "metrics": {
      "type": "object",
      "properties": {
        "durationMs": { "type": "integer" },
        "tokensUsed": { "type": "integer" },
        "apiCalls": { "type": "integer" },
        "sourcesConsulted": { "type": "integer" }
      }
    }
  },
  "definitions": {
    "ResearchStep": {
      "type": "object",
      "required": ["step", "action", "timestamp"],
      "properties": {
        "step": { "type": "integer" },
        "action": { "type": "string" },
        "timestamp": { "type": "string", "format": "date-time" },
        "durationMs": { "type": "integer" },
        "input": { "type": "object" },
        "output": { "type": "object" },
        "status": {
          "type": "string",
          "enum": ["pending", "running", "completed", "failed", "skipped"]
        }
      }
    },
    "SessionError": {
      "type": "object",
      "required": ["timestamp", "message"],
      "properties": {
        "timestamp": { "type": "string", "format": "date-time" },
        "step": { "type": "integer" },
        "code": { "type": "string" },
        "message": { "type": "string" },
        "recoverable": { "type": "boolean" },
        "recovered": { "type": "boolean" }
      }
    }
  }
}
```

---

## Example Data

### Example Problem Entry

```json
{
  "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "title": "Legacy System Integration Complexity in Enterprise Software Modernization",
  "slug": "legacy-system-integration-complexity-enterprise-modernization",
  "description": "Organizations face significant challenges when modernizing legacy systems, particularly in maintaining interoperability with existing infrastructure. The complexity arises from undocumented dependencies, proprietary protocols, and the lack of modern API interfaces. This results in extended timelines, budget overruns, and increased technical debt during digital transformation initiatives.",
  "summary": "Enterprise modernization projects struggle with integrating legacy systems due to undocumented dependencies and lack of standard APIs.",

  "industry": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Technology & Software",
    "slug": "technology-software"
  },
  "domain": {
    "id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
    "name": "Software Engineering",
    "slug": "software-engineering"
  },
  "field": {
    "id": "6ba7b811-9dad-11d1-80b4-00c04fd430c8",
    "name": "Enterprise Architecture",
    "slug": "enterprise-architecture"
  },

  "problemType": "technical",
  "problemSubtypes": ["integration", "modernization", "technical-debt"],
  "scope": "organization",
  "maturity": "mature",
  "urgency": "high",

  "severity": {
    "overall": 7.5,
    "affectedPopulation": {
      "score": 8,
      "estimate": "500,000+",
      "unit": "organizations"
    },
    "economicImpact": {
      "score": 8,
      "estimateUSD": 150000000000,
      "timeframe": "annual"
    },
    "qualityOfLife": 5,
    "productivity": 8
  },

  "tractability": {
    "overall": 5.5,
    "technicalFeasibility": 6,
    "resourceRequirements": 4,
    "existingProgress": 6,
    "barriers": [
      "Vendor lock-in",
      "Lack of documentation",
      "Organizational resistance",
      "Skills shortage"
    ]
  },

  "neglectedness": {
    "overall": 4,
    "attentionLevel": "well-covered",
    "activeResearchers": "10,000+",
    "fundingLevel": "Moderate - $2B+ in consulting annually"
  },

  "impactScore": 72,

  "rootCauses": [
    {
      "description": "Decades of incremental changes without architectural documentation",
      "category": "technical",
      "contributionLevel": "primary"
    },
    {
      "description": "Vendor lock-in through proprietary protocols and formats",
      "category": "economic",
      "contributionLevel": "primary"
    },
    {
      "description": "Organizational siloing of knowledge",
      "category": "organizational",
      "contributionLevel": "secondary"
    }
  ],

  "consequences": [
    {
      "description": "Digital transformation projects exceed budget by 45% on average",
      "type": "direct",
      "affectedArea": "Project delivery",
      "timeframe": "immediate"
    },
    {
      "description": "Increased security vulnerabilities in partially modernized systems",
      "type": "cascading",
      "affectedArea": "Security",
      "timeframe": "medium-term"
    }
  ],

  "existingSolutions": [
    {
      "name": "Strangler Fig Pattern",
      "description": "Incremental replacement of legacy components by routing requests through a facade",
      "type": "methodology",
      "effectiveness": 7,
      "adoption": "growing",
      "limitations": [
        "Requires significant upfront investment",
        "Complex routing logic maintenance"
      ]
    },
    {
      "name": "API Gateway Integration",
      "description": "Exposing legacy functionality through modern REST/GraphQL APIs",
      "type": "tool",
      "effectiveness": 6,
      "adoption": "mainstream",
      "limitations": [
        "Performance overhead",
        "May not cover all integration patterns"
      ]
    }
  ],

  "solutionGaps": [
    {
      "description": "Automated dependency discovery for undocumented legacy systems",
      "gapType": "coverage",
      "opportunity": "AI-powered codebase analysis and documentation generation",
      "difficulty": "high"
    },
    {
      "description": "Affordable migration paths for small-medium enterprises",
      "gapType": "cost",
      "opportunity": "Open-source modernization frameworks",
      "difficulty": "medium"
    }
  ],

  "stakeholders": [
    {
      "type": "affected",
      "description": "Enterprise IT departments managing legacy systems",
      "examples": ["CIOs", "Enterprise Architects", "DevOps Teams"],
      "interest": "high",
      "influence": "high"
    },
    {
      "type": "contributor",
      "description": "System integrators and consultancies",
      "examples": ["Accenture", "Deloitte", "IBM Global Services"],
      "interest": "high",
      "influence": "medium"
    }
  ],

  "relatedProblems": [
    {
      "problemId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "problemTitle": "Technical Debt Accumulation in Long-lived Codebases",
      "relationType": "causes",
      "strength": 0.8
    },
    {
      "problemId": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
      "problemTitle": "Skills Gap in Legacy Technology Maintenance",
      "relationType": "related-to",
      "strength": 0.6
    }
  ],

  "sources": [
    {
      "type": "industry-report",
      "title": "Legacy System Modernization: Global Market Analysis",
      "authors": ["Gartner Research"],
      "url": "https://www.gartner.com/en/documents/legacy-modernization-2024",
      "publishedAt": "2024-03-15",
      "accessedAt": "2026-01-15",
      "publisher": "Gartner",
      "credibilityScore": 0.95,
      "relevantExcerpt": "70% of enterprise modernization projects exceed their initial budget by at least 25%"
    },
    {
      "type": "academic",
      "title": "Challenges in Legacy System Migration: A Systematic Review",
      "authors": ["Smith, J.", "Johnson, K.", "Williams, R."],
      "url": "https://doi.org/10.1109/TSE.2024.1234567",
      "publishedAt": "2024-06-01",
      "publisher": "IEEE Transactions on Software Engineering",
      "doi": "10.1109/TSE.2024.1234567",
      "credibilityScore": 0.9
    }
  ],

  "tags": ["legacy-systems", "modernization", "enterprise", "integration", "digital-transformation"],
  "keywords": ["legacy system integration", "enterprise modernization", "digital transformation challenges"],

  "metrics": {
    "searchVolume": 12400,
    "academicPapers": 847,
    "patentApplications": 234,
    "mediaArticles": 1523,
    "trendDirection": "increasing",
    "dataCollectedAt": "2026-01-15T00:00:00Z"
  },

  "researchSession": "e47ac10b-58cc-4372-a567-0e02b2c3d480",
  "confidence": 0.92,
  "verificationStatus": "ai-verified",

  "createdAt": "2026-01-15T10:30:00Z",
  "updatedAt": "2026-01-15T10:30:00Z",
  "version": 1
}
```

---

## Validation & Utilities

### TypeScript Types

```typescript
// types/research.ts

export interface Problem {
  id: string;
  title: string;
  slug: string;
  description: string;
  summary?: string;

  industry: TaxonomyReference;
  domain: TaxonomyReference;
  field?: TaxonomyReference;
  subfield?: TaxonomyReference;

  problemType: ProblemType;
  problemSubtypes?: string[];
  scope: ProblemScope;
  maturity: ProblemMaturity;
  urgency: Urgency;

  severity: SeverityScore;
  tractability: TractabilityScore;
  neglectedness: NeglectednessScore;
  impactScore: number;

  rootCauses: RootCause[];
  consequences: Consequence[];
  existingSolutions: ExistingSolution[];
  solutionGaps: SolutionGap[];
  stakeholders: Stakeholder[];
  relatedProblems: ProblemRelation[];

  sources: Source[];
  tags: string[];
  keywords: string[];
  metrics?: ProblemMetrics;

  researchSession?: string;
  confidence: number;
  verificationStatus: VerificationStatus;

  createdAt: string;
  updatedAt: string;
  version: number;
}

export type ProblemType =
  | 'technical' | 'process' | 'resource' | 'knowledge'
  | 'coordination' | 'regulatory' | 'market'
  | 'environmental' | 'social' | 'ethical';

export type ProblemScope =
  | 'individual' | 'team' | 'organization' | 'industry' | 'global';

export type ProblemMaturity =
  | 'emerging' | 'growing' | 'mature' | 'declining';

export type Urgency = 'critical' | 'high' | 'medium' | 'low';

export type VerificationStatus =
  | 'unverified' | 'ai-verified' | 'human-verified' | 'disputed';

export interface TaxonomyReference {
  id: string;
  name: string;
  slug: string;
}

export interface SeverityScore {
  overall: number;
  affectedPopulation?: {
    score: number;
    estimate: string;
    unit: 'individuals' | 'organizations' | 'regions';
  };
  economicImpact?: {
    score: number;
    estimateUSD: number;
    timeframe: string;
  };
  qualityOfLife?: number;
  productivity?: number;
}

export interface TractabilityScore {
  overall: number;
  technicalFeasibility?: number;
  resourceRequirements?: number;
  existingProgress?: number;
  barriers?: string[];
}

export interface NeglectednessScore {
  overall: number;
  attentionLevel?: 'saturated' | 'well-covered' | 'moderate' | 'underserved' | 'neglected';
  activeResearchers?: string;
  fundingLevel?: string;
}

// ... additional type definitions
```

### JSON Schema Validation (Node.js)

```typescript
// utils/validate.ts
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import problemSchema from '../schemas/problem.schema.json';

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

const validateProblem = ajv.compile(problemSchema);

export function validateProblemData(data: unknown): {
  valid: boolean;
  errors?: string[]
} {
  const valid = validateProblem(data);
  if (!valid) {
    return {
      valid: false,
      errors: validateProblem.errors?.map(e => `${e.instancePath} ${e.message}`)
    };
  }
  return { valid: true };
}
```

---

## Data Loading Utilities

### Loading Research Data

```typescript
// utils/loader.ts
import * as fs from 'fs/promises';
import * as path from 'path';
import { Problem, ResearchIndex, IndustryMetadata } from '../types/research';

export class ResearchDataLoader {
  private basePath: string;

  constructor(basePath: string = './research-data') {
    this.basePath = basePath;
  }

  async loadIndex(): Promise<ResearchIndex> {
    const indexPath = path.join(this.basePath, 'index.json');
    const content = await fs.readFile(indexPath, 'utf-8');
    return JSON.parse(content);
  }

  async loadIndustry(slug: string): Promise<IndustryMetadata> {
    const metadataPath = path.join(
      this.basePath,
      'industries',
      slug,
      '_metadata.json'
    );
    const content = await fs.readFile(metadataPath, 'utf-8');
    return JSON.parse(content);
  }

  async loadProblems(industrySlug: string, domainSlug?: string): Promise<Problem[]> {
    const basePath = path.join(this.basePath, 'industries', industrySlug);

    if (domainSlug) {
      const problemsPath = path.join(basePath, domainSlug, 'problems.json');
      const content = await fs.readFile(problemsPath, 'utf-8');
      return JSON.parse(content).problems;
    }

    // Load all problems for industry
    const problems: Problem[] = [];
    const industry = await this.loadIndustry(industrySlug);

    for (const domain of industry.domains) {
      const domainProblems = await this.loadProblems(industrySlug, domain.slug);
      problems.push(...domainProblems);
    }

    return problems;
  }

  async searchProblems(query: string, filters?: SearchFilters): Promise<Problem[]> {
    const index = await this.loadIndex();
    const allProblems: Problem[] = [];

    for (const industry of index.industries) {
      const problems = await this.loadProblems(industry.slug);
      allProblems.push(...problems);
    }

    // Basic search implementation
    const queryLower = query.toLowerCase();
    return allProblems.filter(p => {
      const matchesQuery =
        p.title.toLowerCase().includes(queryLower) ||
        p.description.toLowerCase().includes(queryLower) ||
        p.tags.some(t => t.toLowerCase().includes(queryLower));

      if (!matchesQuery) return false;

      if (filters?.industry && p.industry.slug !== filters.industry) return false;
      if (filters?.domain && p.domain.slug !== filters.domain) return false;
      if (filters?.minSeverity && p.severity.overall < filters.minSeverity) return false;

      return true;
    });
  }
}

interface SearchFilters {
  industry?: string;
  domain?: string;
  field?: string;
  problemType?: string;
  minSeverity?: number;
  maxTractability?: number;
}
```

---

## Schema Versioning

The schema follows semantic versioning:

- **Major version**: Breaking changes to required fields or structure
- **Minor version**: New optional fields or non-breaking enhancements
- **Patch version**: Documentation or validation rule updates

Migration scripts should be provided for major version updates.

---

## Best Practices

1. **Always validate** data against the schema before storage
2. **Generate UUIDs** consistently using v4 format
3. **Use slugs** for URL-friendly identifiers (lowercase, hyphenated)
4. **Include sources** for every problem (minimum 1)
5. **Calculate impact scores** using a consistent algorithm
6. **Update timestamps** on every modification
7. **Increment version** when modifying existing problems
8. **Log research sessions** for traceability and debugging
