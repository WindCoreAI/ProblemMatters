// Core type definitions matching research-result-schema.md

export type ProblemType =
  | 'technical'
  | 'process'
  | 'resource'
  | 'knowledge'
  | 'coordination'
  | 'regulatory'
  | 'market'
  | 'environmental'
  | 'social'
  | 'ethical';

export type ProblemScope =
  | 'individual'
  | 'team'
  | 'organization'
  | 'industry'
  | 'global';

export type ProblemMaturity = 'emerging' | 'growing' | 'mature' | 'declining';

export type Urgency = 'critical' | 'high' | 'medium' | 'low';

export type VerificationStatus =
  | 'unverified'
  | 'ai-verified'
  | 'human-verified'
  | 'disputed';

export type AttentionLevel =
  | 'saturated'
  | 'well-covered'
  | 'moderate'
  | 'underserved'
  | 'neglected';

export type RootCauseCategory =
  | 'technical'
  | 'organizational'
  | 'economic'
  | 'regulatory'
  | 'cultural'
  | 'environmental';

export type ContributionLevel = 'primary' | 'secondary' | 'contributing';

export type ConsequenceType = 'direct' | 'indirect' | 'cascading';

export type Timeframe = 'immediate' | 'short-term' | 'medium-term' | 'long-term';

export type SolutionType =
  | 'tool'
  | 'methodology'
  | 'framework'
  | 'product'
  | 'service'
  | 'policy'
  | 'standard';

export type AdoptionLevel =
  | 'experimental'
  | 'early'
  | 'growing'
  | 'mainstream'
  | 'declining';

export type GapType =
  | 'coverage'
  | 'quality'
  | 'accessibility'
  | 'cost'
  | 'integration'
  | 'scale'
  | 'awareness';

export type Difficulty = 'low' | 'medium' | 'high' | 'very-high';

export type StakeholderType =
  | 'affected'
  | 'contributor'
  | 'decision-maker'
  | 'funder'
  | 'expert';

export type InterestLevel = 'low' | 'medium' | 'high';

export type RelationType =
  | 'causes'
  | 'caused-by'
  | 'blocks'
  | 'blocked-by'
  | 'related-to'
  | 'subset-of'
  | 'superset-of'
  | 'contradicts';

export type SourceType =
  | 'academic'
  | 'industry-report'
  | 'news'
  | 'patent'
  | 'forum'
  | 'expert-interview'
  | 'survey'
  | 'government'
  | 'ngo';

export type TrendDirection = 'increasing' | 'stable' | 'decreasing';

export type SessionStatus =
  | 'queued'
  | 'in-progress'
  | 'completed'
  | 'failed'
  | 'cancelled';

// Reference Types
export interface TaxonomyReference {
  id: string;
  name: string;
  slug: string;
}

// Score Types
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
  attentionLevel?: AttentionLevel;
  activeResearchers?: string;
  fundingLevel?: string;
}

// Problem Components
export interface RootCause {
  description: string;
  category?: RootCauseCategory;
  contributionLevel?: ContributionLevel;
}

export interface Consequence {
  description: string;
  type?: ConsequenceType;
  affectedArea?: string;
  timeframe?: Timeframe;
}

export interface ExistingSolution {
  name: string;
  description: string;
  type?: SolutionType;
  effectiveness?: number;
  adoption?: AdoptionLevel;
  limitations?: string[];
  url?: string;
}

export interface SolutionGap {
  description: string;
  gapType?: GapType;
  opportunity?: string;
  difficulty?: Difficulty;
}

export interface Stakeholder {
  type: StakeholderType;
  description: string;
  examples?: string[];
  interest?: InterestLevel;
  influence?: InterestLevel;
}

export interface ProblemRelation {
  problemId: string;
  problemTitle?: string;
  relationType: RelationType;
  strength?: number;
}

export interface Source {
  type: SourceType;
  title: string;
  authors?: string[];
  url?: string;
  publishedAt?: string;
  accessedAt?: string;
  publisher?: string;
  doi?: string;
  credibilityScore?: number;
  relevantExcerpt?: string;
}

export interface ProblemMetrics {
  searchVolume?: number;
  academicPapers?: number;
  patentApplications?: number;
  mediaArticles?: number;
  trendDirection?: TrendDirection;
  dataCollectedAt?: string;
}

// Main Problem Interface
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
  neglectedness?: NeglectednessScore;
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

// Index Types
export interface IndexStatistics {
  totalProblems: number;
  totalIndustries: number;
  totalDomains: number;
  totalFields: number;
  problemsByIndustry?: Record<string, number>;
  lastResearchSession?: string;
}

export interface IndustryReference {
  id: string;
  name: string;
  slug: string;
  path: string;
  domainCount: number;
  problemCount: number;
  lastUpdated?: string;
}

export interface SessionReference {
  id: string;
  timestamp: string;
  targetIndustry: string;
  targetDomain?: string;
  problemsDiscovered?: number;
  status: 'completed' | 'in-progress' | 'failed';
}

export interface ResearchIndex {
  version: string;
  lastUpdated: string;
  statistics: IndexStatistics;
  industries: IndustryReference[];
  recentSessions?: SessionReference[];
}

// Industry Metadata Types
export interface DomainReference {
  id: string;
  name: string;
  slug: string;
  description?: string;
  fieldCount: number;
  problemCount: number;
}

export interface IndustryStatistics {
  totalProblems: number;
  totalDomains: number;
  totalFields: number;
  avgSeverity?: number;
  avgTractability?: number;
  topProblemTypes?: Array<{ type: string; count: number }>;
}

export interface IndustryMetadata {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon?: string;
  color?: string;
  keywords?: string[];
  naicsCode?: string;
  sicCode?: string;
  domains: DomainReference[];
  statistics?: IndustryStatistics;
  createdAt: string;
  updatedAt: string;
}

// Domain Metadata Types
export interface FieldReference {
  id: string;
  name: string;
  slug: string;
  description?: string;
  problemCount: number;
}

export interface DomainMetadata {
  id: string;
  name: string;
  slug: string;
  description?: string;
  industry: TaxonomyReference;
  fields?: FieldReference[];
  statistics?: {
    totalProblems: number;
    totalFields: number;
    avgSeverity?: number;
    avgTractability?: number;
    fieldProblems?: Record<string, number>;
  };
  createdAt?: string;
  updatedAt?: string;
  lastUpdated?: string;
}

// Problems File Type
export interface ProblemsFile {
  domain: TaxonomyReference;
  industry: TaxonomyReference;
  problems: Problem[];
  lastUpdated: string;
}

// Field-level Problems File Type
export interface FieldProblemsFile {
  field: TaxonomyReference;
  domain: TaxonomyReference;
  industry: TaxonomyReference;
  problems: Problem[];
  lastUpdated?: string;
}

// Field Metadata Type
export interface FieldMetadata {
  id: string;
  name: string;
  slug: string;
  description?: string;
  domain: TaxonomyReference;
  industry: TaxonomyReference;
  statistics?: {
    totalProblems: number;
    avgSeverity?: number;
    avgTractability?: number;
  };
  createdAt?: string;
  updatedAt?: string;
}
