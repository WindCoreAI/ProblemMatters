'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProblemScores } from '@/components/problems/ProblemScores';
import { ProblemRelations } from '@/components/problems/ProblemRelations';
import { ProblemSources } from '@/components/problems/ProblemSources';
import { SolutionGaps } from '@/components/problems/SolutionGaps';
import { ImpactRadar } from '@/components/charts/ImpactRadar';
import { useDataStore } from '@/lib/stores/dataStore';
import { getUrgencyVariant } from '@/lib/utils/scores';
import { formatDate } from '@/lib/utils/format';
import {
  AlertTriangle,
  TrendingUp,
  Users,
  Lightbulb,
  ExternalLink,
  ChevronLeft,
} from 'lucide-react';
import type { Problem } from '@/lib/types/research';

export default function ProblemDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { problems, isInitialized } = useDataStore();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isInitialized) {
      const found = problems.find((p) => p.slug === slug);
      setProblem(found || null);
      setLoading(false);
    }
  }, [slug, problems, isInitialized]);

  if (loading || !isInitialized) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-4 bg-muted rounded w-1/3 mb-6" />
          <div className="h-10 bg-muted rounded w-2/3 mb-4" />
          <div className="h-6 bg-muted rounded w-1/2 mb-8" />
          <div className="grid grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-muted rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Problem Not Found</h1>
          <p className="text-muted-foreground mb-4">
            The problem you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link href="/problems" className="text-primary hover:underline">
            Browse all problems
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-muted-foreground mb-6">
        <ol className="flex items-center gap-2 flex-wrap">
          <li>
            <Link href="/" className="hover:text-foreground">
              Home
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link
              href={`/industries/${problem.industry.slug}`}
              className="hover:text-foreground"
            >
              {problem.industry.name}
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link
              href={`/industries/${problem.industry.slug}/${problem.domain.slug}`}
              className="hover:text-foreground"
            >
              {problem.domain.name}
            </Link>
          </li>
          <li>/</li>
          <li className="text-foreground truncate max-w-[200px]">
            {problem.title}
          </li>
        </ol>
      </nav>

      {/* Back link */}
      <Link
        href="/problems"
        className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-6"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Problems
      </Link>

      {/* Header */}
      <header className="mb-8">
        <div className="flex items-start justify-between gap-4 mb-4">
          <h1 className="text-3xl font-bold">{problem.title}</h1>
          <div className="flex items-center gap-2">
            <Badge variant={getUrgencyVariant(problem.urgency)}>
              {problem.urgency} urgency
            </Badge>
            <Badge variant="outline">{problem.scope}</Badge>
          </div>
        </div>

        <p className="text-lg text-muted-foreground mb-4">
          {problem.summary || problem.description.slice(0, 300)}
        </p>

        <div className="flex flex-wrap gap-2">
          <Badge>{problem.problemType}</Badge>
          {problem.problemSubtypes?.map((subtype) => (
            <Badge key={subtype} variant="secondary">
              {subtype}
            </Badge>
          ))}
        </div>
      </header>

      {/* Score Cards */}
      <ProblemScores problem={problem} className="mb-8" />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Tabs defaultValue="description">
            <TabsList>
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="causes">Root Causes</TabsTrigger>
              <TabsTrigger value="consequences">Consequences</TabsTrigger>
              <TabsTrigger value="solutions">Solutions</TabsTrigger>
              <TabsTrigger value="gaps">Gaps</TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="prose prose-sm max-w-none">
                    <p>{problem.description}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="causes" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Root Causes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {problem.rootCauses.length > 0 ? (
                    <ul className="space-y-4">
                      {problem.rootCauses.map((cause, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <Badge
                            variant={
                              cause.contributionLevel === 'primary'
                                ? 'destructive'
                                : 'secondary'
                            }
                            className="mt-0.5"
                          >
                            {cause.contributionLevel || 'contributing'}
                          </Badge>
                          <div>
                            <p>{cause.description}</p>
                            {cause.category && (
                              <Badge variant="outline" className="mt-1 text-xs">
                                {cause.category}
                              </Badge>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground">
                      No root causes documented.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="consequences" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Consequences
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {problem.consequences.length > 0 ? (
                    <ul className="space-y-4">
                      {problem.consequences.map((consequence, i) => (
                        <li key={i} className="border-l-2 border-muted pl-4">
                          <p>{consequence.description}</p>
                          <div className="flex gap-2 mt-2">
                            {consequence.type && (
                              <Badge variant="outline">{consequence.type}</Badge>
                            )}
                            {consequence.timeframe && (
                              <Badge variant="secondary">
                                {consequence.timeframe}
                              </Badge>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground">
                      No consequences documented.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="solutions" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    Existing Solutions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {problem.existingSolutions.length > 0 ? (
                    <div className="space-y-6">
                      {problem.existingSolutions.map((solution, i) => (
                        <div key={i} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium">{solution.name}</h4>
                            {solution.type && <Badge>{solution.type}</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            {solution.description}
                          </p>
                          <div className="flex items-center gap-4 text-sm">
                            {solution.effectiveness && (
                              <span>
                                Effectiveness:{' '}
                                <strong>{solution.effectiveness}/10</strong>
                              </span>
                            )}
                            {solution.adoption && (
                              <Badge variant="secondary">
                                {solution.adoption}
                              </Badge>
                            )}
                          </div>
                          {solution.limitations &&
                            solution.limitations.length > 0 && (
                              <div className="mt-3">
                                <p className="text-xs text-muted-foreground mb-1">
                                  Limitations:
                                </p>
                                <ul className="text-xs list-disc list-inside">
                                  {solution.limitations.map((l, j) => (
                                    <li key={j}>{l}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          {solution.url && (
                            <a
                              href={solution.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-sm text-primary mt-2 hover:underline"
                            >
                              Learn more <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      No existing solutions documented.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="gaps" className="mt-4">
              <SolutionGaps gaps={problem.solutionGaps} />
            </TabsContent>
          </Tabs>

          {/* Stakeholders */}
          {problem.stakeholders.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Stakeholders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {problem.stakeholders.map((stakeholder, i) => (
                    <div key={i} className="border rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{stakeholder.type}</Badge>
                        <span className="text-xs text-muted-foreground">
                          Interest: {stakeholder.interest || 'medium'} | Influence:{' '}
                          {stakeholder.influence || 'medium'}
                        </span>
                      </div>
                      <p className="text-sm">{stakeholder.description}</p>
                      {stakeholder.examples && stakeholder.examples.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          e.g., {stakeholder.examples.join(', ')}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sources */}
          <ProblemSources sources={problem.sources} />
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          {/* Impact Visualization */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Impact Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <ImpactRadar problem={problem} />
            </CardContent>
          </Card>

          {/* Related Problems */}
          <ProblemRelations relations={problem.relatedProblems} />

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Metadata</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Maturity</span>
                <Badge variant="outline">{problem.maturity}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Confidence</span>
                <span>{(problem.confidence * 100).toFixed(0)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Verification</span>
                <Badge variant="secondary">{problem.verificationStatus}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Updated</span>
                <span>{formatDate(problem.updatedAt)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          {problem.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {problem.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="cursor-pointer hover:bg-secondary/80"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </aside>
      </div>
    </div>
  );
}
