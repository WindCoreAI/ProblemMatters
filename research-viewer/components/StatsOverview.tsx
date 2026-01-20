import { Card, CardContent } from '@/components/ui/card';
import {
  FileQuestion,
  Building2,
  Layers,
  Grid3X3,
} from 'lucide-react';
import type { IndexStatistics } from '@/lib/types/research';

interface StatsOverviewProps {
  statistics: IndexStatistics;
}

export function StatsOverview({ statistics }: StatsOverviewProps) {
  const stats = [
    {
      label: 'Total Problems',
      value: statistics.totalProblems.toLocaleString(),
      icon: FileQuestion,
      description: 'Discovered problems',
    },
    {
      label: 'Industries',
      value: statistics.totalIndustries.toLocaleString(),
      icon: Building2,
      description: 'Major sectors covered',
    },
    {
      label: 'Domains',
      value: statistics.totalDomains.toLocaleString(),
      icon: Layers,
      description: 'Specialized domains',
    },
    {
      label: 'Fields',
      value: statistics.totalFields.toLocaleString(),
      icon: Grid3X3,
      description: 'Specific fields',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
