import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProgressRing } from './progress-ring';

interface ScoreType {
  physical: number;
  nutrition: number;
  stress: number;
  sleep: number;
  overall: number;
}

interface WellnessScoreProps {
  scores: ScoreType;
  className?: string;
}

export function WellnessScore({ scores, className }: WellnessScoreProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">Wellness Score</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center mb-4">
          <ProgressRing
            value={scores.overall}
            size={120}
            strokeWidth={10}
            label="Overall"
            className="mb-4"
            valueClassName="text-2xl"
          />
          <p className="text-sm text-muted-foreground mt-2">
            Your wellness score is based on your recent assessments and activities
          </p>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="flex flex-col items-center">
            <ProgressRing
              value={scores.physical}
              size={70}
              strokeWidth={6}
              label="Physical"
              valueClassName="text-sm"
              labelClassName="text-xs"
            />
          </div>
          <div className="flex flex-col items-center">
            <ProgressRing
              value={scores.nutrition}
              size={70}
              strokeWidth={6}
              label="Nutrition"
              valueClassName="text-sm"
              labelClassName="text-xs"
            />
          </div>
          <div className="flex flex-col items-center">
            <ProgressRing
              value={scores.stress}
              size={70}
              strokeWidth={6}
              label="Stress"
              valueClassName="text-sm"
              labelClassName="text-xs"
            />
          </div>
          <div className="flex flex-col items-center">
            <ProgressRing
              value={scores.sleep}
              size={70}
              strokeWidth={6}
              label="Sleep"
              valueClassName="text-sm"
              labelClassName="text-xs"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 