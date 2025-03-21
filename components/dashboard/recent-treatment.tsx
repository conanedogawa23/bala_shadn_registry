import React from 'react';
import { Calendar, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface RecentTreatmentProps {
  serviceName: string;
  provider: string;
  date: string;
  notes: string;
  className?: string;
}

export function RecentTreatment({
  serviceName,
  provider,
  date,
  notes,
  className,
}: RecentTreatmentProps) {
  // Format the date for display
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-1">{serviceName}</h3>
        
        <div className="flex flex-col space-y-2 mb-4">
          <div className="flex items-center text-sm">
            <User className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>{provider}</span>
          </div>
          
          <div className="flex items-center text-sm">
            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>{formattedDate}</span>
          </div>
        </div>
        
        <div className="border-t pt-3">
          <h4 className="text-sm font-medium mb-1">Treatment Notes</h4>
          <p className="text-sm text-muted-foreground">{notes}</p>
        </div>
      </CardContent>
    </Card>
  );
} 