import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Target, TrendingUp, ArrowRight } from 'lucide-react';
import type { Problem } from '@/lib/types/research';
import { cn } from '@/lib/utils';
import { getSeverityColor, getUrgencyVariant } from '@/lib/utils/scores';

interface ProblemCardProps {
  problem: Problem;
  variant?: 'default' | 'compact';
  showIndustry?: boolean;
}

export function ProblemCard({
  problem,
  variant = 'default',
  showIndustry = true,
}: ProblemCardProps) {
  const severityColor = getSeverityColor(problem.severity.overall);
  const urgencyVariant = getUrgencyVariant(problem.urgency);

  if (variant === 'compact') {
    return (
      <Link href={`/problems/${problem.slug}`}>
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate">{problem.title}</h3>
                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                  <span>{problem.industry.name}</span>
                  <span>/</span>
                  <span>{problem.domain.name}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={urgencyVariant}>{problem.urgency}</Badge>
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold',
                    severityColor
                  )}
                >
                  {problem.severity.overall.toFixed(0)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  return (
    <Link href={`/problems/${problem.slug}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              {showIndustry && (
                <div className="text-sm text-muted-foreground mb-1">
                  {problem.industry.name} / {problem.domain.name}
                </div>
              )}
              <CardTitle className="text-lg leading-tight">
                {problem.title}
              </CardTitle>
            </div>
            <Badge variant={urgencyVariant} className="flex-shrink-0">
              {problem.urgency}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground line-clamp-3">
            {problem.summary || problem.description}
          </p>

          {/* Scores */}
          <div className="grid grid-cols-3 gap-4">
            <ScoreIndicator
              icon={AlertTriangle}
              label="Severity"
              value={problem.severity.overall}
              color={severityColor}
            />
            <ScoreIndicator
              icon={Target}
              label="Tractability"
              value={problem.tractability.overall}
              color="bg-blue-500"
            />
            <ScoreIndicator
              icon={TrendingUp}
              label="Impact"
              value={problem.impactScore / 10}
              color="bg-purple-500"
            />
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1">
            {problem.tags.slice(0, 4).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {problem.tags.length > 4 && (
              <Badge variant="outline" className="text-xs">
                +{problem.tags.length - 4}
              </Badge>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t">
            <Badge variant="outline">{problem.problemType}</Badge>
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              View details <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function ScoreIndicator({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
        <Icon className="h-3 w-3" />
        <span>{label}</span>
      </div>
      <div className="relative h-2 bg-secondary rounded-full overflow-hidden">
        <div
          className={cn('absolute inset-y-0 left-0 rounded-full', color)}
          style={{ width: `${value * 10}%` }}
        />
      </div>
      <div className="text-sm font-medium mt-1">{value.toFixed(1)}</div>
    </div>
  );
}
