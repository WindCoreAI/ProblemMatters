'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ProblemList } from '@/components/problems/ProblemList';
import { useDataStore } from '@/lib/stores/dataStore';
import { ChevronLeft, FileCode } from 'lucide-react';
import type { Problem, FieldProblemsFile } from '@/lib/types/research';

export default function FieldDetailPage() {
  const params = useParams();
  const industrySlug = params.slug as string;
  const domainSlug = params.domain as string;
  const fieldSlug = params.field as string;
  const { isInitialized } = useDataStore();
  const [fieldData, setFieldData] = useState<FieldProblemsFile | null>(null);
  const [fieldProblems, setFieldProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadField() {
      if (!isInitialized) return;

      try {
        const response = await fetch(
          `/research-data/industries/${industrySlug}/${domainSlug}/fields/${fieldSlug}.json`
        );
        if (response.ok) {
          const data: FieldProblemsFile = await response.json();
          setFieldData(data);
          setFieldProblems(data.problems || []);
        }
      } catch (error) {
        console.error('Failed to load field:', error);
      }

      setLoading(false);
    }

    loadField();
  }, [industrySlug, domainSlug, fieldSlug, isInitialized]);

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

  const fieldName = fieldData?.field?.name || fieldSlug.replace(/-/g, ' ');
  const domainName = fieldData?.domain?.name || domainSlug.replace(/-/g, ' ');
  const industryName = fieldData?.industry?.name || industrySlug.replace(/-/g, ' ');

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-muted-foreground">
        <ol className="flex items-center gap-2 flex-wrap">
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
              {industryName}
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link
              href={`/industries/${industrySlug}/${domainSlug}`}
              className="hover:text-foreground"
            >
              {domainName}
            </Link>
          </li>
          <li>/</li>
          <li className="text-foreground capitalize">{fieldName}</li>
        </ol>
      </nav>

      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 rounded-lg bg-primary/10 text-primary">
            <FileCode className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold capitalize">{fieldName}</h1>
            <p className="text-muted-foreground">
              {fieldProblems.length} problems in this field
            </p>
          </div>
        </div>
        {fieldData?.field && 'description' in fieldData.field && (
          <p className="text-muted-foreground max-w-3xl">
            {(fieldData.field as { description?: string }).description}
          </p>
        )}
      </header>

      {/* Back link */}
      <div className="mb-6">
        <Link
          href={`/industries/${industrySlug}/${domainSlug}`}
          className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to {domainName}
        </Link>
      </div>

      {/* Statistics Summary */}
      {fieldProblems.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="p-4 rounded-lg border bg-card">
            <div className="text-2xl font-bold">{fieldProblems.length}</div>
            <div className="text-sm text-muted-foreground">Problems</div>
          </div>
          <div className="p-4 rounded-lg border bg-card">
            <div className="text-2xl font-bold">
              {(
                fieldProblems.reduce((sum, p) => sum + p.severity.overall, 0) /
                fieldProblems.length
              ).toFixed(1)}
            </div>
            <div className="text-sm text-muted-foreground">Avg Severity</div>
          </div>
          <div className="p-4 rounded-lg border bg-card">
            <div className="text-2xl font-bold">
              {(
                fieldProblems.reduce((sum, p) => sum + p.tractability.overall, 0) /
                fieldProblems.length
              ).toFixed(1)}
            </div>
            <div className="text-sm text-muted-foreground">Avg Tractability</div>
          </div>
          <div className="p-4 rounded-lg border bg-card">
            <div className="text-2xl font-bold">
              {(
                fieldProblems.reduce((sum, p) => sum + p.impactScore, 0) /
                fieldProblems.length
              ).toFixed(1)}
            </div>
            <div className="text-sm text-muted-foreground">Avg Impact</div>
          </div>
        </div>
      )}

      {/* Problems */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">
          Problems ({fieldProblems.length})
        </h2>
        {fieldProblems.length > 0 ? (
          <ProblemList problems={fieldProblems} showIndustry={false} />
        ) : (
          <div className="text-center py-12 border rounded-lg bg-muted/50">
            <p className="text-muted-foreground">
              No problems found for this field yet.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
