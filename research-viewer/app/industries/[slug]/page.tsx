'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProblemList } from '@/components/problems/ProblemList';
import { useDataStore } from '@/lib/stores/dataStore';
import { ArrowRight, ChevronLeft } from 'lucide-react';
import { getIndustryIcon } from '@/lib/utils/icons';
import type { IndustryMetadata, Problem } from '@/lib/types/research';

export default function IndustryDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { problems, isInitialized } = useDataStore();
  const [industry, setIndustry] = useState<IndustryMetadata | null>(null);
  const [industryProblems, setIndustryProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadIndustry() {
      if (!isInitialized) return;

      try {
        const response = await fetch(
          `/research-data/industries/${slug}/_metadata.json`
        );
        if (response.ok) {
          const data = await response.json();
          setIndustry(data);
        }
      } catch (error) {
        console.error('Failed to load industry:', error);
      }

      // Filter problems for this industry
      const filtered = problems.filter((p) => p.industry.slug === slug);
      setIndustryProblems(filtered);
      setLoading(false);
    }

    loadIndustry();
  }, [slug, problems, isInitialized]);

  if (loading || !isInitialized) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-4" />
          <div className="h-12 bg-muted rounded w-1/2 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-muted rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const Icon = getIndustryIcon(slug);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6">
        <Link
          href="/industries"
          className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Industries
        </Link>
      </nav>

      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 rounded-lg bg-primary/10 text-primary">
            <Icon className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">
              {industry?.name || slug.replace(/-/g, ' ')}
            </h1>
            <p className="text-muted-foreground">
              {industryProblems.length} problems discovered
            </p>
          </div>
        </div>
        {industry?.description && (
          <p className="text-muted-foreground max-w-3xl">
            {industry.description}
          </p>
        )}
      </header>

      {/* Domains */}
      {industry?.domains && industry.domains.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Domains</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {industry.domains.map((domain) => (
              <Link
                key={domain.id}
                href={`/industries/${slug}/${domain.slug}`}
              >
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{domain.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        {domain.fieldCount > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {domain.fieldCount} fields
                          </Badge>
                        )}
                        <p className="text-sm text-muted-foreground">
                          {domain.problemCount} problems
                        </p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Problems */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">
          Problems ({industryProblems.length})
        </h2>
        {industryProblems.length > 0 ? (
          <ProblemList problems={industryProblems} showIndustry={false} />
        ) : (
          <div className="text-center py-12 border rounded-lg bg-muted/50">
            <p className="text-muted-foreground">
              No problems found for this industry yet.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
