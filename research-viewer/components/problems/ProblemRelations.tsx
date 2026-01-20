import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link2, ArrowRight, ArrowLeft, ArrowLeftRight } from 'lucide-react';
import type { ProblemRelation } from '@/lib/types/research';

interface ProblemRelationsProps {
  relations: ProblemRelation[];
}

const relationIcons: Record<string, React.ReactNode> = {
  causes: <ArrowRight className="h-4 w-4" />,
  'caused-by': <ArrowLeft className="h-4 w-4" />,
  blocks: <ArrowRight className="h-4 w-4 text-red-500" />,
  'blocked-by': <ArrowLeft className="h-4 w-4 text-red-500" />,
  'related-to': <ArrowLeftRight className="h-4 w-4" />,
  'subset-of': <ArrowRight className="h-4 w-4 text-blue-500" />,
  'superset-of': <ArrowLeft className="h-4 w-4 text-blue-500" />,
  contradicts: <ArrowLeftRight className="h-4 w-4 text-orange-500" />,
};

const relationLabels: Record<string, string> = {
  causes: 'Causes',
  'caused-by': 'Caused by',
  blocks: 'Blocks',
  'blocked-by': 'Blocked by',
  'related-to': 'Related to',
  'subset-of': 'Subset of',
  'superset-of': 'Superset of',
  contradicts: 'Contradicts',
};

export function ProblemRelations({ relations }: ProblemRelationsProps) {
  if (!relations || relations.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Link2 className="h-5 w-5" />
          Related Problems
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {relations.map((relation, index) => (
            <Link
              key={index}
              href={`/problems/${relation.problemId}`}
              className="block"
            >
              <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex-shrink-0">
                  {relationIcons[relation.relationType] || (
                    <Link2 className="h-4 w-4" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {relation.problemTitle || relation.problemId}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {relationLabels[relation.relationType] ||
                        relation.relationType}
                    </Badge>
                    {relation.strength && (
                      <span className="text-xs text-muted-foreground">
                        Strength: {(relation.strength * 100).toFixed(0)}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
