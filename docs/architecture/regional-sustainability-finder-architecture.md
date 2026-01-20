# Regional Sustainability Finder - Architecture Design

## 1. System Overview

The Regional Sustainability Finder is a cloud-native web application focused on discovering and exploring sustainability challenges by geographic region, aligned with UN SDGs, and mapped to active NGO/nonprofit efforts. It emphasizes geographic visualization and impact-focused data presentation.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      Regional Sustainability Finder                          │
│                                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   Web App    │  │  Mobile App  │  │     API      │  │   Admin      │    │
│  │   (Next.js)  │  │   (Future)   │  │   Consumers  │  │   Portal     │    │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘    │
│         │                 │                 │                 │             │
│         └─────────────────┴────────┬────────┴─────────────────┘             │
│                                    │                                        │
│                          ┌─────────▼─────────┐                              │
│                          │   API Gateway     │                              │
│                          │   (Kong/AWS)      │                              │
│                          └─────────┬─────────┘                              │
│                                    │                                        │
│    ┌───────────────────────────────┼───────────────────────────────┐       │
│    │                               │                               │        │
│ ┌──▼────────┐  ┌──────────┐  ┌────▼─────┐  ┌──────────┐  ┌───────▼─────┐  │
│ │  Search   │  │  Region  │  │ Problem  │  │   Org    │  │  Analytics  │  │
│ │  Service  │  │  Service │  │ Service  │  │ Service  │  │   Service   │  │
│ └───────────┘  └──────────┘  └──────────┘  └──────────┘  └─────────────┘  │
│                                    │                                        │
│  ┌─────────────────────────────────┼───────────────────────────────────┐   │
│  │                          Data Layer                                  │   │
│  │  ┌──────────┐  ┌───────────┐  ┌────────┐  ┌────────┐  ┌──────────┐ │   │
│  │  │PostgreSQL│  │Elasticsearch│ │ Redis  │  │PostGIS │  │ S3/Blob  │ │   │
│  │  │(Primary) │  │  (Search)  │  │(Cache) │  │ (Geo)  │  │ Storage  │ │   │
│  │  └──────────┘  └───────────┘  └────────┘  └────────┘  └──────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      AI/ML & Data Pipeline                           │   │
│  │  ┌──────────┐  ┌───────────┐  ┌───────────┐  ┌───────────────────┐ │   │
│  │  │ External │  │ Embedding │  │  Claude   │  │ Impact Scoring    │ │   │
│  │  │ Data Sync│  │ Generation│  │  API      │  │ & Prioritization  │ │   │
│  │  └──────────┘  └───────────┘  └───────────┘  └───────────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Component Architecture

### 2.1 Frontend Layer

#### Web Application (Next.js 14+)

```
src/
├── app/                      # App Router
│   ├── (public)/
│   │   ├── page.tsx         # Landing with world map
│   │   ├── explore/
│   │   │   ├── page.tsx     # Interactive map exploration
│   │   │   ├── [region]/    # Region-specific views
│   │   │   ├── [country]/   # Country-specific views
│   │   │   └── [problem]/   # Problem detail pages
│   │   ├── sdgs/            # SDG-organized view
│   │   │   ├── page.tsx     # SDG overview
│   │   │   └── [sdg]/       # Individual SDG pages
│   │   ├── organizations/   # NGO/Nonprofit directory
│   │   │   ├── page.tsx     # Organization listing
│   │   │   └── [org]/       # Organization profiles
│   │   └── search/          # Search interface
│   ├── (authenticated)/
│   │   ├── dashboard/       # User dashboard
│   │   ├── watchlist/       # Tracked problems/regions
│   │   ├── contributions/   # User contributions
│   │   └── reports/         # Custom reports
│   └── api/                 # API routes (BFF)
├── components/
│   ├── ui/                  # Base UI components
│   ├── map/                 # Map components
│   │   ├── WorldMap.tsx     # Interactive world map
│   │   ├── RegionOverlay.tsx # Region data overlays
│   │   ├── HotspotMarkers.tsx # Problem hotspots
│   │   └── MapControls.tsx  # Zoom, filter controls
│   ├── visualization/
│   │   ├── SDGWheel.tsx     # SDG progress wheel
│   │   ├── ImpactChart.tsx  # Impact metrics charts
│   │   ├── TrendGraph.tsx   # Trend over time
│   │   └── HeatMap.tsx      # Problem density heatmap
│   ├── problem/             # Problem display components
│   ├── organization/        # Organization components
│   └── layout/              # Layout components
├── lib/
│   ├── api/                 # API client
│   ├── geo/                 # Geographic utilities
│   ├── hooks/               # Custom hooks
│   └── stores/              # State management
└── types/                   # TypeScript definitions
```

**Key Features:**
- Interactive world map with problem overlays
- SDG-aligned navigation and filtering
- Geographic drill-down (Region → Country → Local)
- Organization profiles and impact tracking
- Data visualization dashboards
- Offline support for fieldwork

**Tech Stack:**
- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS + shadcn/ui
- Mapbox GL JS or Leaflet for mapping
- D3.js for custom visualizations
- React Query for data fetching
- Zustand for state management

### 2.2 Backend Services

#### Region Service

**Technology**: Node.js/TypeScript with Express or Fastify

```typescript
// Service Structure
region-service/
├── src/
│   ├── controllers/
│   │   ├── region.controller.ts      # Region endpoints
│   │   ├── country.controller.ts     # Country endpoints
│   │   └── geography.controller.ts   # Geo operations
│   ├── services/
│   │   ├── region.service.ts         # Region business logic
│   │   ├── geo.service.ts           # Geographic operations
│   │   ├── boundary.service.ts      # Administrative boundaries
│   │   └── aggregation.service.ts   # Data aggregation
│   ├── models/
│   │   ├── region.model.ts          # Region entity
│   │   ├── country.model.ts         # Country entity
│   │   └── boundary.model.ts        # Geographic boundary
│   └── repositories/
│       ├── region.repository.ts     # Region data access
│       └── geo.repository.ts        # PostGIS operations
└── tests/
```

**Key Features:**
- Administrative boundary management
- Geographic data queries (PostGIS)
- Region hierarchy navigation
- Problem aggregation by geography
- Demographic data integration

#### Organization Service

**Technology**: Node.js/TypeScript

```typescript
// Service Structure
organization-service/
├── src/
│   ├── controllers/
│   │   ├── organization.controller.ts  # Org CRUD
│   │   └── activity.controller.ts      # Activity tracking
│   ├── services/
│   │   ├── organization.service.ts     # Org business logic
│   │   ├── mapping.service.ts         # Org-Problem-Region mapping
│   │   ├── impact.service.ts          # Impact metrics
│   │   └── verification.service.ts    # Data verification
│   ├── models/
│   │   ├── organization.model.ts      # Organization entity
│   │   ├── activity.model.ts          # Activity tracking
│   │   └── impact-report.model.ts     # Impact reporting
│   └── repositories/
└── tests/
```

**Key Features:**
- NGO/Nonprofit profiles
- Geographic activity mapping
- Problem focus area tracking
- Impact metric collection
- Verification status management

#### Problem Service (Sustainability-focused)

**Technology**: Node.js/TypeScript or Python/FastAPI

```typescript
// Service Structure
problem-service/
├── src/
│   ├── controllers/
│   │   ├── problem.controller.ts     # CRUD operations
│   │   ├── sdg.controller.ts         # SDG alignment
│   │   └── indicator.controller.ts   # SDG indicators
│   ├── services/
│   │   ├── problem.service.ts        # Business logic
│   │   ├── sdg-alignment.service.ts  # SDG mapping
│   │   ├── impact-scoring.service.ts # Impact calculations
│   │   ├── urgency.service.ts        # Urgency assessment
│   │   └── progress.service.ts       # Progress tracking
│   ├── models/
│   │   ├── problem.model.ts          # Problem entity
│   │   ├── sdg.model.ts              # SDG alignment
│   │   └── indicator.model.ts        # Progress indicators
│   └── repositories/
└── tests/
```

**Key Features:**
- SDG alignment and tagging
- Impact severity scoring
- Progress indicator tracking
- Organization linkage
- Geographic association

### 2.3 Data Layer

#### Primary Database (PostgreSQL with PostGIS)

**Schema Design:**

```sql
-- Geographic entities
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE regions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    region_type VARCHAR(50) NOT NULL,  -- 'continent', 'sub-region', 'country', 'admin1', 'admin2'
    parent_id UUID REFERENCES regions(id),
    iso_code VARCHAR(10),

    -- Geographic data
    geometry GEOMETRY(MultiPolygon, 4326),
    centroid GEOMETRY(Point, 4326),
    bounding_box BOX,
    area_km2 DECIMAL(15,2),

    -- Demographics
    population BIGINT,
    population_year INTEGER,

    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_regions_geometry ON regions USING GIST(geometry);
CREATE INDEX idx_regions_centroid ON regions USING GIST(centroid);
CREATE INDEX idx_regions_parent ON regions(parent_id);
CREATE INDEX idx_regions_type ON regions(region_type);

-- SDGs
CREATE TABLE sdgs (
    id INTEGER PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    short_name VARCHAR(100),
    description TEXT,
    icon_url VARCHAR(500),
    color VARCHAR(7)  -- hex color
);

CREATE TABLE sdg_targets (
    id VARCHAR(10) PRIMARY KEY,  -- e.g., "1.1", "1.2"
    sdg_id INTEGER REFERENCES sdgs(id),
    description TEXT NOT NULL,
    indicators JSONB DEFAULT '[]'
);

-- Sustainability Problems
CREATE TABLE sustainability_problems (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(500) UNIQUE NOT NULL,
    description TEXT NOT NULL,

    -- Geographic scope
    primary_region_id UUID REFERENCES regions(id),
    affected_regions UUID[],  -- Additional affected regions
    scope_type VARCHAR(50),   -- 'global', 'regional', 'national', 'local'

    -- SDG alignment
    primary_sdg_id INTEGER REFERENCES sdgs(id),
    secondary_sdg_ids INTEGER[],
    sdg_targets VARCHAR(10)[],

    -- Classification
    problem_category VARCHAR(100),  -- 'environmental', 'social', 'economic', 'governance'
    urgency_level VARCHAR(50),      -- 'crisis', 'critical', 'serious', 'moderate'

    -- Impact metrics
    affected_population BIGINT,
    mortality_impact INTEGER,       -- Annual deaths
    economic_impact_usd DECIMAL(15,2),
    environmental_score DECIMAL(3,2),

    -- Scoring
    severity_score DECIMAL(3,2),
    tractability_score DECIMAL(3,2),
    neglectedness_score DECIMAL(3,2),
    funding_gap_score DECIMAL(3,2),

    -- Content
    root_causes TEXT[],
    contributing_factors TEXT[],
    existing_interventions TEXT[],
    intervention_gaps TEXT[],

    -- Sources
    sources JSONB DEFAULT '[]',
    data_quality_score DECIMAL(3,2),
    last_verified_at TIMESTAMP,

    -- Metadata
    tags TEXT[],
    metadata JSONB DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_problems_region ON sustainability_problems(primary_region_id);
CREATE INDEX idx_problems_sdg ON sustainability_problems(primary_sdg_id);
CREATE INDEX idx_problems_urgency ON sustainability_problems(urgency_level);
CREATE INDEX idx_problems_tags ON sustainability_problems USING GIN(tags);

-- Organizations
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(500) NOT NULL,
    slug VARCHAR(500) UNIQUE NOT NULL,
    org_type VARCHAR(50),  -- 'ngo', 'nonprofit', 'foundation', 'government', 'multilateral'

    -- Basic info
    description TEXT,
    mission_statement TEXT,
    founding_year INTEGER,
    headquarters_country VARCHAR(3),
    website_url VARCHAR(500),

    -- Scope
    operational_regions UUID[],
    primary_sdgs INTEGER[],
    focus_areas TEXT[],

    -- Size & capacity
    annual_budget_usd DECIMAL(15,2),
    budget_year INTEGER,
    employee_count INTEGER,
    volunteer_count INTEGER,

    -- Verification
    verification_status VARCHAR(50),  -- 'verified', 'pending', 'unverified'
    verification_source VARCHAR(255),

    -- Contact
    contact_email VARCHAR(255),
    social_media JSONB DEFAULT '{}',

    -- Metadata
    logo_url VARCHAR(500),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_orgs_type ON organizations(org_type);
CREATE INDEX idx_orgs_verification ON organizations(verification_status);
CREATE INDEX idx_orgs_sdgs ON organizations USING GIN(primary_sdgs);

-- Organization-Problem mapping
CREATE TABLE organization_problem_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id),
    problem_id UUID REFERENCES sustainability_problems(id),
    region_id UUID REFERENCES regions(id),

    activity_type VARCHAR(100),  -- 'direct_service', 'advocacy', 'research', 'funding', 'capacity_building'
    activity_description TEXT,

    -- Impact metrics
    beneficiaries_reached INTEGER,
    funding_allocated_usd DECIMAL(12,2),

    -- Timeline
    start_date DATE,
    end_date DATE,
    status VARCHAR(50),  -- 'active', 'completed', 'planned'

    -- Sources
    source_url VARCHAR(500),
    verification_status VARCHAR(50),

    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW()
);

-- SDG Progress indicators by region
CREATE TABLE sdg_progress_indicators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    region_id UUID REFERENCES regions(id),
    sdg_id INTEGER REFERENCES sdgs(id),
    indicator_code VARCHAR(50),

    -- Values
    value DECIMAL(15,4),
    unit VARCHAR(100),
    year INTEGER,

    -- Metadata
    source VARCHAR(255),
    methodology TEXT,
    confidence_level VARCHAR(50),

    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_progress_region_sdg ON sdg_progress_indicators(region_id, sdg_id);
CREATE INDEX idx_progress_year ON sdg_progress_indicators(year);
```

#### Search Index (Elasticsearch)

**Index Mapping for Sustainability Problems:**

```json
{
  "mappings": {
    "properties": {
      "id": { "type": "keyword" },
      "title": {
        "type": "text",
        "analyzer": "english",
        "fields": {
          "keyword": { "type": "keyword" },
          "suggest": { "type": "completion" }
        }
      },
      "description": {
        "type": "text",
        "analyzer": "english"
      },
      "region": {
        "properties": {
          "id": { "type": "keyword" },
          "name": { "type": "keyword" },
          "path": { "type": "keyword" },
          "location": { "type": "geo_point" }
        }
      },
      "affected_regions": {
        "type": "nested",
        "properties": {
          "id": { "type": "keyword" },
          "name": { "type": "keyword" }
        }
      },
      "sdg": {
        "properties": {
          "primary": { "type": "integer" },
          "secondary": { "type": "integer" },
          "targets": { "type": "keyword" }
        }
      },
      "embedding": {
        "type": "dense_vector",
        "dims": 1536,
        "index": true,
        "similarity": "cosine"
      },
      "problem_category": { "type": "keyword" },
      "urgency_level": { "type": "keyword" },
      "affected_population": { "type": "long" },
      "severity_score": { "type": "float" },
      "tractability_score": { "type": "float" },
      "neglectedness_score": { "type": "float" },
      "funding_gap_score": { "type": "float" },
      "organizations": {
        "type": "nested",
        "properties": {
          "id": { "type": "keyword" },
          "name": { "type": "keyword" },
          "activity_type": { "type": "keyword" }
        }
      },
      "tags": { "type": "keyword" },
      "status": { "type": "keyword" },
      "created_at": { "type": "date" },
      "updated_at": { "type": "date" }
    }
  }
}
```

### 2.4 AI/ML Pipeline

#### Data Integration Pipeline

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        External Data Sources                                 │
│                                                                              │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐          │
│  │ UN SDG  │  │  World  │  │ Relief  │  │  IATI   │  │ News &  │          │
│  │ Database│  │  Bank   │  │   Web   │  │  Data   │  │ Alerts  │          │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘          │
│       │            │            │            │            │                 │
│       └────────────┴────────────┼────────────┴────────────┘                 │
│                                 │                                           │
│                        ┌────────▼────────┐                                  │
│                        │   Apache Airflow │                                  │
│                        │   Orchestration  │                                  │
│                        └────────┬────────┘                                  │
│                                 │                                           │
│         ┌───────────────────────┼───────────────────────┐                  │
│         │                       │                       │                   │
│  ┌──────▼──────┐       ┌───────▼───────┐       ┌──────▼──────┐            │
│  │   Extract   │       │   Transform   │       │    Load     │            │
│  │   Workers   │       │   (NLP/ML)    │       │  (DB/ES)    │            │
│  └─────────────┘       └───────────────┘       └─────────────┘            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Data Sources Integration:**

| Source | Data Type | Update Frequency |
|--------|-----------|------------------|
| UN SDG Database | Official indicators | Quarterly |
| World Bank | Development indicators | Quarterly |
| ReliefWeb | Humanitarian data | Daily |
| IATI | Aid activity data | Weekly |
| WHO | Health statistics | Monthly |
| FAO | Food security data | Monthly |
| UNHCR | Refugee data | Monthly |
| ACLED | Conflict events | Weekly |
| GDELT | News events | Real-time |
| OpenStreetMap | Geographic boundaries | As needed |

#### Geographic Analysis Pipeline

```python
class GeoAnalysisPipeline:
    def __init__(self):
        self.postgis_client = PostGISClient()
        self.es_client = ElasticsearchClient()

    async def aggregate_problems_by_region(
        self,
        region_id: str,
        include_children: bool = True
    ) -> RegionProblemSummary:
        # Get region geometry
        region = await self.postgis_client.get_region(region_id)

        if include_children:
            # Get all child regions
            child_regions = await self.postgis_client.query("""
                SELECT id FROM regions
                WHERE ST_Within(centroid, (SELECT geometry FROM regions WHERE id = %s))
            """, [region_id])
            region_ids = [region_id] + [r.id for r in child_regions]
        else:
            region_ids = [region_id]

        # Aggregate problem statistics
        summary = await self.es_client.search(
            index="sustainability_problems",
            body={
                "query": {
                    "terms": {"region.id": region_ids}
                },
                "aggs": {
                    "by_sdg": {"terms": {"field": "sdg.primary"}},
                    "by_urgency": {"terms": {"field": "urgency_level"}},
                    "by_category": {"terms": {"field": "problem_category"}},
                    "total_affected": {"sum": {"field": "affected_population"}},
                    "avg_severity": {"avg": {"field": "severity_score"}}
                }
            }
        )

        return RegionProblemSummary.from_es_response(region, summary)

    async def find_problem_hotspots(
        self,
        bounds: BoundingBox,
        sdg_filter: Optional[int] = None,
        min_severity: float = 0.5
    ) -> List[ProblemHotspot]:
        # Use Elasticsearch geo queries
        query = {
            "query": {
                "bool": {
                    "must": [
                        {"range": {"severity_score": {"gte": min_severity}}},
                        {
                            "geo_bounding_box": {
                                "region.location": {
                                    "top_left": {"lat": bounds.north, "lon": bounds.west},
                                    "bottom_right": {"lat": bounds.south, "lon": bounds.east}
                                }
                            }
                        }
                    ],
                    "filter": [{"term": {"sdg.primary": sdg_filter}}] if sdg_filter else []
                }
            },
            "aggs": {
                "hotspots": {
                    "geohash_grid": {
                        "field": "region.location",
                        "precision": 4  # Adjust for zoom level
                    },
                    "aggs": {
                        "center": {"geo_centroid": {"field": "region.location"}},
                        "severity_avg": {"avg": {"field": "severity_score"}},
                        "problem_count": {"value_count": {"field": "id"}}
                    }
                }
            }
        }

        results = await self.es_client.search(
            index="sustainability_problems",
            body=query
        )

        return [ProblemHotspot.from_bucket(b) for b in results["aggregations"]["hotspots"]["buckets"]]
```

#### Impact Scoring Algorithm

```python
class ImpactScoringService:
    """
    Multi-dimensional impact scoring for sustainability problems
    Based on ITN framework (Importance, Tractability, Neglectedness)
    """

    DIMENSION_WEIGHTS = {
        'severity': 0.35,
        'tractability': 0.25,
        'neglectedness': 0.25,
        'urgency': 0.15
    }

    async def calculate_impact_score(self, problem: SustainabilityProblem) -> ImpactScore:
        # Severity Score (0-1)
        severity = self._calculate_severity(
            affected_population=problem.affected_population,
            mortality_impact=problem.mortality_impact,
            economic_impact=problem.economic_impact_usd,
            environmental_score=problem.environmental_score
        )

        # Tractability Score (0-1) - How solvable is the problem?
        tractability = self._calculate_tractability(
            existing_interventions=problem.existing_interventions,
            technology_available=problem.metadata.get('technology_available'),
            political_feasibility=problem.metadata.get('political_feasibility'),
            cost_effectiveness=problem.metadata.get('cost_per_life_saved')
        )

        # Neglectedness Score (0-1) - How overlooked is the problem?
        neglectedness = await self._calculate_neglectedness(
            problem_id=problem.id,
            funding_gap=problem.metadata.get('funding_gap'),
            org_count=await self._count_active_organizations(problem.id),
            media_attention=await self._measure_media_attention(problem.title)
        )

        # Urgency Score (0-1) - How time-sensitive?
        urgency = self._calculate_urgency(
            urgency_level=problem.urgency_level,
            trend_direction=problem.metadata.get('trend'),
            tipping_points=problem.metadata.get('tipping_points')
        )

        # Weighted composite score
        composite = (
            severity * self.DIMENSION_WEIGHTS['severity'] +
            tractability * self.DIMENSION_WEIGHTS['tractability'] +
            neglectedness * self.DIMENSION_WEIGHTS['neglectedness'] +
            urgency * self.DIMENSION_WEIGHTS['urgency']
        )

        return ImpactScore(
            composite=composite,
            severity=severity,
            tractability=tractability,
            neglectedness=neglectedness,
            urgency=urgency,
            confidence=self._calculate_confidence(problem)
        )

    def _calculate_severity(
        self,
        affected_population: int,
        mortality_impact: int,
        economic_impact: float,
        environmental_score: float
    ) -> float:
        # Normalize each component to 0-1 scale
        pop_score = min(1.0, math.log10(max(1, affected_population)) / 10)  # Log scale
        mortality_score = min(1.0, math.log10(max(1, mortality_impact)) / 7)
        economic_score = min(1.0, math.log10(max(1, economic_impact)) / 12)
        env_score = environmental_score or 0.5

        return (pop_score * 0.3 + mortality_score * 0.3 +
                economic_score * 0.2 + env_score * 0.2)
```

#### Claude Integration for Regional Analysis

```python
class ClaudeRegionalAnalysisService:
    async def generate_region_briefing(
        self,
        region: Region,
        problems: List[SustainabilityProblem],
        organizations: List[Organization]
    ) -> RegionBriefing:
        response = await anthropic.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=2000,
            messages=[{
                "role": "user",
                "content": f"""Generate a comprehensive briefing for {region.name}:

                SUSTAINABILITY CHALLENGES:
                {self._format_problems(problems)}

                ACTIVE ORGANIZATIONS:
                {self._format_organizations(organizations)}

                Provide:
                1. Executive Summary (2-3 paragraphs)
                2. Key Challenge Areas (prioritized)
                3. SDG Progress Assessment
                4. Gap Analysis (where are efforts lacking?)
                5. Opportunities for Impact
                6. Recommended Priority Actions

                Use data-driven language and cite specific metrics where available."""
            }]
        )

        return RegionBriefing.parse(response.content)

    async def identify_cross_border_challenges(
        self,
        regions: List[Region],
        problems: List[SustainabilityProblem]
    ) -> List[CrossBorderChallenge]:
        response = await anthropic.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=1500,
            messages=[{
                "role": "user",
                "content": f"""Analyze these sustainability problems across multiple regions:

                REGIONS: {[r.name for r in regions]}

                PROBLEMS:
                {self._format_problems(problems)}

                Identify:
                1. Problems that span multiple regions
                2. Shared root causes
                3. Potential for coordinated solutions
                4. Regional cooperation opportunities

                Return as structured analysis."""
            }]
        )

        return CrossBorderChallenge.parse_list(response.content)
```

---

## 3. Cloud Infrastructure

### 3.1 AWS Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              AWS Infrastructure                              │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         VPC (10.1.0.0/16)                           │   │
│  │                                                                      │   │
│  │  ┌─────────────────────────────────────────────────────────────┐   │   │
│  │  │                    Public Subnets                            │   │   │
│  │  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │   │   │
│  │  │  │     ALB     │  │   NAT GW    │  │  Bastion    │         │   │   │
│  │  │  └─────────────┘  └─────────────┘  └─────────────┘         │   │   │
│  │  └─────────────────────────────────────────────────────────────┘   │   │
│  │                                                                      │   │
│  │  ┌─────────────────────────────────────────────────────────────┐   │   │
│  │  │                    Private Subnets                           │   │   │
│  │  │  ┌───────────────────────────────────────────────────────┐  │   │   │
│  │  │  │                    EKS Cluster                         │  │   │   │
│  │  │  │  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐      │  │   │   │
│  │  │  │  │Web App │  │ Search │  │ Region │  │Problem │      │  │   │   │
│  │  │  │  │  Pods  │  │Service │  │Service │  │Service │      │  │   │   │
│  │  │  │  └────────┘  └────────┘  └────────┘  └────────┘      │  │   │   │
│  │  │  │  ┌────────┐  ┌────────┐  ┌────────┐                  │  │   │   │
│  │  │  │  │  Org   │  │Analytics│ │ Data   │                  │  │   │   │
│  │  │  │  │Service │  │ Service│  │Pipeline│                  │  │   │   │
│  │  │  │  └────────┘  └────────┘  └────────┘                  │  │   │   │
│  │  │  └───────────────────────────────────────────────────────┘  │   │   │
│  │  └─────────────────────────────────────────────────────────────┘   │   │
│  │                                                                      │   │
│  │  ┌─────────────────────────────────────────────────────────────┐   │   │
│  │  │                    Data Subnets                              │   │   │
│  │  │  ┌───────────┐  ┌───────────┐  ┌───────────┐               │   │   │
│  │  │  │   RDS     │  │ OpenSearch│  │ElastiCache│               │   │   │
│  │  │  │PostgreSQL │  │  Cluster  │  │   Redis   │               │   │   │
│  │  │  │ +PostGIS  │  │           │  │           │               │   │   │
│  │  │  └───────────┘  └───────────┘  └───────────┘               │   │   │
│  │  └─────────────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐           │
│  │     S3     │  │ CloudFront │  │   Lambda   │  │   MWAA     │           │
│  │  (GeoData) │  │  (Map CDN) │  │ (Workers)  │  │ (Airflow)  │           │
│  └────────────┘  └────────────┘  └────────────┘  └────────────┘           │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Service Mapping

| Component | AWS Service | Configuration |
|-----------|-------------|---------------|
| Container Orchestration | EKS | 4 node groups, auto-scaling |
| Database | RDS PostgreSQL + PostGIS | db.r6g.large, Multi-AZ |
| Search | OpenSearch | 3 data nodes, m6g.large |
| Cache | ElastiCache Redis | cache.r6g.large, cluster mode |
| Object Storage | S3 | Geo data, map tiles, static assets |
| CDN | CloudFront | Map tile caching, global edge |
| Workflow Orchestration | MWAA (Managed Airflow) | Data pipeline scheduling |
| Serverless | Lambda | Data processing workers |
| API Gateway | API Gateway | Regional + edge optimized |
| Map Tiles | S3 + CloudFront | Vector tiles, raster tiles |

### 3.3 Geographic Data Storage

```
S3 Bucket Structure:
regional-sustainability-finder-geodata/
├── boundaries/
│   ├── admin0/          # Country boundaries
│   ├── admin1/          # State/Province
│   ├── admin2/          # District/County
│   └── special/         # Custom regions
├── tiles/
│   ├── vector/          # Mapbox Vector Tiles
│   │   ├── base/        # Base map tiles
│   │   └── overlays/    # Problem overlays
│   └── raster/          # Raster tiles (fallback)
├── datasets/
│   ├── sdg-indicators/  # SDG data by region
│   ├── population/      # Demographic data
│   └── humanitarian/    # Relief data
└── exports/
    └── reports/         # Generated reports
```

---

## 4. Frontend Mapping Architecture

### 4.1 Map Technology Stack

**Primary**: Mapbox GL JS (or MapLibre GL JS for open-source)

```typescript
// Map Component Architecture
components/map/
├── MapProvider.tsx       # Map context and state
├── WorldMap.tsx         # Main map component
├── layers/
│   ├── ProblemHeatLayer.tsx    # Problem density heatmap
│   ├── RegionFillLayer.tsx     # Choropleth by metric
│   ├── OrganizationMarkers.tsx # Org location markers
│   ├── HotspotClusters.tsx     # Problem hotspot clusters
│   └── SDGOverlay.tsx          # SDG progress visualization
├── controls/
│   ├── LayerControl.tsx        # Layer toggle
│   ├── SDGFilter.tsx           # Filter by SDG
│   ├── TimeSlider.tsx          # Temporal navigation
│   └── SearchBox.tsx           # Map search
└── popups/
    ├── RegionPopup.tsx         # Region summary
    ├── ProblemPopup.tsx        # Problem detail
    └── OrgPopup.tsx            # Organization info
```

### 4.2 Map Interaction Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     Map Interaction Flow                         │
│                                                                  │
│  User Action          Map Response           Data Loaded         │
│  ─────────────        ────────────           ───────────         │
│                                                                  │
│  Page Load      ──▶   World View       ──▶   Global aggregates  │
│       │                    │                       │             │
│  Click Region   ──▶   Zoom to Region   ──▶   Region problems    │
│       │                    │                       │             │
│  Click Country  ──▶   Country Detail   ──▶   Detailed data      │
│       │                    │                       │             │
│  Select Problem ──▶   Highlight Area   ──▶   Problem detail     │
│       │                    │                       │             │
│  Filter by SDG  ──▶   Update Layers    ──▶   Filtered problems  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 4.3 Data Visualization Components

```typescript
// SDG Progress Wheel
interface SDGWheelProps {
  region: Region;
  progress: SDGProgress[];
  interactive?: boolean;
}

const SDGWheel: React.FC<SDGWheelProps> = ({ region, progress, interactive }) => {
  return (
    <div className="sdg-wheel">
      {progress.map((sdg) => (
        <SDGWedge
          key={sdg.sdgId}
          sdg={sdg}
          progress={sdg.progressScore}
          problemCount={sdg.problemCount}
          onClick={interactive ? () => onSDGClick(sdg.sdgId) : undefined}
        />
      ))}
      <CenterStats region={region} />
    </div>
  );
};

// Regional Impact Dashboard
interface RegionDashboardProps {
  region: Region;
  problems: SustainabilityProblem[];
  organizations: Organization[];
}

const RegionDashboard: React.FC<RegionDashboardProps> = ({
  region,
  problems,
  organizations
}) => {
  return (
    <div className="grid grid-cols-12 gap-4">
      {/* Key Metrics */}
      <MetricCard
        title="Critical Problems"
        value={problems.filter(p => p.urgency === 'crisis').length}
        trend={calculateTrend(problems)}
      />
      <MetricCard
        title="Active Organizations"
        value={organizations.length}
        breakdown={groupByType(organizations)}
      />
      <MetricCard
        title="People Affected"
        value={sumAffectedPopulation(problems)}
        format="compact"
      />

      {/* Visualizations */}
      <SDGWheel region={region} progress={calculateSDGProgress(problems)} />
      <ProblemDistributionChart problems={problems} />
      <OrganizationActivityTimeline organizations={organizations} />
      <FundingGapAnalysis problems={problems} organizations={organizations} />
    </div>
  );
};
```

---

## 5. API Design

### 5.1 REST API Endpoints

```yaml
# Region Endpoints
GET /api/v1/regions
GET /api/v1/regions/{regionId}
GET /api/v1/regions/{regionId}/problems
GET /api/v1/regions/{regionId}/organizations
GET /api/v1/regions/{regionId}/sdg-progress
GET /api/v1/regions/{regionId}/briefing

# Problem Endpoints
GET /api/v1/problems
GET /api/v1/problems/{problemId}
GET /api/v1/problems/search
GET /api/v1/problems/hotspots
POST /api/v1/problems (authenticated)

# Organization Endpoints
GET /api/v1/organizations
GET /api/v1/organizations/{orgId}
GET /api/v1/organizations/{orgId}/activities
GET /api/v1/organizations/search

# SDG Endpoints
GET /api/v1/sdgs
GET /api/v1/sdgs/{sdgId}
GET /api/v1/sdgs/{sdgId}/problems
GET /api/v1/sdgs/{sdgId}/progress

# Geographic Endpoints
GET /api/v1/geo/boundaries/{regionId}
GET /api/v1/geo/search
GET /api/v1/geo/tile/{z}/{x}/{y}.mvt

# Analytics Endpoints
GET /api/v1/analytics/global-summary
GET /api/v1/analytics/trends
GET /api/v1/analytics/funding-gaps
```

### 5.2 GraphQL API (Alternative)

```graphql
type Query {
  region(id: ID!): Region
  regions(filter: RegionFilter, pagination: Pagination): RegionConnection

  problem(id: ID!): SustainabilityProblem
  problems(filter: ProblemFilter, pagination: Pagination): ProblemConnection
  searchProblems(query: String!, filters: ProblemFilter): SearchResults

  organization(id: ID!): Organization
  organizations(filter: OrgFilter, pagination: Pagination): OrgConnection

  sdg(id: Int!): SDG
  sdgs: [SDG!]!

  globalSummary: GlobalSummary
  regionBriefing(regionId: ID!): RegionBriefing
}

type Region {
  id: ID!
  name: String!
  regionType: RegionType!
  parent: Region
  children: [Region!]!
  geometry: GeoJSON

  problems(filter: ProblemFilter): [SustainabilityProblem!]!
  organizations: [Organization!]!
  sdgProgress: [SDGProgress!]!
  summary: RegionSummary
}

type SustainabilityProblem {
  id: ID!
  title: String!
  description: String!

  region: Region!
  affectedRegions: [Region!]!

  primarySDG: SDG!
  secondarySDGs: [SDG!]!

  urgencyLevel: UrgencyLevel!
  problemCategory: ProblemCategory!

  impactScore: ImpactScore!
  affectedPopulation: Int

  organizations: [OrganizationActivity!]!
  relatedProblems: [SustainabilityProblem!]!
}
```

---

## 6. Cost Estimation

### Monthly Infrastructure Costs (Production)

| Service | Configuration | Monthly Cost |
|---------|---------------|--------------|
| EKS | Cluster + 4-8 nodes | $400-700 |
| RDS PostgreSQL + PostGIS | db.r6g.large, Multi-AZ | $450-550 |
| OpenSearch | 3x m6g.large nodes | $500-700 |
| ElastiCache Redis | cache.r6g.large, 2 nodes | $300-400 |
| S3 (Geo data + tiles) | ~500GB + CDN transfer | $100-200 |
| CloudFront | Map tile distribution | $100-200 |
| MWAA (Airflow) | Small environment | $300-400 |
| Lambda | Data processing | $50-100 |
| API Gateway | ~15M requests/month | $50-75 |
| Monitoring | CloudWatch + X-Ray | $100-150 |
| **Total Infrastructure** | | **$2,350-3,475** |

### AI/API Costs (Variable)

| Service | Usage | Monthly Cost |
|---------|-------|--------------|
| OpenAI Embeddings | ~1.5M tokens/day | $400-600 |
| Claude API | ~750K tokens/day | $300-500 |
| Mapbox (if used) | ~5M tile loads | $250-400 |
| **Total AI/API** | | **$950-1,500** |

**Estimated Total: $3,300-4,975/month** (scaling with usage)

---

## 7. Unique Features for Regional Sustainability

### 7.1 SDG Integration
- Full alignment with UN SDG framework
- Progress tracking by region and indicator
- Gap analysis identifying underserved areas

### 7.2 Organization Mapping
- Comprehensive NGO/nonprofit directory
- Activity tracking by problem and region
- Impact metrics and verification

### 7.3 Geographic Intelligence
- Multi-level geographic drill-down
- Cross-border problem identification
- Hotspot detection and visualization

### 7.4 Impact Prioritization
- Multi-dimensional scoring (ITN framework)
- Funding gap analysis
- Urgency assessment

### 7.5 Collaboration Features
- Problem "watchlists" for users
- Organization partnership matching
- Volunteer/donor connection (future)
