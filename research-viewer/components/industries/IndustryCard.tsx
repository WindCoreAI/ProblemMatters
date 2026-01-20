import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import type { IndustryReference } from '@/lib/types/research';
import { getIndustryIcon } from '@/lib/utils/icons';

interface IndustryCardProps {
  industry: IndustryReference;
}

export function IndustryCard({ industry }: IndustryCardProps) {
  const Icon = getIndustryIcon(industry.slug);

  return (
    <Link href={`/industries/${industry.slug}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Icon className="h-6 w-6" />
            </div>
            <CardTitle className="text-xl">{industry.name}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-sm">
            <div className="space-y-1">
              <div className="text-muted-foreground">
                {industry.domainCount} domains
              </div>
              <div className="font-medium">
                {industry.problemCount.toLocaleString()} problems
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
