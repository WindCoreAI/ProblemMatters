import type { Problem, Urgency } from '@/lib/types/research';

export function getSeverityColor(severity: number): string {
  if (severity >= 8) return 'bg-red-500';
  if (severity >= 6) return 'bg-orange-500';
  if (severity >= 4) return 'bg-yellow-500';
  return 'bg-green-500';
}

export function getSeverityTextColor(severity: number): string {
  if (severity >= 8) return 'text-red-500';
  if (severity >= 6) return 'text-orange-500';
  if (severity >= 4) return 'text-yellow-500';
  return 'text-green-500';
}

export function getSeverityLabel(severity: number): string {
  if (severity >= 8) return 'Critical';
  if (severity >= 6) return 'High';
  if (severity >= 4) return 'Medium';
  return 'Low';
}

export function getUrgencyVariant(
  urgency: Urgency
): 'destructive' | 'warning' | 'secondary' | 'outline' {
  switch (urgency) {
    case 'critical':
      return 'destructive';
    case 'high':
      return 'warning';
    case 'medium':
      return 'secondary';
    default:
      return 'outline';
  }
}

export function getUrgencyColor(urgency: Urgency): string {
  switch (urgency) {
    case 'critical':
      return 'bg-red-500';
    case 'high':
      return 'bg-orange-500';
    case 'medium':
      return 'bg-yellow-500';
    default:
      return 'bg-green-500';
  }
}

export function getTractabilityLabel(tractability: number): string {
  if (tractability >= 8) return 'Highly Tractable';
  if (tractability >= 6) return 'Moderately Tractable';
  if (tractability >= 4) return 'Challenging';
  return 'Very Difficult';
}

export function calculateImpactScore(problem: Problem): number {
  // Impact score formula: combines severity, tractability, and neglectedness
  const severity = problem.severity.overall;
  const tractability = problem.tractability.overall;
  const neglectedness = problem.neglectedness?.overall ?? 5;

  // Weight: severity (40%), tractability (30%), neglectedness (30%)
  return (severity * 0.4 + tractability * 0.3 + neglectedness * 0.3) * 10;
}

export function getScoreGradient(score: number): string {
  const percentage = score * 10;
  if (percentage >= 80) {
    return 'from-red-500 to-red-600';
  }
  if (percentage >= 60) {
    return 'from-orange-500 to-orange-600';
  }
  if (percentage >= 40) {
    return 'from-yellow-500 to-yellow-600';
  }
  return 'from-green-500 to-green-600';
}

export function getConfidenceLabel(confidence: number): string {
  if (confidence >= 0.9) return 'Very High';
  if (confidence >= 0.75) return 'High';
  if (confidence >= 0.5) return 'Medium';
  if (confidence >= 0.25) return 'Low';
  return 'Very Low';
}

export function getMaturityLabel(maturity: string): string {
  switch (maturity) {
    case 'emerging':
      return 'Emerging';
    case 'growing':
      return 'Growing';
    case 'mature':
      return 'Mature';
    case 'declining':
      return 'Declining';
    default:
      return maturity;
  }
}
