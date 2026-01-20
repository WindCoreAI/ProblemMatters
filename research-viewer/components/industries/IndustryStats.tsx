import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BarChart3,
  FileQuestion,
  Layers,
  AlertTriangle,
  Target,
} from 'lucide-react';
import type { IndustryStatistics, IndustryMetadata } from '@/lib/types/research';

interface IndustryStatsProps {
  industry: IndustryMetadata;
  statistics?: IndustryStatistics;
}

export function IndustryStats({ industry, statistics }: IndustryStatsProps) {
  const stats = statistics || industry.statistics;

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <FileQuestion className="h-4 w-4" />
            <span className="text-sm">Problems</span>
          </div>
          <p className="text-2xl font-bold">
            {(stats?.totalProblems ?? 0).toLocaleString()}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Layers className="h-4 w-4" />
            <span className="text-sm">Domains</span>
          </div>
          <p className="text-2xl font-bold">
            {stats?.totalDomains ?? industry.domains.length}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <BarChart3 className="h-4 w-4" />
            <span className="text-sm">Fields</span>
          </div>
          <p className="text-2xl font-bold">{stats?.totalFields ?? 0}</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm">Avg Severity</span>
          </div>
          <p className="text-2xl font-bold">
            {stats?.avgSeverity?.toFixed(1) ?? '-'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Target className="h-4 w-4" />
            <span className="text-sm">Avg Tractability</span>
          </div>
          <p className="text-2xl font-bold">
            {stats?.avgTractability?.toFixed(1) ?? '-'}
          </p>
        </CardContent>
      </Card>

      {stats?.topProblemTypes && stats.topProblemTypes.length > 0 && (
        <Card className="col-span-2 md:col-span-5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-3">
              <BarChart3 className="h-4 w-4" />
              <span className="text-sm font-medium">Top Problem Types</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {stats.topProblemTypes.map((item) => (
                <Badge key={item.type} variant="secondary">
                  {item.type}: {item.count}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
