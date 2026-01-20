'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ProblemList } from '@/components/problems/ProblemList';
import { useDataStore } from '@/lib/stores/dataStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Layers, FileCode, ChevronRight, X } from 'lucide-react';
import type { DomainMetadata, Problem, FieldProblemsFile } from '@/lib/types/research';

interface FieldInfo {
  slug: string;
  name: string;
  description?: string;
  problemCount: number;
  avgSeverity: number;
}

export default function DomainDetailPage() {
  const params = useParams();
  const industrySlug = params.slug as string;
  const domainSlug = params.domain as string;
  const { problems, isInitialized } = useDataStore();
  const [domain, setDomain] = useState<DomainMetadata | null>(null);
  const [domainProblems, setDomainProblems] = useState<Problem[]>([]);
  const [fields, setFields] = useState<FieldInfo[]>([]);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Filter problems by selected field
  const filteredProblems = useMemo(() => {
    if (!selectedField) return domainProblems;
    return domainProblems.filter((p) => p.field?.slug === selectedField);
  }, [domainProblems, selectedField]);

  useEffect(() => {
    async function loadDomain() {
      if (!isInitialized) return;

      try {
        // Load domain metadata
        const response = await fetch(
          `/research-data/industries/${industrySlug}/${domainSlug}/_metadata.json`
        );
        if (response.ok) {
          const data: DomainMetadata = await response.json();
          setDomain(data);

          // Get field slugs from statistics.fieldProblems
          const fieldSlugs = data.statistics?.fieldProblems
            ? Object.keys(data.statistics.fieldProblems)
            : [];

          if (fieldSlugs.length > 0) {
            const fieldInfos: FieldInfo[] = [];
            for (const fieldSlug of fieldSlugs) {
              try {
                const fieldResponse = await fetch(
                  `/research-data/industries/${industrySlug}/${domainSlug}/fields/${fieldSlug}.json`
                );
                if (fieldResponse.ok) {
                  const fieldData: FieldProblemsFile = await fieldResponse.json();
                  fieldInfos.push({
                    slug: fieldSlug,
                    name: fieldData.field?.name || fieldSlug.replace(/-/g, ' '),
                    description: (fieldData.field as { description?: string })?.description,
                    problemCount: fieldData.problems?.length || 0,
                    avgSeverity: fieldData.problems?.length > 0
                      ? fieldData.problems.reduce((sum, p) => sum + p.severity.overall, 0) / fieldData.problems.length
                      : 0,
                  });
                }
              } catch {
                // Field file doesn't exist, skip
              }
            }
            setFields(fieldInfos);
          }
        }
      } catch (error) {
        console.error('Failed to load domain:', error);
      }

      // Filter problems for this domain
      const filtered = problems.filter(
        (p) => p.industry.slug === industrySlug && p.domain.slug === domainSlug
      );
      setDomainProblems(filtered);
      setLoading(false);
    }

    loadDomain();
  }, [industrySlug, domainSlug, problems, isInitialized]);

  if (loading || !isInitialized) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-4" />
          <div className="h-12 bg-muted rounded w-1/2 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-muted rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-muted-foreground">
        <ol className="flex items-center gap-2">
          <li>
            <Link href="/industries" className="hover:text-foreground">
              Industries
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link
              href={`/industries/${industrySlug}`}
              className="hover:text-foreground"
            >
              {domain?.industry?.name || industrySlug.replace(/-/g, ' ')}
            </Link>
          </li>
          <li>/</li>
          <li className="text-foreground">
            {domain?.name || domainSlug.replace(/-/g, ' ')}
          </li>
        </ol>
      </nav>

      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 rounded-lg bg-primary/10 text-primary">
            <Layers className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">
              {domain?.name || domainSlug.replace(/-/g, ' ')}
            </h1>
            <p className="text-muted-foreground">
              {domainProblems.length} problems in this domain
              {fields.length > 0 && ` across ${fields.length} fields`}
            </p>
          </div>
        </div>
        {domain?.description && (
          <p className="text-muted-foreground max-w-3xl">
            {domain.description}
          </p>
        )}
      </header>

      {/* Back link */}
      <div className="mb-6">
        <Link
          href={`/industries/${industrySlug}`}
          className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to {domain?.industry?.name || 'Industry'}
        </Link>
      </div>

      {/* Fields Section */}
      {fields.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">
              Fields ({fields.length})
            </h2>
            {selectedField && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedField(null)}
                className="text-muted-foreground"
              >
                <X className="h-4 w-4 mr-1" />
                Clear filter
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {fields.map((field) => (
              <Card
                key={field.slug}
                className={`h-full hover:shadow-md transition-shadow cursor-pointer ${
                  selectedField === field.slug
                    ? 'ring-2 ring-primary border-primary'
                    : ''
                }`}
                onClick={() =>
                  setSelectedField(
                    selectedField === field.slug ? null : field.slug
                  )
                }
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <FileCode className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">{field.name}</CardTitle>
                    </div>
                    <Link
                      href={`/industries/${industrySlug}/${domainSlug}/${field.slug}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  {field.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {field.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {field.problemCount} problems
                    </Badge>
                    {field.avgSeverity > 0 && (
                      <Badge variant="outline">
                        Severity: {field.avgSeverity.toFixed(1)}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Problems */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">
          {selectedField
            ? `Problems in ${fields.find((f) => f.slug === selectedField)?.name || selectedField} (${filteredProblems.length})`
            : `All Problems (${domainProblems.length})`}
        </h2>
        {filteredProblems.length > 0 ? (
          <ProblemList problems={filteredProblems} showIndustry={false} />
        ) : (
          <div className="text-center py-12 border rounded-lg bg-muted/50">
            <p className="text-muted-foreground">
              No problems found for this domain yet.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
