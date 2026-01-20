# Industry Problem Finder - Architecture Design

## 1. System Overview

The Industry Problem Finder is a cloud-native web application that enables users to discover, explore, and understand problems across various industries and domains. It leverages AI-powered search and natural language processing to provide intelligent problem discovery.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Industry Problem Finder                              │
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
│         ┌──────────────────────────┼──────────────────────────┐            │
│         │                          │                          │             │
│  ┌──────▼──────┐          ┌───────▼───────┐          ┌───────▼───────┐    │
│  │   Search    │          │    Problem    │          │   Analytics   │    │
│  │   Service   │          │    Service    │          │    Service    │    │
│  └──────┬──────┘          └───────┬───────┘          └───────┬───────┘    │
│         │                         │                          │             │
│         └─────────────────────────┼──────────────────────────┘             │
│                                   │                                        │
│  ┌────────────────────────────────┼────────────────────────────────────┐   │
│  │                         Data Layer                                   │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐ │   │
│  │  │ PostgreSQL  │  │ Elasticsearch│  │   Redis     │  │  S3/Blob   │ │   │
│  │  │ (Primary)   │  │ (Search)     │  │  (Cache)    │  │  Storage   │ │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      AI/ML Pipeline                                  │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐ │   │
│  │  │ Data        │  │ Embedding   │  │ Claude/     │  │ Model      │ │   │
│  │  │ Ingestion   │  │ Generation  │  │ GPT API     │  │ Training   │ │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └────────────┘ │   │
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
│   ├── (public)/            # Public routes
│   │   ├── page.tsx         # Landing page
│   │   ├── explore/         # Problem exploration
│   │   │   ├── page.tsx     # Main explore view
│   │   │   ├── [domain]/    # Domain-specific views
│   │   │   └── [problem]/   # Problem detail pages
│   │   ├── search/          # Search interface
│   │   └── about/           # About/mission
│   ├── (authenticated)/     # Protected routes
│   │   ├── dashboard/       # User dashboard
│   │   ├── saved/           # Saved problems
│   │   ├── contributions/   # User contributions
│   │   └── settings/        # User settings
│   └── api/                 # API routes (BFF pattern)
├── components/
│   ├── ui/                  # Base UI components
│   ├── search/              # Search components
│   ├── problem/             # Problem display components
│   ├── visualization/       # Charts, graphs, maps
│   └── layout/              # Layout components
├── lib/
│   ├── api/                 # API client
│   ├── hooks/               # Custom hooks
│   ├── utils/               # Utility functions
│   └── stores/              # State management (Zustand)
└── types/                   # TypeScript definitions
```

**Key Features:**
- Server-side rendering for SEO optimization
- Progressive Web App (PWA) capabilities
- Responsive design (mobile-first)
- Dark mode support
- Accessibility (WCAG 2.1 AA compliance)

**Tech Stack:**
- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Zustand for state management
- React Query for data fetching
- Framer Motion for animations

### 2.2 Backend Services

#### API Gateway

**Technology**: Kong Gateway or AWS API Gateway

**Responsibilities:**
- Request routing and load balancing
- Authentication/Authorization (JWT validation)
- Rate limiting and throttling
- Request/response transformation
- API versioning
- CORS handling
- Request logging

#### Search Service

**Technology**: Node.js/TypeScript with Express or Fastify

```typescript
// Service Structure
search-service/
├── src/
│   ├── controllers/
│   │   ├── search.controller.ts      # Search endpoint handlers
│   │   └── suggestions.controller.ts # Autocomplete handlers
│   ├── services/
│   │   ├── elasticsearch.service.ts  # ES client wrapper
│   │   ├── embedding.service.ts      # Vector embedding generation
│   │   ├── ranking.service.ts        # Result ranking logic
│   │   └── nlp.service.ts           # NLP processing
│   ├── models/
│   │   ├── search-query.model.ts    # Query models
│   │   └── search-result.model.ts   # Result models
│   ├── middleware/
│   │   ├── auth.middleware.ts       # Authentication
│   │   └── cache.middleware.ts      # Response caching
│   └── utils/
│       ├── query-parser.ts          # Query parsing utilities
│       └── result-formatter.ts      # Response formatting
├── tests/
└── config/
```

**Key Features:**
- Semantic search using vector embeddings
- Faceted search and filtering
- Autocomplete and suggestions
- Query understanding and expansion
- Personalized ranking

#### Problem Service

**Technology**: Node.js/TypeScript or Python/FastAPI

```typescript
// Service Structure
problem-service/
├── src/
│   ├── controllers/
│   │   ├── problem.controller.ts     # CRUD operations
│   │   ├── domain.controller.ts      # Domain management
│   │   └── taxonomy.controller.ts    # Taxonomy operations
│   ├── services/
│   │   ├── problem.service.ts        # Business logic
│   │   ├── relationship.service.ts   # Problem relationships
│   │   ├── scoring.service.ts        # Impact scoring
│   │   └── validation.service.ts     # Data validation
│   ├── models/
│   │   ├── problem.model.ts          # Problem entity
│   │   ├── domain.model.ts           # Domain entity
│   │   └── solution.model.ts         # Solution entity
│   └── repositories/
│       ├── problem.repository.ts     # Database access
│       └── domain.repository.ts      # Domain data access
└── tests/
```

**Key Features:**
- Problem CRUD operations
- Domain and taxonomy management
- Problem relationship mapping
- Impact and severity scoring
- Version control for problem data

#### Analytics Service

**Technology**: Python/FastAPI with data processing libraries

**Responsibilities:**
- Usage analytics and tracking
- Problem trend analysis
- Search analytics
- User behavior insights
- Report generation

### 2.3 Data Layer

#### Primary Database (PostgreSQL)

**Schema Design:**

```sql
-- Core Tables
CREATE TABLE domains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    parent_id UUID REFERENCES domains(id),
    description TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE problems (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(500) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    domain_id UUID REFERENCES domains(id),

    -- Classification
    problem_type VARCHAR(50),  -- 'technical', 'operational', 'strategic'
    maturity VARCHAR(50),      -- 'emerging', 'active', 'chronic', 'resolved'
    scope VARCHAR(50),         -- 'global', 'regional', 'local'

    -- Impact metrics
    severity_score DECIMAL(3,2),
    tractability_score DECIMAL(3,2),
    neglectedness_score DECIMAL(3,2),

    -- Content
    root_causes TEXT[],
    existing_solutions TEXT[],
    solution_gaps TEXT[],

    -- Metadata
    sources JSONB DEFAULT '[]',
    tags TEXT[],
    metadata JSONB DEFAULT '{}',

    -- Audit
    status VARCHAR(50) DEFAULT 'draft',
    created_by UUID,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    published_at TIMESTAMP
);

CREATE TABLE problem_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_problem_id UUID REFERENCES problems(id),
    target_problem_id UUID REFERENCES problems(id),
    relationship_type VARCHAR(50),  -- 'causes', 'blocks', 'related_to', 'subset_of'
    strength DECIMAL(3,2),
    metadata JSONB DEFAULT '{}'
);

CREATE TABLE solutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    problem_id UUID REFERENCES problems(id),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    solution_type VARCHAR(50),  -- 'existing', 'proposed', 'theoretical'
    effectiveness_score DECIMAL(3,2),
    implementation_status VARCHAR(50),
    sources JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}'
);

-- Indexes
CREATE INDEX idx_problems_domain ON problems(domain_id);
CREATE INDEX idx_problems_status ON problems(status);
CREATE INDEX idx_problems_tags ON problems USING GIN(tags);
CREATE INDEX idx_problems_search ON problems USING GIN(to_tsvector('english', title || ' ' || description));
```

#### Search Index (Elasticsearch)

**Index Mapping:**

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
      "domain": {
        "properties": {
          "id": { "type": "keyword" },
          "name": { "type": "keyword" },
          "path": { "type": "keyword" }
        }
      },
      "embedding": {
        "type": "dense_vector",
        "dims": 1536,
        "index": true,
        "similarity": "cosine"
      },
      "severity_score": { "type": "float" },
      "tractability_score": { "type": "float" },
      "neglectedness_score": { "type": "float" },
      "tags": { "type": "keyword" },
      "status": { "type": "keyword" },
      "created_at": { "type": "date" },
      "updated_at": { "type": "date" }
    }
  }
}
```

#### Cache Layer (Redis)

**Use Cases:**
- Search result caching
- Session management
- Rate limiting counters
- Real-time analytics
- Feature flags

**Key Patterns:**
```
search:{query_hash}:{filters_hash}     # Search results
user:{user_id}:session                  # User sessions
user:{user_id}:recent_searches          # Recent searches
domain:{domain_id}:problem_count        # Domain statistics
ratelimit:{ip}:{endpoint}               # Rate limiting
```

### 2.4 AI/ML Pipeline

#### Data Ingestion Pipeline

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Source    │────▶│   Extract   │────▶│  Transform  │────▶│    Load     │
│   Systems   │     │   (Scrapers)│     │  (Clean/NLP)│     │   (DB/ES)   │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
      │                                                            │
      │                    ┌─────────────┐                        │
      └───────────────────▶│  Scheduler  │◀───────────────────────┘
                           │  (Airflow)  │
                           └─────────────┘
```

**Data Sources:**
- Academic databases (IEEE, ACM, arXiv)
- Industry reports (Gartner, McKinsey, etc.)
- News APIs (NewsAPI, GDELT)
- Patent databases (USPTO, EPO)
- Community forums (Stack Overflow, Reddit)
- Government databases

#### Embedding Generation

**Technology**: OpenAI Embeddings API or Open Source (Sentence-Transformers)

```python
# Embedding Pipeline
class EmbeddingPipeline:
    def __init__(self, model="text-embedding-3-large"):
        self.model = model
        self.dimension = 1536

    async def generate_embedding(self, text: str) -> List[float]:
        # Chunk text if necessary
        chunks = self.chunk_text(text, max_tokens=8000)

        # Generate embeddings for each chunk
        embeddings = []
        for chunk in chunks:
            response = await openai.embeddings.create(
                model=self.model,
                input=chunk
            )
            embeddings.append(response.data[0].embedding)

        # Average embeddings if multiple chunks
        return self.average_embeddings(embeddings)

    async def index_problem(self, problem: Problem):
        # Combine relevant text fields
        text = f"{problem.title}\n{problem.description}\n{' '.join(problem.tags)}"

        # Generate embedding
        embedding = await self.generate_embedding(text)

        # Index in Elasticsearch
        await self.es_client.index(
            index="problems",
            id=problem.id,
            body={
                **problem.dict(),
                "embedding": embedding
            }
        )
```

#### AI-Powered Search

**Hybrid Search Implementation:**

```python
async def search_problems(
    query: str,
    filters: dict,
    page: int = 1,
    page_size: int = 20
) -> SearchResults:
    # Generate query embedding
    query_embedding = await embedding_pipeline.generate_embedding(query)

    # Build hybrid query (BM25 + Vector)
    es_query = {
        "query": {
            "bool": {
                "should": [
                    # BM25 text search
                    {
                        "multi_match": {
                            "query": query,
                            "fields": ["title^3", "description", "tags^2"],
                            "type": "best_fields"
                        }
                    },
                    # Vector similarity search
                    {
                        "script_score": {
                            "query": {"match_all": {}},
                            "script": {
                                "source": "cosineSimilarity(params.query_vector, 'embedding') + 1.0",
                                "params": {"query_vector": query_embedding}
                            }
                        }
                    }
                ],
                "filter": build_filters(filters)
            }
        },
        "from": (page - 1) * page_size,
        "size": page_size,
        "aggs": build_aggregations()
    }

    results = await es_client.search(index="problems", body=es_query)
    return format_results(results)
```

#### Claude Integration for Advanced Features

**Use Cases:**
- Query understanding and intent detection
- Problem summarization
- Relationship discovery
- Solution generation
- Natural language Q&A

```python
class ClaudeService:
    async def understand_query(self, query: str) -> QueryIntent:
        response = await anthropic.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=500,
            messages=[{
                "role": "user",
                "content": f"""Analyze this search query about industry problems:
                Query: "{query}"

                Extract:
                1. Primary intent (explore, find_specific, compare, understand)
                2. Target domains
                3. Problem characteristics (severity, maturity, etc.)
                4. Expanded keywords for search

                Respond in JSON format."""
            }]
        )
        return QueryIntent.parse(response.content)

    async def summarize_problem_landscape(
        self,
        domain: str,
        problems: List[Problem]
    ) -> str:
        response = await anthropic.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=1000,
            messages=[{
                "role": "user",
                "content": f"""Summarize the problem landscape for {domain}:

                Problems:
                {format_problems(problems)}

                Provide:
                1. Overview of major challenge areas
                2. Key patterns and themes
                3. Critical gaps and underserved areas
                4. Emerging trends"""
            }]
        )
        return response.content
```

---

## 3. Cloud Infrastructure

### 3.1 Recommended Cloud: AWS

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              AWS Infrastructure                              │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         VPC (10.0.0.0/16)                           │   │
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
│  │  │  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  │  │   │   │
│  │  │  │  │ Web App │  │ Search  │  │ Problem │  │Analytics│  │  │   │   │
│  │  │  │  │  Pods   │  │ Service │  │ Service │  │ Service │  │  │   │   │
│  │  │  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘  │  │   │   │
│  │  │  └───────────────────────────────────────────────────────┘  │   │   │
│  │  └─────────────────────────────────────────────────────────────┘   │   │
│  │                                                                      │   │
│  │  ┌─────────────────────────────────────────────────────────────┐   │   │
│  │  │                    Data Subnets                              │   │   │
│  │  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │   │   │
│  │  │  │   RDS       │  │ OpenSearch  │  │ ElastiCache │         │   │   │
│  │  │  │ PostgreSQL  │  │   Cluster   │  │   Redis     │         │   │   │
│  │  │  └─────────────┘  └─────────────┘  └─────────────┘         │   │   │
│  │  └─────────────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│  │     S3      │  │  CloudFront │  │   Lambda    │  │    SQS      │       │
│  │   Buckets   │  │     CDN     │  │  Functions  │  │   Queues    │       │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘       │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Service Mapping

| Component | AWS Service | Configuration |
|-----------|-------------|---------------|
| Container Orchestration | EKS | 3 node groups, auto-scaling |
| Database | RDS PostgreSQL | db.r6g.large, Multi-AZ |
| Search | OpenSearch | 3 data nodes, m6g.large |
| Cache | ElastiCache Redis | cache.r6g.large, cluster mode |
| Object Storage | S3 | Standard + Glacier for archives |
| CDN | CloudFront | Global edge locations |
| API Gateway | API Gateway / Kong | Regional deployment |
| Secrets | Secrets Manager | Automatic rotation |
| Monitoring | CloudWatch + X-Ray | Full observability |
| CI/CD | CodePipeline + CodeBuild | GitOps workflow |

### 3.3 Infrastructure as Code (Terraform)

```hcl
# Main infrastructure module
module "vpc" {
  source = "./modules/vpc"

  name            = "industry-problem-finder"
  cidr            = "10.0.0.0/16"
  azs             = ["us-east-1a", "us-east-1b", "us-east-1c"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]

  enable_nat_gateway = true
  single_nat_gateway = false
}

module "eks" {
  source = "./modules/eks"

  cluster_name    = "industry-problem-finder"
  cluster_version = "1.28"
  vpc_id          = module.vpc.vpc_id
  subnet_ids      = module.vpc.private_subnets

  node_groups = {
    general = {
      instance_types = ["t3.large"]
      min_size       = 2
      max_size       = 10
      desired_size   = 3
    }
  }
}

module "rds" {
  source = "./modules/rds"

  identifier     = "industry-problem-finder-db"
  engine         = "postgres"
  engine_version = "15.4"
  instance_class = "db.r6g.large"

  multi_az       = true
  vpc_id         = module.vpc.vpc_id
  subnet_ids     = module.vpc.database_subnets
}

module "opensearch" {
  source = "./modules/opensearch"

  domain_name    = "industry-problem-finder"
  engine_version = "OpenSearch_2.11"

  cluster_config = {
    instance_type  = "m6g.large.search"
    instance_count = 3
  }

  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.database_subnets
}
```

---

## 4. Security Architecture

### 4.1 Authentication & Authorization

```
┌─────────────────────────────────────────────────────────────────┐
│                     Authentication Flow                          │
│                                                                  │
│  ┌────────┐    ┌────────────┐    ┌────────────┐    ┌─────────┐ │
│  │  User  │───▶│  Auth0/    │───▶│   JWT      │───▶│   API   │ │
│  │        │    │  Cognito   │    │  Validation │    │ Gateway │ │
│  └────────┘    └────────────┘    └────────────┘    └─────────┘ │
│                      │                                    │      │
│                      ▼                                    ▼      │
│               ┌────────────┐                      ┌─────────┐   │
│               │   RBAC     │                      │  Rate   │   │
│               │  Policies  │                      │ Limiting│   │
│               └────────────┘                      └─────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

**Access Levels:**
- **Public**: View problems, basic search
- **Registered**: Save problems, personalization
- **Contributor**: Submit/edit problems
- **Moderator**: Review and approve content
- **Admin**: Full system access

### 4.2 Security Controls

| Control | Implementation |
|---------|----------------|
| Encryption at Rest | AES-256 for all storage |
| Encryption in Transit | TLS 1.3 everywhere |
| WAF | AWS WAF with OWASP rules |
| DDoS Protection | AWS Shield Standard |
| Secrets Management | AWS Secrets Manager |
| Audit Logging | CloudTrail + application logs |
| Vulnerability Scanning | Dependabot + container scanning |
| Penetration Testing | Annual third-party assessment |

---

## 5. Monitoring & Observability

### 5.1 Observability Stack

```
┌─────────────────────────────────────────────────────────────────┐
│                    Observability Architecture                    │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                      Application Layer                     │  │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐      │  │
│  │  │ OpenTel │  │ Metrics │  │  Logs   │  │ Traces  │      │  │
│  │  │  SDK    │  │ Export  │  │ Export  │  │ Export  │      │  │
│  │  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘      │  │
│  └───────┼────────────┼────────────┼────────────┼────────────┘  │
│          │            │            │            │                │
│          ▼            ▼            ▼            ▼                │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                     Collection Layer                       │  │
│  │  ┌─────────────────┐  ┌─────────────────┐                │  │
│  │  │   OTEL Collector │  │   Fluent Bit    │                │  │
│  │  └────────┬────────┘  └────────┬────────┘                │  │
│  └───────────┼────────────────────┼──────────────────────────┘  │
│              │                    │                              │
│              ▼                    ▼                              │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                      Storage Layer                         │  │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐                   │  │
│  │  │Prometheus│ │CloudWatch│  │  Jaeger │                   │  │
│  │  │         │  │  Logs   │  │         │                   │  │
│  │  └────┬────┘  └────┬────┘  └────┬────┘                   │  │
│  └───────┼────────────┼────────────┼─────────────────────────┘  │
│          │            │            │                             │
│          ▼            ▼            ▼                             │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                   Visualization Layer                      │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │                     Grafana                          │  │  │
│  │  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌────────┐ │  │  │
│  │  │  │Dashboards│ │  Alerts │  │ Explore │  │  SLOs  │ │  │  │
│  │  │  └─────────┘  └─────────┘  └─────────┘  └────────┘ │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 Key Metrics

**Application Metrics:**
- Request latency (p50, p95, p99)
- Error rates by endpoint
- Search query performance
- Cache hit rates
- API response times

**Business Metrics:**
- Daily/Monthly active users
- Search queries per day
- Problem views and engagement
- User contributions
- Conversion rates

**Infrastructure Metrics:**
- CPU/Memory utilization
- Database connections
- Search cluster health
- Cache memory usage
- Network throughput

---

## 6. Deployment Strategy

### 6.1 CI/CD Pipeline

```yaml
# GitHub Actions Workflow
name: Deploy Industry Problem Finder

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run tests
        run: npm test
      - name: Run linting
        run: npm run lint
      - name: Security scan
        run: npm audit

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build Docker images
        run: docker build -t app:${{ github.sha }} .
      - name: Push to ECR
        run: |
          aws ecr get-login-password | docker login --username AWS --password-stdin $ECR_REGISTRY
          docker push $ECR_REGISTRY/app:${{ github.sha }}

  deploy-staging:
    needs: build
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to staging
        run: |
          helm upgrade --install app ./helm \
            --set image.tag=${{ github.sha }} \
            --namespace staging

  deploy-production:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production
    steps:
      - name: Deploy to production
        run: |
          helm upgrade --install app ./helm \
            --set image.tag=${{ github.sha }} \
            --namespace production
```

### 6.2 Release Strategy

- **Blue-Green Deployment** for zero-downtime releases
- **Canary Releases** for gradual rollout (10% → 50% → 100%)
- **Feature Flags** for controlled feature enablement
- **Automated Rollback** on error rate threshold breach

---

## 7. Cost Estimation

### Monthly Infrastructure Costs (Production)

| Service | Configuration | Monthly Cost |
|---------|---------------|--------------|
| EKS | Cluster + 3-6 nodes (t3.large) | $300-500 |
| RDS PostgreSQL | db.r6g.large, Multi-AZ | $400-500 |
| OpenSearch | 3x m6g.large nodes | $500-700 |
| ElastiCache Redis | cache.r6g.large, 2 nodes | $300-400 |
| S3 + CloudFront | ~100GB storage + CDN | $50-100 |
| API Gateway | ~10M requests/month | $35-50 |
| Lambda | Data processing | $50-100 |
| Monitoring | CloudWatch + X-Ray | $100-150 |
| **Total** | | **$1,735-2,500** |

### AI/API Costs (Variable)

| Service | Usage | Monthly Cost |
|---------|-------|--------------|
| OpenAI Embeddings | ~1M tokens/day | $300-500 |
| Claude API | ~500K tokens/day | $200-400 |
| **Total AI** | | **$500-900** |

**Estimated Total: $2,235-3,400/month** (scaling with usage)
