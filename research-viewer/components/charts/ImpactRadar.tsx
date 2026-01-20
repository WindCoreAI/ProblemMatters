'use client';

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts';
import type { Problem } from '@/lib/types/research';

interface ImpactRadarProps {
  problem: Problem;
}

export function ImpactRadar({ problem }: ImpactRadarProps) {
  const data = [
    {
      subject: 'Severity',
      value: problem.severity.overall,
      fullMark: 10,
    },
    {
      subject: 'Tractability',
      value: problem.tractability.overall,
      fullMark: 10,
    },
    {
      subject: 'Neglectedness',
      value: problem.neglectedness?.overall ?? 5,
      fullMark: 10,
    },
    {
      subject: 'Economic',
      value: problem.severity.economicImpact?.score ?? 5,
      fullMark: 10,
    },
    {
      subject: 'Population',
      value: problem.severity.affectedPopulation?.score ?? 5,
      fullMark: 10,
    },
  ];

  return (
    <ResponsiveContainer width="100%" height={250}>
      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
        <PolarGrid />
        <PolarAngleAxis
          dataKey="subject"
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
        />
        <PolarRadiusAxis
          angle={30}
          domain={[0, 10]}
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
        />
        <Radar
          name="Impact"
          dataKey="value"
          stroke="hsl(var(--primary))"
          fill="hsl(var(--primary))"
          fillOpacity={0.3}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
