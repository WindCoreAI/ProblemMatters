import * as fs from 'fs/promises';
import * as path from 'path';
import type {
  ResearchIndex,
  IndustryMetadata,
  DomainMetadata,
  Problem,
  ProblemsFile,
} from '@/lib/types/research';

const DATA_PATH = process.env.DATA_PATH || '../research-data';

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

export async function loadProblems(
  industrySlug: string,
  domainSlug?: string
): Promise<Problem[]> {
  const basePath = path.join(getDataPath(), 'industries', industrySlug);

  if (domainSlug) {
    try {
      const filePath = path.join(basePath, domainSlug, 'problems.json');
      const content = await fs.readFile(filePath, 'utf-8');
      const data: ProblemsFile = JSON.parse(content);
      return data.problems || [];
    } catch {
      return [];
    }
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
