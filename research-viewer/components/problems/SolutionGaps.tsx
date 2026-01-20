import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, AlertCircle } from 'lucide-react';
import type { SolutionGap } from '@/lib/types/research';

interface SolutionGapsProps {
  gaps: SolutionGap[];
}

const difficultyColors: Record<string, string> = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  'very-high': 'bg-red-100 text-red-800',
};

export function SolutionGaps({ gaps }: SolutionGapsProps) {
  if (gaps.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Solution Gaps
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            No specific solution gaps identified yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Solution Gaps ({gaps.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {gaps.map((gap, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <p className="font-medium">{gap.description}</p>
                <div className="flex gap-2">
                  {gap.gapType && (
                    <Badge variant="outline" className="text-xs">
                      {gap.gapType}
                    </Badge>
                  )}
                  {gap.difficulty && (
                    <Badge className={difficultyColors[gap.difficulty]}>
                      {gap.difficulty}
                    </Badge>
                  )}
                </div>
              </div>

              {gap.opportunity && (
                <div className="mt-3 flex items-start gap-2 text-sm">
                  <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium">Opportunity: </span>
                    <span className="text-muted-foreground">
                      {gap.opportunity}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
