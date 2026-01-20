# Cloud Infrastructure & Search Technology Solutions

## Overview

This document outlines the cloud infrastructure and advanced search technology solutions for the Problem Matters platform, covering both the Industry Problem Finder and Regional Sustainability Finder applications. It details cloud provider options, search engine implementations, and AI-enhanced search capabilities.

---

## 1. Cloud Infrastructure Comparison

### 1.1 Cloud Provider Analysis

| Feature | AWS | Google Cloud | Azure |
|---------|-----|--------------|-------|
| **Kubernetes** | EKS (mature) | GKE (excellent) | AKS (good) |
| **PostgreSQL** | RDS + Aurora | Cloud SQL | Azure PostgreSQL |
| **Elasticsearch** | OpenSearch | Elastic Cloud | Azure Search |
| **Redis** | ElastiCache | Memorystore | Azure Cache |
| **Serverless** | Lambda | Cloud Functions | Azure Functions |
| **CDN** | CloudFront | Cloud CDN | Azure CDN |
| **AI/ML** | SageMaker, Bedrock | Vertex AI | Azure AI |
| **PostGIS Support** | RDS (native) | Cloud SQL | Flexible Server |
| **Pricing** | Competitive | Competitive | Competitive |
| **Geographic Reach** | Best | Good | Good |

### 1.2 Recommended: AWS

**Rationale:**
1. **Mature Kubernetes** - EKS well-documented, stable
2. **OpenSearch** - Managed Elasticsearch fork, cost-effective
3. **PostGIS on RDS** - Native support for geographic queries
4. **Global Infrastructure** - Best edge network for map tiles
5. **Bedrock Integration** - Easy access to Claude API
6. **Cost Optimization** - Spot instances, reserved capacity, Savings Plans

### 1.3 AWS Service Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Problem Matters - AWS Architecture                   │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                           Global Layer                               │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │   │
│  │  │   Route 53  │  │ CloudFront  │  │    WAF      │                 │   │
│  │  │    (DNS)    │  │    (CDN)    │  │ (Security)  │                 │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘                 │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│  ┌─────────────────────────────────┼───────────────────────────────────┐   │
│  │                         Regional Layer (us-east-1)                   │   │
│  │                                                                      │   │
│  │  ┌─────────────────────────────────────────────────────────────┐   │   │
│  │  │                    Application Layer                         │   │   │
│  │  │  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐            │   │   │
│  │  │  │  ALB   │  │  EKS   │  │  MWAA  │  │ Lambda │            │   │   │
│  │  │  │        │  │Cluster │  │Airflow │  │Workers │            │   │   │
│  │  │  └────────┘  └────────┘  └────────┘  └────────┘            │   │   │
│  │  └─────────────────────────────────────────────────────────────┘   │   │
│  │                                                                      │   │
│  │  ┌─────────────────────────────────────────────────────────────┐   │   │
│  │  │                      Data Layer                              │   │   │
│  │  │  ┌──────────┐  ┌───────────┐  ┌──────────┐  ┌────────────┐ │   │   │
│  │  │  │   RDS    │  │ OpenSearch│  │ElastiCache│ │     S3     │ │   │   │
│  │  │  │PostgreSQL│  │  Cluster  │  │   Redis   │  │  Storage   │ │   │   │
│  │  │  │ +PostGIS │  │           │  │           │  │            │ │   │   │
│  │  │  └──────────┘  └───────────┘  └──────────┘  └────────────┘ │   │   │
│  │  └─────────────────────────────────────────────────────────────┘   │   │
│  │                                                                      │   │
│  │  ┌─────────────────────────────────────────────────────────────┐   │   │
│  │  │                    Security & Monitoring                     │   │   │
│  │  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐  │   │   │
│  │  │  │  Secrets │  │CloudWatch│  │  X-Ray   │  │    KMS     │  │   │   │
│  │  │  │ Manager  │  │          │  │          │  │            │  │   │   │
│  │  │  └──────────┘  └──────────┘  └──────────┘  └────────────┘  │   │   │
│  │  └─────────────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Search Technology Solutions

### 2.1 Search Engine Options

| Engine | Pros | Cons | Use Case |
|--------|------|------|----------|
| **Elasticsearch/OpenSearch** | Mature, feature-rich, geo support | Resource intensive | Primary recommendation |
| **Meilisearch** | Fast, simple, typo-tolerant | Limited analytics | Small-scale alternative |
| **Typesense** | Real-time, easy setup | Smaller ecosystem | Alternative consideration |
| **Algolia** | Excellent DX, managed | Expensive at scale | Quick MVP option |
| **PostgreSQL Full-text** | No extra infra | Limited features | Supplementary |

### 2.2 Recommended: OpenSearch (AWS)

**Architecture:**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         OpenSearch Cluster Architecture                      │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         Master Nodes (3)                             │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │   │
│  │  │  Master 1   │  │  Master 2   │  │  Master 3   │                 │   │
│  │  │ (dedicated) │  │ (dedicated) │  │ (dedicated) │                 │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘                 │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         Data Nodes (3-6)                             │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │   │
│  │  │   Data 1    │  │   Data 2    │  │   Data 3    │  ...           │   │
│  │  │ m6g.large   │  │ m6g.large   │  │ m6g.large   │                 │   │
│  │  │ 100GB EBS   │  │ 100GB EBS   │  │ 100GB EBS   │                 │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘                 │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  Configuration:                                                              │
│  - Version: OpenSearch 2.11                                                  │
│  - Instance type: m6g.large (data), m6g.medium (master)                     │
│  - Storage: GP3 EBS, 100GB per node                                         │
│  - Replicas: 1 (for production)                                             │
│  - Availability: Multi-AZ                                                    │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.3 Index Design

#### Industry Problem Finder Index

```json
{
  "settings": {
    "number_of_shards": 3,
    "number_of_replicas": 1,
    "analysis": {
      "analyzer": {
        "problem_analyzer": {
          "type": "custom",
          "tokenizer": "standard",
          "filter": ["lowercase", "english_stemmer", "english_stop"]
        }
      },
      "filter": {
        "english_stemmer": {
          "type": "stemmer",
          "language": "english"
        },
        "english_stop": {
          "type": "stop",
          "stopwords": "_english_"
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "id": { "type": "keyword" },
      "title": {
        "type": "text",
        "analyzer": "problem_analyzer",
        "fields": {
          "keyword": { "type": "keyword" },
          "suggest": {
            "type": "completion",
            "contexts": [
              { "name": "domain", "type": "category" }
            ]
          }
        }
      },
      "description": {
        "type": "text",
        "analyzer": "problem_analyzer"
      },
      "domain": {
        "properties": {
          "id": { "type": "keyword" },
          "name": { "type": "keyword" },
          "path": { "type": "keyword" },
          "level": { "type": "integer" }
        }
      },
      "tags": { "type": "keyword" },
      "severity_score": { "type": "float" },
      "tractability_score": { "type": "float" },
      "neglectedness_score": { "type": "float" },
      "maturity": { "type": "keyword" },
      "scope": { "type": "keyword" },
      "embedding": {
        "type": "knn_vector",
        "dimension": 1536,
        "method": {
          "name": "hnsw",
          "space_type": "cosinesimil",
          "engine": "nmslib",
          "parameters": {
            "ef_construction": 128,
            "m": 24
          }
        }
      },
      "created_at": { "type": "date" },
      "updated_at": { "type": "date" }
    }
  }
}
```

#### Regional Sustainability Finder Index

```json
{
  "settings": {
    "number_of_shards": 3,
    "number_of_replicas": 1,
    "analysis": {
      "analyzer": {
        "multilingual_analyzer": {
          "type": "custom",
          "tokenizer": "standard",
          "filter": ["lowercase", "icu_folding"]
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "id": { "type": "keyword" },
      "title": {
        "type": "text",
        "analyzer": "multilingual_analyzer",
        "fields": {
          "keyword": { "type": "keyword" },
          "suggest": { "type": "completion" }
        }
      },
      "description": {
        "type": "text",
        "analyzer": "multilingual_analyzer"
      },
      "region": {
        "properties": {
          "id": { "type": "keyword" },
          "name": { "type": "keyword" },
          "country_code": { "type": "keyword" },
          "path": { "type": "keyword" },
          "location": { "type": "geo_point" },
          "boundary": { "type": "geo_shape" }
        }
      },
      "sdg": {
        "properties": {
          "primary": { "type": "integer" },
          "secondary": { "type": "integer" },
          "targets": { "type": "keyword" }
        }
      },
      "urgency_level": { "type": "keyword" },
      "affected_population": { "type": "long" },
      "organizations": {
        "type": "nested",
        "properties": {
          "id": { "type": "keyword" },
          "name": { "type": "keyword" },
          "activity_type": { "type": "keyword" }
        }
      },
      "embedding": {
        "type": "knn_vector",
        "dimension": 1536,
        "method": {
          "name": "hnsw",
          "space_type": "cosinesimil",
          "engine": "nmslib"
        }
      },
      "created_at": { "type": "date" },
      "updated_at": { "type": "date" }
    }
  }
}
```

---

## 3. AI-Enhanced Search Implementation

### 3.1 Hybrid Search Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Hybrid Search Pipeline                               │
│                                                                              │
│  User Query: "What are the biggest challenges in renewable energy storage?" │
│                                    │                                         │
│                          ┌─────────▼─────────┐                              │
│                          │  Query Processing │                              │
│                          └─────────┬─────────┘                              │
│                                    │                                         │
│          ┌─────────────────────────┼─────────────────────────┐              │
│          │                         │                         │               │
│  ┌───────▼───────┐        ┌───────▼───────┐        ┌───────▼───────┐       │
│  │    Keyword    │        │   Semantic    │        │    Claude     │       │
│  │    Search     │        │    Search     │        │Query Expansion│       │
│  │   (BM25)      │        │  (k-NN)       │        │               │       │
│  └───────┬───────┘        └───────┬───────┘        └───────┬───────┘       │
│          │                        │                        │                │
│          └────────────────────────┼────────────────────────┘                │
│                                   │                                         │
│                          ┌────────▼────────┐                                │
│                          │  Result Fusion  │                                │
│                          │   (RRF/Linear)  │                                │
│                          └────────┬────────┘                                │
│                                   │                                         │
│                          ┌────────▼────────┐                                │
│                          │   Re-ranking    │                                │
│                          │  (Cross-encoder)│                                │
│                          └────────┬────────┘                                │
│                                   │                                         │
│                          ┌────────▼────────┐                                │
│                          │  Final Results  │                                │
│                          └─────────────────┘                                │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Search Service Implementation

```typescript
// search-service/src/services/hybrid-search.service.ts

import { Client } from '@opensearch-project/opensearch';
import { Anthropic } from '@anthropic-ai/sdk';
import OpenAI from 'openai';

interface SearchQuery {
  query: string;
  filters?: SearchFilters;
  pagination?: PaginationParams;
  semanticWeight?: number;  // 0-1, default 0.5
}

interface SearchFilters {
  domains?: string[];
  severity?: { min?: number; max?: number };
  maturity?: string[];
  tags?: string[];
}

export class HybridSearchService {
  private esClient: Client;
  private openai: OpenAI;
  private anthropic: Anthropic;

  constructor() {
    this.esClient = new Client({ node: process.env.OPENSEARCH_URL });
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    this.anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }

  async search(params: SearchQuery): Promise<SearchResults> {
    const { query, filters, pagination, semanticWeight = 0.5 } = params;

    // Step 1: Generate query embedding
    const queryEmbedding = await this.generateEmbedding(query);

    // Step 2: Optionally expand query with Claude
    const expandedTerms = await this.expandQuery(query);

    // Step 3: Build hybrid query
    const esQuery = this.buildHybridQuery({
      query,
      expandedTerms,
      embedding: queryEmbedding,
      filters,
      semanticWeight
    });

    // Step 4: Execute search
    const response = await this.esClient.search({
      index: 'problems',
      body: esQuery,
      from: pagination?.offset ?? 0,
      size: pagination?.limit ?? 20
    });

    // Step 5: Optional re-ranking for top results
    const rerankedResults = await this.rerank(query, response.body.hits.hits);

    return {
      results: rerankedResults,
      total: response.body.hits.total.value,
      aggregations: this.formatAggregations(response.body.aggregations),
      took: response.body.took
    };
  }

  private async generateEmbedding(text: string): Promise<number[]> {
    const response = await this.openai.embeddings.create({
      model: 'text-embedding-3-large',
      input: text,
      dimensions: 1536
    });
    return response.data[0].embedding;
  }

  private async expandQuery(query: string): Promise<string[]> {
    const response = await this.anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 200,
      messages: [{
        role: 'user',
        content: `Given this search query about industry problems: "${query}"

Generate 3-5 related search terms that would help find relevant problems.
Return only the terms, one per line, no explanations.`
      }]
    });

    const content = response.content[0];
    if (content.type === 'text') {
      return content.text.split('\n').filter(t => t.trim());
    }
    return [];
  }

  private buildHybridQuery(params: {
    query: string;
    expandedTerms: string[];
    embedding: number[];
    filters?: SearchFilters;
    semanticWeight: number;
  }) {
    const { query, expandedTerms, embedding, filters, semanticWeight } = params;
    const keywordWeight = 1 - semanticWeight;

    // Combine original query with expanded terms
    const fullQuery = [query, ...expandedTerms].join(' ');

    return {
      query: {
        bool: {
          should: [
            // Keyword search (BM25)
            {
              bool: {
                should: [
                  {
                    multi_match: {
                      query: fullQuery,
                      fields: ['title^3', 'description', 'tags^2'],
                      type: 'best_fields',
                      fuzziness: 'AUTO'
                    }
                  }
                ],
                boost: keywordWeight * 10
              }
            },
            // Semantic search (k-NN)
            {
              knn: {
                embedding: {
                  vector: embedding,
                  k: 100
                }
              },
              boost: semanticWeight * 10
            }
          ],
          filter: this.buildFilters(filters)
        }
      },
      aggs: {
        domains: { terms: { field: 'domain.name', size: 20 } },
        maturity: { terms: { field: 'maturity' } },
        severity_histogram: {
          histogram: { field: 'severity_score', interval: 0.1 }
        },
        tags: { terms: { field: 'tags', size: 50 } }
      }
    };
  }

  private buildFilters(filters?: SearchFilters): any[] {
    if (!filters) return [];

    const filterClauses: any[] = [];

    if (filters.domains?.length) {
      filterClauses.push({ terms: { 'domain.id': filters.domains } });
    }

    if (filters.severity) {
      const range: any = {};
      if (filters.severity.min !== undefined) range.gte = filters.severity.min;
      if (filters.severity.max !== undefined) range.lte = filters.severity.max;
      filterClauses.push({ range: { severity_score: range } });
    }

    if (filters.maturity?.length) {
      filterClauses.push({ terms: { maturity: filters.maturity } });
    }

    if (filters.tags?.length) {
      filterClauses.push({ terms: { tags: filters.tags } });
    }

    return filterClauses;
  }

  private async rerank(query: string, hits: any[]): Promise<any[]> {
    // For top results, use Claude to re-rank based on relevance
    if (hits.length <= 3) return hits;

    const topHits = hits.slice(0, 20);

    const response = await this.anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      messages: [{
        role: 'user',
        content: `Rank these problem titles by relevance to the query: "${query}"

Problems:
${topHits.map((h, i) => `${i + 1}. ${h._source.title}`).join('\n')}

Return only the numbers in order of relevance, most relevant first.
Example: 3, 1, 5, 2, 4`
      }]
    });

    const content = response.content[0];
    if (content.type === 'text') {
      const order = content.text.split(',').map(s => parseInt(s.trim()) - 1);
      const reranked = order
        .filter(i => i >= 0 && i < topHits.length)
        .map(i => topHits[i]);

      // Append any hits that weren't in the reranking
      const rerankedIds = new Set(reranked.map(h => h._id));
      const remaining = hits.filter(h => !rerankedIds.has(h._id));

      return [...reranked, ...remaining];
    }

    return hits;
  }
}
```

### 3.3 Geographic Search for Regional Sustainability

```typescript
// search-service/src/services/geo-search.service.ts

export class GeoSearchService {
  private esClient: Client;

  async searchByRegion(params: {
    regionId?: string;
    boundingBox?: BoundingBox;
    point?: GeoPoint;
    radius?: string;  // e.g., "50km"
    sdgFilter?: number[];
    urgencyFilter?: string[];
    query?: string;
  }): Promise<SearchResults> {
    const geoFilter = this.buildGeoFilter(params);

    const esQuery = {
      query: {
        bool: {
          must: params.query ? [{
            multi_match: {
              query: params.query,
              fields: ['title^2', 'description']
            }
          }] : [{ match_all: {} }],
          filter: [
            geoFilter,
            ...this.buildSdgFilters(params.sdgFilter),
            ...this.buildUrgencyFilters(params.urgencyFilter)
          ]
        }
      },
      aggs: {
        by_country: {
          terms: { field: 'region.country_code', size: 50 }
        },
        by_sdg: {
          terms: { field: 'sdg.primary' }
        },
        by_urgency: {
          terms: { field: 'urgency_level' }
        },
        geographic_clusters: {
          geohash_grid: {
            field: 'region.location',
            precision: 4
          },
          aggs: {
            centroid: { geo_centroid: { field: 'region.location' } },
            problem_count: { value_count: { field: 'id' } }
          }
        }
      }
    };

    return this.esClient.search({
      index: 'sustainability_problems',
      body: esQuery
    });
  }

  private buildGeoFilter(params: any): any {
    if (params.regionId) {
      return { term: { 'region.id': params.regionId } };
    }

    if (params.boundingBox) {
      return {
        geo_bounding_box: {
          'region.location': {
            top_left: {
              lat: params.boundingBox.north,
              lon: params.boundingBox.west
            },
            bottom_right: {
              lat: params.boundingBox.south,
              lon: params.boundingBox.east
            }
          }
        }
      };
    }

    if (params.point && params.radius) {
      return {
        geo_distance: {
          distance: params.radius,
          'region.location': {
            lat: params.point.lat,
            lon: params.point.lon
          }
        }
      };
    }

    return { match_all: {} };
  }

  async findHotspots(params: {
    bounds: BoundingBox;
    precision?: number;  // geohash precision
    minProblems?: number;
  }): Promise<Hotspot[]> {
    const response = await this.esClient.search({
      index: 'sustainability_problems',
      body: {
        size: 0,
        query: {
          geo_bounding_box: {
            'region.location': {
              top_left: { lat: params.bounds.north, lon: params.bounds.west },
              bottom_right: { lat: params.bounds.south, lon: params.bounds.east }
            }
          }
        },
        aggs: {
          hotspots: {
            geohash_grid: {
              field: 'region.location',
              precision: params.precision ?? 5
            },
            aggs: {
              center: { geo_centroid: { field: 'region.location' } },
              avg_severity: { avg: { field: 'severity_score' } },
              total_affected: { sum: { field: 'affected_population' } },
              top_problems: {
                top_hits: {
                  size: 3,
                  _source: ['id', 'title', 'urgency_level']
                }
              }
            }
          }
        }
      }
    });

    return response.body.aggregations.hotspots.buckets
      .filter((b: any) => b.doc_count >= (params.minProblems ?? 1))
      .map((bucket: any) => ({
        geohash: bucket.key,
        location: bucket.center.location,
        problemCount: bucket.doc_count,
        avgSeverity: bucket.avg_severity.value,
        totalAffected: bucket.total_affected.value,
        topProblems: bucket.top_problems.hits.hits.map((h: any) => h._source)
      }));
  }
}
```

---

## 4. Embedding Generation Pipeline

### 4.1 Embedding Service

```typescript
// ai-service/src/services/embedding.service.ts

import OpenAI from 'openai';
import { Redis } from 'ioredis';

export class EmbeddingService {
  private openai: OpenAI;
  private redis: Redis;
  private readonly CACHE_TTL = 60 * 60 * 24 * 7;  // 7 days

  constructor() {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    this.redis = new Redis(process.env.REDIS_URL);
  }

  async generateEmbedding(text: string, useCache = true): Promise<number[]> {
    const cacheKey = `embedding:${this.hashText(text)}`;

    // Check cache first
    if (useCache) {
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    }

    // Generate new embedding
    const response = await this.openai.embeddings.create({
      model: 'text-embedding-3-large',
      input: this.prepareText(text),
      dimensions: 1536
    });

    const embedding = response.data[0].embedding;

    // Cache the result
    await this.redis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(embedding));

    return embedding;
  }

  async generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
    // Prepare texts and check cache
    const results: (number[] | null)[] = new Array(texts.length).fill(null);
    const uncachedIndices: number[] = [];
    const uncachedTexts: string[] = [];

    for (let i = 0; i < texts.length; i++) {
      const cacheKey = `embedding:${this.hashText(texts[i])}`;
      const cached = await this.redis.get(cacheKey);

      if (cached) {
        results[i] = JSON.parse(cached);
      } else {
        uncachedIndices.push(i);
        uncachedTexts.push(this.prepareText(texts[i]));
      }
    }

    // Generate embeddings for uncached texts
    if (uncachedTexts.length > 0) {
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-3-large',
        input: uncachedTexts,
        dimensions: 1536
      });

      // Cache and assign results
      for (let i = 0; i < uncachedIndices.length; i++) {
        const embedding = response.data[i].embedding;
        const originalIndex = uncachedIndices[i];
        const cacheKey = `embedding:${this.hashText(texts[originalIndex])}`;

        results[originalIndex] = embedding;
        await this.redis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(embedding));
      }
    }

    return results as number[][];
  }

  private prepareText(text: string): string {
    // Truncate to avoid token limits
    const maxChars = 8000 * 4;  // Approximate chars for 8000 tokens
    return text.slice(0, maxChars);
  }

  private hashText(text: string): string {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(text).digest('hex');
  }
}
```

### 4.2 Index Synchronization Pipeline

```typescript
// data-pipeline/src/jobs/sync-embeddings.job.ts

import { EmbeddingService } from '../services/embedding.service';
import { OpenSearchClient } from '../clients/opensearch.client';
import { PostgresClient } from '../clients/postgres.client';

export class EmbeddingSyncJob {
  private embeddingService: EmbeddingService;
  private esClient: OpenSearchClient;
  private pgClient: PostgresClient;

  async run(): Promise<void> {
    console.log('Starting embedding sync job...');

    // Get problems that need embedding updates
    const problemsToProcess = await this.pgClient.query(`
      SELECT id, title, description, tags
      FROM problems
      WHERE updated_at > last_indexed_at
         OR last_indexed_at IS NULL
      ORDER BY updated_at DESC
      LIMIT 1000
    `);

    console.log(`Processing ${problemsToProcess.rows.length} problems`);

    // Process in batches
    const batchSize = 50;
    for (let i = 0; i < problemsToProcess.rows.length; i += batchSize) {
      const batch = problemsToProcess.rows.slice(i, i + batchSize);

      // Generate embeddings
      const texts = batch.map(p =>
        `${p.title}\n${p.description}\n${(p.tags || []).join(' ')}`
      );
      const embeddings = await this.embeddingService.generateBatchEmbeddings(texts);

      // Prepare bulk index operations
      const bulkOps = batch.flatMap((problem, idx) => [
        { index: { _index: 'problems', _id: problem.id } },
        { ...problem, embedding: embeddings[idx] }
      ]);

      // Bulk index to OpenSearch
      await this.esClient.bulk({ body: bulkOps });

      // Update last_indexed_at
      const ids = batch.map(p => p.id);
      await this.pgClient.query(`
        UPDATE problems
        SET last_indexed_at = NOW()
        WHERE id = ANY($1)
      `, [ids]);

      console.log(`Processed batch ${i / batchSize + 1}`);
    }

    console.log('Embedding sync job completed');
  }
}
```

---

## 5. Performance Optimization

### 5.1 Caching Strategy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Multi-Level Caching Strategy                         │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         Level 1: CDN (CloudFront)                    │   │
│  │  - Static assets: JS, CSS, images (TTL: 1 year, versioned)          │   │
│  │  - Map tiles: Vector/raster tiles (TTL: 24 hours)                   │   │
│  │  - API responses: Popular searches (TTL: 5 minutes)                 │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│  ┌─────────────────────────────────▼───────────────────────────────────┐   │
│  │                         Level 2: API Gateway Cache                   │   │
│  │  - GET requests with query params (TTL: 1-5 minutes)                │   │
│  │  - Geographic aggregations (TTL: 10 minutes)                        │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│  ┌─────────────────────────────────▼───────────────────────────────────┐   │
│  │                         Level 3: Redis Cache                         │   │
│  │  - Search results: query_hash -> results (TTL: 5 minutes)           │   │
│  │  - Problem details: problem_id -> full data (TTL: 1 hour)           │   │
│  │  - Embeddings: text_hash -> embedding (TTL: 7 days)                 │   │
│  │  - Aggregations: agg_key -> computed values (TTL: 15 minutes)       │   │
│  │  - User sessions: session_id -> user data (TTL: 24 hours)           │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│  ┌─────────────────────────────────▼───────────────────────────────────┐   │
│  │                         Level 4: Application Cache                   │   │
│  │  - In-memory LRU: Domain taxonomy, SDG reference data               │   │
│  │  - Computed values: Frequently accessed computations                 │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Search Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Search latency (p50) | <100ms | API response time |
| Search latency (p95) | <300ms | API response time |
| Search latency (p99) | <500ms | API response time |
| Autocomplete latency | <50ms | Suggestion response |
| Map tile load | <100ms | Time to first tile |
| Full map render | <2s | Complete map display |

### 5.3 Query Optimization

```typescript
// search-service/src/utils/query-optimizer.ts

export class QueryOptimizer {
  /**
   * Optimize search query based on query analysis
   */
  optimize(query: string, filters: any): OptimizedQuery {
    const analysis = this.analyzeQuery(query);

    return {
      // Use filter context for non-scoring queries
      useFilterContext: analysis.isFilterOnly,

      // Limit fields searched based on query type
      searchFields: this.selectSearchFields(analysis),

      // Adjust pagination strategy
      trackTotalHits: analysis.needsTotalCount ? true : 1000,

      // Pre-filter aggregations
      filterAggregations: this.shouldFilterAggs(filters),

      // Enable request caching
      requestCache: !analysis.hasPersonalization,

      // Boost strategy
      boostStrategy: this.selectBoostStrategy(analysis)
    };
  }

  private analyzeQuery(query: string) {
    return {
      isFilterOnly: !query || query.trim() === '',
      needsTotalCount: false,  // Usually not needed for UI
      hasPersonalization: false,
      queryLength: query.length,
      hasSpecificTerms: this.detectSpecificTerms(query)
    };
  }

  private selectSearchFields(analysis: any): string[] {
    if (analysis.hasSpecificTerms) {
      // For specific searches, also check exact match fields
      return ['title^4', 'title.keyword^5', 'description', 'tags^3'];
    }
    return ['title^3', 'description', 'tags^2'];
  }
}
```

---

## 6. Cost Optimization

### 6.1 AWS Cost Management

| Service | Optimization Strategy | Savings Potential |
|---------|----------------------|-------------------|
| EKS | Spot instances for non-critical workloads | 60-70% |
| RDS | Reserved instances (1-year) | 30-40% |
| OpenSearch | Reserved instances, right-sizing | 30-40% |
| ElastiCache | Reserved nodes | 30-40% |
| S3 | Intelligent-Tiering, lifecycle policies | 20-30% |
| CloudFront | Committed use, origin shield | 10-20% |
| Lambda | ARM64 (Graviton2), memory optimization | 20-30% |

### 6.2 AI/API Cost Management

```typescript
// ai-service/src/utils/cost-controller.ts

export class AICostController {
  private dailyBudget: number;
  private currentSpend: number = 0;
  private redis: Redis;

  constructor(dailyBudgetUSD: number) {
    this.dailyBudget = dailyBudgetUSD;
    this.redis = new Redis(process.env.REDIS_URL);
  }

  async canMakeRequest(estimatedCost: number): Promise<boolean> {
    const currentSpend = await this.getCurrentSpend();
    return (currentSpend + estimatedCost) < this.dailyBudget;
  }

  async trackRequest(actualCost: number): Promise<void> {
    const key = `ai_spend:${this.getTodayKey()}`;
    await this.redis.incrbyfloat(key, actualCost);
    await this.redis.expire(key, 86400 * 2);  // Keep for 2 days
  }

  async getCurrentSpend(): Promise<number> {
    const key = `ai_spend:${this.getTodayKey()}`;
    const spend = await this.redis.get(key);
    return parseFloat(spend || '0');
  }

  // Estimate costs before making API calls
  estimateCost(service: 'openai' | 'anthropic', tokens: number): number {
    const rates = {
      openai: {
        'text-embedding-3-large': 0.00013 / 1000,  // per token
      },
      anthropic: {
        'claude-sonnet-4-20250514': { input: 0.003 / 1000, output: 0.015 / 1000 }
      }
    };
    // Simplified estimation
    return tokens * 0.00015;  // Average rate
  }
}
```

### 6.3 Monthly Cost Breakdown (Production)

#### Industry Problem Finder

| Service | Configuration | Monthly Cost |
|---------|---------------|--------------|
| EKS Cluster | Control plane | $73 |
| EC2 (EKS nodes) | 3x t3.large (mix spot/on-demand) | $150-250 |
| RDS PostgreSQL | db.r6g.large, Multi-AZ | $400-500 |
| OpenSearch | 3x m6g.large data nodes | $500-600 |
| ElastiCache Redis | cache.r6g.large, 2 nodes | $300-400 |
| S3 + CloudFront | 100GB + CDN | $50-100 |
| Other (NAT, ALB, etc.) | Various | $150-200 |
| **Infrastructure Total** | | **$1,623-2,123** |
| OpenAI API | Embeddings | $300-500 |
| Claude API | Query expansion, re-ranking | $200-400 |
| **AI Total** | | **$500-900** |
| **Grand Total** | | **$2,123-3,023** |

#### Regional Sustainability Finder

| Service | Configuration | Monthly Cost |
|---------|---------------|--------------|
| EKS Cluster | Control plane | $73 |
| EC2 (EKS nodes) | 4x t3.large (mix spot/on-demand) | $200-350 |
| RDS PostgreSQL + PostGIS | db.r6g.large, Multi-AZ | $450-550 |
| OpenSearch | 3x m6g.large data nodes | $500-600 |
| ElastiCache Redis | cache.r6g.large, 2 nodes | $300-400 |
| S3 (Geo data + tiles) | 500GB + CDN | $100-200 |
| CloudFront (Map tiles) | High traffic | $100-200 |
| MWAA (Airflow) | Small | $300-400 |
| Other (NAT, ALB, etc.) | Various | $200-250 |
| **Infrastructure Total** | | **$2,223-3,023** |
| OpenAI API | Embeddings | $400-600 |
| Claude API | Regional analysis, briefings | $300-500 |
| Mapbox (optional) | Tiles, geocoding | $200-400 |
| **AI/API Total** | | **$900-1,500** |
| **Grand Total** | | **$3,123-4,523** |

---

## 7. Security Considerations

### 7.1 Search Security

```typescript
// search-service/src/middleware/search-security.ts

export class SearchSecurityMiddleware {
  /**
   * Sanitize and validate search queries to prevent injection
   */
  sanitizeQuery(query: string): string {
    // Remove Elasticsearch query DSL injection attempts
    const dangerous = /[{}\[\]"'\\]/g;
    return query.replace(dangerous, '');
  }

  /**
   * Rate limit search requests
   */
  async checkRateLimit(userId: string, ip: string): Promise<boolean> {
    const key = userId ? `ratelimit:user:${userId}` : `ratelimit:ip:${ip}`;
    const limit = userId ? 100 : 20;  // Per minute

    const current = await this.redis.incr(key);
    if (current === 1) {
      await this.redis.expire(key, 60);
    }

    return current <= limit;
  }

  /**
   * Validate filter parameters
   */
  validateFilters(filters: any): boolean {
    // Whitelist allowed filter fields
    const allowedFields = ['domain', 'severity', 'maturity', 'tags', 'region', 'sdg'];
    const filterKeys = Object.keys(filters || {});

    return filterKeys.every(key => allowedFields.includes(key));
  }
}
```

### 7.2 Data Protection

- **Encryption at rest**: AES-256 for all storage (RDS, OpenSearch, S3)
- **Encryption in transit**: TLS 1.3 for all connections
- **Access control**: IAM roles, least privilege principle
- **Audit logging**: CloudTrail for all API calls
- **VPC isolation**: Private subnets for data layer

---

## 8. Monitoring & Alerting

### 8.1 Key Metrics Dashboard

```yaml
# Grafana dashboard configuration
dashboards:
  search-performance:
    panels:
      - title: Search Latency
        type: graph
        metrics:
          - search_latency_p50
          - search_latency_p95
          - search_latency_p99

      - title: Search Volume
        type: graph
        metrics:
          - search_requests_per_second
          - search_errors_per_second

      - title: Cache Hit Rate
        type: stat
        metric: cache_hit_ratio

      - title: OpenSearch Cluster Health
        type: stat
        metric: opensearch_cluster_status

  ai-costs:
    panels:
      - title: Daily AI Spend
        type: gauge
        metric: ai_daily_spend_usd
        thresholds: [50, 80, 100]

      - title: Embedding Generation Rate
        type: graph
        metric: embeddings_generated_per_minute

      - title: Claude API Calls
        type: graph
        metric: claude_api_calls_per_minute
```

### 8.2 Alerting Rules

| Alert | Condition | Severity | Action |
|-------|-----------|----------|--------|
| High Search Latency | p95 > 500ms for 5 min | Warning | Investigate |
| Search Errors | Error rate > 1% | Critical | Page on-call |
| OpenSearch Unhealthy | Cluster yellow/red | Critical | Page on-call |
| AI Budget Exceeded | Daily spend > 90% | Warning | Notify team |
| Cache Hit Rate Low | < 50% for 15 min | Warning | Investigate |
| Index Sync Failure | Job fails 3x | Critical | Page on-call |

---

## 9. Summary

This document outlines a comprehensive cloud and search technology solution for Problem Matters:

1. **Cloud Infrastructure**: AWS-based architecture with EKS, RDS+PostGIS, OpenSearch, and ElastiCache
2. **Search Technology**: Hybrid search combining BM25 keyword search with semantic vector search
3. **AI Enhancement**: Claude for query expansion and re-ranking, OpenAI for embeddings
4. **Geographic Capabilities**: PostGIS for spatial queries, OpenSearch geo features for map-based search
5. **Performance**: Multi-level caching, query optimization, target <300ms p95 latency
6. **Cost Management**: Spot instances, reserved capacity, AI cost controls
7. **Security**: Encryption, access control, query sanitization
8. **Monitoring**: Comprehensive metrics, dashboards, and alerting

Total estimated monthly cost: **$5,250-7,550** for both applications combined at production scale.
