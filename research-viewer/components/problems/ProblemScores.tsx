import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, Target, Eye, TrendingUp } from 'lucide-react';
import type { Problem } from '@/lib/types/research';
import { cn } from '@/lib/utils';
import {
  getSeverityColor,
  getSeverityLabel,
  getTractabilityLabel,
} from '@/lib/utils/scores';

interface ProblemScoresProps {
  problem: Problem;
  className?: string;
}

export function ProblemScores({ problem, className }: ProblemScoresProps) {
  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-4 gap-4', className)}>
      {/* Severity */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <span className="font-medium">Severity</span>
          </div>
          <div className="text-3xl font-bold mb-2">
            {problem.severity.overall.toFixed(1)}
          </div>
          <Progress
            value={problem.severity.overall * 10}
            className={cn('h-2', getSeverityColor(problem.severity.overall))}
          />
          <p className="text-sm text-muted-foreground mt-2">
            {getSeverityLabel(problem.severity.overall)}
          </p>
        </CardContent>
      </Card>

      {/* Tractability */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-3">
            <Target className="h-5 w-5 text-blue-500" />
            <span className="font-medium">Tractability</span>
          </div>
          <div className="text-3xl font-bold mb-2">
            {problem.tractability.overall.toFixed(1)}
          </div>
          <Progress value={problem.tractability.overall * 10} className="h-2" />
          <p className="text-sm text-muted-foreground mt-2">
            {getTractabilityLabel(problem.tractability.overall)}
          </p>
        </CardContent>
      </Card>

      {/* Neglectedness */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-3">
            <Eye className="h-5 w-5 text-orange-500" />
            <span className="font-medium">Neglectedness</span>
          </div>
          <div className="text-3xl font-bold mb-2">
            {(problem.neglectedness?.overall ?? 5).toFixed(1)}
          </div>
          <Progress
            value={(problem.neglectedness?.overall ?? 5) * 10}
            className="h-2"
          />
          <p className="text-sm text-muted-foreground mt-2">
            {problem.neglectedness?.attentionLevel ?? 'Moderate'}
          </p>
        </CardContent>
      </Card>

      {/* Impact Score */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-5 w-5 text-purple-500" />
            <span className="font-medium">Impact Score</span>
          </div>
          <div className="text-3xl font-bold mb-2">{problem.impactScore}</div>
          <Progress value={problem.impactScore} className="h-2" />
          <p className="text-sm text-muted-foreground mt-2">
            Composite score (0-100)
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
