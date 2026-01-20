import * as fs from 'fs/promises';
import * as path from 'path';
import type {
  ResearchIndex,
  IndustryMetadata,
  DomainMetadata,
  FieldMetadata,
  Problem,
  ProblemsFile,
  FieldProblemsFile,
} from '@/lib/types/research';

// Data is stored in public/research-data for static serving
// The path is relative to the research-viewer directory
const DATA_PATH = process.env.DATA_PATH || 'public/research-data';

function getDataPath(): string {
  return path.join(process.cwd(), DATA_PATH);
}

export async function loadIndex(): Promise<ResearchIndex> {
  const filePath = path.join(getDataPath(), 'index.json');
  const content = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(content);
}

export async function loadIndustry(slug: string): Promise<IndustryMetadata | null> {
  try {
    const filePath = path.join(
      getDataPath(),
      'industries',
      slug,
      '_metadata.json'
    );
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

export async function loadDomain(
  industrySlug: string,
  domainSlug: string
): Promise<DomainMetadata | null> {
  try {
    const filePath = path.join(
      getDataPath(),
      'industries',
      industrySlug,
      domainSlug,
      '_metadata.json'
    );
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

export async function loadFieldProblems(
  industrySlug: string,
  domainSlug: string,
  fieldSlug: string
): Promise<Problem[]> {
  try {
    const filePath = path.join(
      getDataPath(),
      'industries',
      industrySlug,
      domainSlug,
      'fields',
      `${fieldSlug}.json`
    );
    const content = await fs.readFile(filePath, 'utf-8');
    const data: FieldProblemsFile = JSON.parse(content);
    return data.problems || [];
  } catch {
    return [];
  }
}

export async function loadField(
  industrySlug: string,
  domainSlug: string,
  fieldSlug: string
): Promise<FieldMetadata | null> {
  try {
    const filePath = path.join(
      getDataPath(),
      'industries',
      industrySlug,
      domainSlug,
      'fields',
      `${fieldSlug}.json`
    );
    const content = await fs.readFile(filePath, 'utf-8');
    const data: FieldProblemsFile = JSON.parse(content);
    return {
      id: data.field.id,
      name: data.field.name,
      slug: data.field.slug,
      description: (data.field as { description?: string }).description,
      domain: data.domain,
      industry: data.industry,
      statistics: {
        totalProblems: data.problems.length,
        avgSeverity: data.problems.length > 0
          ? data.problems.reduce((sum, p) => sum + p.severity.overall, 0) / data.problems.length
          : 0,
        avgTractability: data.problems.length > 0
          ? data.problems.reduce((sum, p) => sum + p.tractability.overall, 0) / data.problems.length
          : 0,
      },
    };
  } catch {
    return null;
  }
}

async function listFieldFiles(
  industrySlug: string,
  domainSlug: string
): Promise<string[]> {
  try {
    const fieldsDir = path.join(
      getDataPath(),
      'industries',
      industrySlug,
      domainSlug,
      'fields'
    );
    const files = await fs.readdir(fieldsDir);
    return files
      .filter((f) => f.endsWith('.json'))
      .map((f) => f.replace('.json', ''));
  } catch {
    return [];
  }
}

export async function loadProblems(
  industrySlug: string,
  domainSlug?: string,
  fieldSlug?: string
): Promise<Problem[]> {
  const basePath = path.join(getDataPath(), 'industries', industrySlug);

  // If field is specified, load from field file
  if (domainSlug && fieldSlug) {
    return loadFieldProblems(industrySlug, domainSlug, fieldSlug);
  }

  if (domainSlug) {
    // Load problems from field files (the canonical storage format)
    const fieldSlugs = await listFieldFiles(industrySlug, domainSlug);
    const problems: Problem[] = [];
    for (const slug of fieldSlugs) {
      const fieldProblems = await loadFieldProblems(industrySlug, domainSlug, slug);
      problems.push(...fieldProblems);
    }
    return problems;
  }

  // Load all problems for industry
  const industry = await loadIndustry(industrySlug);
  if (!industry) return [];

  const problems: Problem[] = [];
  for (const domain of industry.domains) {
    const domainProblems = await loadProblems(industrySlug, domain.slug);
    problems.push(...domainProblems);
  }

  return problems;
}

export async function loadAllProblems(): Promise<Problem[]> {
  const index = await loadIndex();
  const problems: Problem[] = [];

  for (const industry of index.industries) {
    const industryProblems = await loadProblems(industry.slug);
    problems.push(...industryProblems);
  }

  return problems;
}

export async function loadProblemBySlug(slug: string): Promise<Problem | null> {
  const allProblems = await loadAllProblems();
  return allProblems.find((p) => p.slug === slug) || null;
}

export async function loadProblemById(id: string): Promise<Problem | null> {
  const allProblems = await loadAllProblems();
  return allProblems.find((p) => p.id === id) || null;
}

export async function loadIndustries(): Promise<IndustryMetadata[]> {
  const index = await loadIndex();
  const industries: IndustryMetadata[] = [];

  for (const industryRef of index.industries) {
    const industry = await loadIndustry(industryRef.slug);
    if (industry) {
      industries.push(industry);
    }
  }

  return industries;
}

export async function loadDomains(
  industrySlug: string
): Promise<DomainMetadata[]> {
  const industry = await loadIndustry(industrySlug);
  if (!industry) return [];

  const domains: DomainMetadata[] = [];
  for (const domainRef of industry.domains) {
    const domain = await loadDomain(industrySlug, domainRef.slug);
    if (domain) {
      domains.push(domain);
    }
  }

  return domains;
}

export async function loadFields(
  industrySlug: string,
  domainSlug: string
): Promise<FieldMetadata[]> {
  const fieldSlugs = await listFieldFiles(industrySlug, domainSlug);
  const fields: FieldMetadata[] = [];

  for (const slug of fieldSlugs) {
    const field = await loadField(industrySlug, domainSlug, slug);
    if (field) {
      fields.push(field);
    }
  }

  return fields;
}
