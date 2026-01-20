<!--
  ============================================================================
  SYNC IMPACT REPORT
  ============================================================================
  Version Change: N/A → 1.0.0 (Initial constitution)

  Modified Principles: N/A (Initial version)

  Added Sections:
  - Core Principles (5 principles)
  - Quality & Data Standards
  - Development Workflow
  - Governance

  Removed Sections: N/A (Initial version)

  Templates Requiring Updates:
  - .specify/templates/plan-template.md: ✅ Compatible (Constitution Check section exists)
  - .specify/templates/spec-template.md: ✅ Compatible (Requirements structure aligns)
  - .specify/templates/tasks-template.md: ✅ Compatible (Test optional approach matches)
  - .specify/templates/checklist-template.md: ✅ Compatible (Generic structure)

  Follow-up TODOs: None
  ============================================================================
-->

# Problem Matters Constitution

## Core Principles

### I. Data-First

All features and decisions MUST prioritize the quality, accuracy, and integrity of problem data. This is the foundational principle that guides all other decisions.

- Problem data MUST be verifiable and traceable to authoritative sources
- AI-assisted research and content generation MUST include source attribution
- Data schemas MUST enforce consistency across Industry Problem Finder and Regional Sustainability Finder
- Automated data quality checks MUST run before any data is persisted
- Changes to data models MUST include migration plans that preserve data integrity

**Rationale**: As a Problem Intelligence Platform, the value proposition depends entirely on users trusting the accuracy and completeness of problem information. Compromised data quality undermines the entire mission.

### II. Search Excellence

Search functionality MUST deliver relevant, high-quality results that help users discover meaningful problems.

- Semantic search MUST understand user intent, not just keyword matching
- Results MUST be ranked by relevance, severity, and tractability
- Search performance MUST meet defined latency targets (p95 < 200ms)
- Search indexes MUST be kept in sync with source data within acceptable lag (< 5 minutes)
- Query understanding MUST gracefully handle ambiguous or incomplete inputs

**Rationale**: The core user journey is discovering problems. Poor search experience directly blocks users from achieving their goals.

### III. Geographic & Domain Accuracy

Location-based and domain-specific data MUST accurately represent real-world conditions.

- Geographic data MUST use standardized coordinates (WGS84) and administrative boundaries
- SDG alignments MUST reference official UN indicators and targets
- Industry taxonomies MUST be maintained and versioned
- Regional data MUST respect local context and avoid oversimplification
- Cross-references between problems, regions, and domains MUST be bidirectionally consistent

**Rationale**: Users make real-world decisions based on this data. Inaccurate geographic or domain mappings can misdirect resources and undermine trust.

### IV. API-Driven Architecture

The platform MUST expose functionality through well-defined APIs that enable integration and extensibility.

- All features MUST be accessible via documented REST or GraphQL APIs
- API contracts MUST be versioned and backward-compatible within major versions
- Breaking changes MUST follow deprecation procedures with migration guidance
- APIs MUST return structured errors with actionable messages
- Rate limiting and authentication MUST protect API integrity

**Rationale**: An API-first approach enables third-party integrations, mobile applications, and future extensibility without coupling to specific frontends.

### V. Simplicity & Maintainability

Solutions MUST be as simple as possible while meeting requirements. Complexity MUST be justified.

- YAGNI (You Aren't Gonna Need It): Do not build for hypothetical future needs
- Prefer standard library and well-supported dependencies over custom solutions
- Abstractions MUST solve real problems, not anticipated ones
- Code MUST be readable without extensive documentation
- Technical debt MUST be tracked and addressed, not ignored

**Rationale**: Over-engineering increases maintenance burden and slows iteration. The platform must evolve quickly as understanding of problem spaces grows.

## Quality & Data Standards

### Data Quality Gates

- All ingested problem data MUST pass schema validation
- AI-generated content MUST be flagged and include confidence scores
- User-contributed data MUST go through moderation workflow
- Data freshness indicators MUST be visible to users

### Performance Standards

- API response times: p50 < 100ms, p95 < 200ms, p99 < 500ms
- Search latency: p95 < 200ms for standard queries
- Map rendering: Initial load < 2s, interaction response < 100ms
- Database queries: No unbounded queries; all queries MUST use pagination

### Security Requirements

- All user data MUST be encrypted at rest and in transit
- API authentication MUST use industry-standard protocols (OAuth 2.0, JWT)
- PII MUST be handled in compliance with GDPR and applicable regulations
- Security vulnerabilities MUST be addressed within SLA (Critical: 24h, High: 7d)

## Development Workflow

### Code Quality

- All code MUST pass linting and formatting checks before merge
- Pull requests MUST include meaningful descriptions and context
- Code reviews MUST be completed by at least one other contributor
- No direct commits to main branch; all changes via PR

### Testing Approach

- Tests are RECOMMENDED for all new functionality
- Critical paths (authentication, data persistence, search) SHOULD have integration tests
- Contract tests are RECOMMENDED when integrating with external services
- Test coverage is not mandated but regressions MUST be addressed promptly

### Documentation

- API changes MUST include updated documentation
- Architecture decisions MUST be recorded (ADRs recommended)
- README and quickstart guides MUST be kept current

## Governance

### Amendment Process

1. Propose changes via PR to this constitution file
2. Changes MUST include rationale and impact assessment
3. Review period: minimum 48 hours for non-trivial changes
4. Approval requires consensus from active maintainers
5. Version number MUST be updated according to semantic versioning

### Versioning Policy

- **MAJOR**: Backward-incompatible changes to principles or governance
- **MINOR**: New principles, sections, or material expansions
- **PATCH**: Clarifications, typo fixes, non-semantic refinements

### Compliance Review

- PRs SHOULD verify adherence to constitution principles
- Violations MUST be documented with justification if accepted
- Periodic (quarterly) review of constitution relevance recommended

**Version**: 1.0.0 | **Ratified**: 2025-01-20 | **Last Amended**: 2025-01-20
