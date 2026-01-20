# Problem Matters

A Problem Intelligence Platform focused on discovering, collecting, and facilitating solving humanity's most pressing problems, while leveraging AI as a force multiplier for individual impact.

## Vision

Problem Matters aims to become the definitive platform for discovering and understanding challenges across industries and regions, enabling researchers, entrepreneurs, policymakers, and changemakers to identify high-impact problem spaces where they can make a meaningful difference.

## Two Core Applications

### 1. Industry Problem Finder

An AI-powered search engine for discovering challenges across professional domains and industries.

**Focus Areas:**
- Technology & Software Engineering
- Energy & Utilities
- Healthcare & Life Sciences
- Financial Services
- Manufacturing & Industrial
- Agriculture & Food Systems
- Transportation & Logistics
- Arts, Media & Entertainment
- Education & Workforce Development
- Construction & Real Estate

**Key Features:**
- Semantic search with AI-powered query understanding
- Domain taxonomy navigation
- Problem severity and tractability scoring
- Solution gap identification
- Related problems discovery

### 2. Regional Sustainability Finder

A geographic-focused platform for discovering sustainability challenges aligned with UN SDGs.

**Focus Areas:**
- Sub-Saharan Africa
- South Asia
- Southeast Asia
- Latin America & Caribbean
- Middle East & North Africa
- Small Island Developing States
- All 193 UN member countries

**Key Features:**
- Interactive world map with problem overlays
- SDG alignment and progress tracking
- NGO/Nonprofit organization mapping
- Impact scoring and prioritization
- Regional briefings powered by AI

## Documentation

### Research
- [Industry Problem Domains Research](docs/research/industry-domains/industry-problem-domains-research.md)
- [Regional Sustainability Research](docs/research/regional-sustainability/regional-sustainability-research.md)

### Architecture
- [Industry Problem Finder Architecture](docs/architecture/industry-problem-finder-architecture.md)
- [Regional Sustainability Finder Architecture](docs/architecture/regional-sustainability-finder-architecture.md)
- [Cloud & Search Technology Solutions](docs/architecture/cloud-search-technology-solutions.md)

### Project Plans
- [Industry Problem Finder Project Plan](docs/project-plans/industry-problem-finder-project-plan.md)
- [Regional Sustainability Finder Project Plan](docs/project-plans/regional-sustainability-finder-project-plan.md)

## Technology Stack

### Backend
- Node.js / TypeScript
- PostgreSQL with PostGIS
- Elasticsearch / OpenSearch
- Redis

### Frontend
- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS
- Mapbox GL JS (for geographic features)

### AI/ML
- OpenAI Embeddings (text-embedding-3-large)
- Claude API (Anthropic) for advanced features
- Hybrid search (BM25 + semantic vectors)

### Infrastructure
- AWS (EKS, RDS, OpenSearch, ElastiCache)
- Terraform for IaC
- GitHub Actions for CI/CD

## Project Structure

```
ProblemMatters/
├── docs/
│   ├── research/
│   │   ├── industry-domains/
│   │   └── regional-sustainability/
│   ├── architecture/
│   └── project-plans/
├── LICENSE
└── README.md
```

## Getting Started

This repository currently contains research and planning documentation. Application code will be developed in subsequent phases.

## Contributing

We welcome contributions from researchers, developers, and domain experts. Please see our documentation for areas where help is needed.

## License

See [LICENSE](LICENSE) for details.
