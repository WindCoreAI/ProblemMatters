import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, ExternalLink } from 'lucide-react';
import type { Source } from '@/lib/types/research';
import { formatDate } from '@/lib/utils/format';

interface ProblemSourcesProps {
  sources: Source[];
}

export function ProblemSources({ sources }: ProblemSourcesProps) {
  if (sources.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Sources ({sources.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sources.map((source, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1">
                  <h4 className="font-medium">{source.title}</h4>
                  {source.authors && source.authors.length > 0 && (
                    <p className="text-sm text-muted-foreground">
                      {source.authors.join(', ')}
                    </p>
                  )}
                </div>
                <Badge variant="outline" className="text-xs">
                  {source.type}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                {source.publisher && <span>{source.publisher}</span>}
                {source.publishedAt && (
                  <span>Published: {formatDate(source.publishedAt)}</span>
                )}
                {source.credibilityScore && (
                  <span>
                    Credibility: {(source.credibilityScore * 100).toFixed(0)}%
                  </span>
                )}
              </div>

              {source.relevantExcerpt && (
                <p className="mt-3 text-sm italic border-l-2 border-muted pl-3">
                  &quot;{source.relevantExcerpt}&quot;
                </p>
              )}

              {source.url && (
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-primary mt-3 hover:underline"
                >
                  View source <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
