import React from 'react';
import { LightbulbIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Recommendation {
  id: number;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

interface RecommendationsProps {
  recommendations: Recommendation[];
  className?: string;
}

export function Recommendations({ recommendations, className }: RecommendationsProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-lg">
          <LightbulbIcon className="h-5 w-5 mr-2 text-yellow-400" />
          Recommended for You
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recommendations.map((rec) => (
            <div key={rec.id} className="border rounded-lg p-3">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium">{rec.title}</h3>
                <Badge
                  variant={
                    rec.priority === 'high'
                      ? 'destructive'
                      : rec.priority === 'medium'
                      ? 'default'
                      : 'secondary'
                  }
                  className={cn(
                    'text-xs capitalize',
                    rec.priority === 'low' && 'bg-blue-100 text-blue-800'
                  )}
                >
                  {rec.priority} priority
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{rec.description}</p>
              <div className="flex justify-end">
                <Button variant="outline" size="sm">
                  Take Action
                </Button>
              </div>
            </div>
          ))}
        </div>

        {recommendations.length === 0 && (
          <div className="text-center py-6">
            <p className="text-muted-foreground">No recommendations at this time.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 