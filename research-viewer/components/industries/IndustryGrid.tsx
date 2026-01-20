import { IndustryCard } from './IndustryCard';
import type { IndustryReference } from '@/lib/types/research';

interface IndustryGridProps {
  industries: IndustryReference[];
}

export function IndustryGrid({ industries }: IndustryGridProps) {
  if (industries.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No industries found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {industries.map((industry) => (
        <IndustryCard key={industry.id} industry={industry} />
      ))}
    </div>
  );
}
