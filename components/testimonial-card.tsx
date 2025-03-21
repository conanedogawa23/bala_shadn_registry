import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { QuoteIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface TestimonialCardProps {
  content: string;
  name: string;
  role: string;
  avatar?: string;
  className?: string;
}

export function TestimonialCard({
  content,
  name,
  role,
  avatar,
  className,
}: TestimonialCardProps) {
  const [imageError, setImageError] = useState(false);
  
  return (
    <Card className={cn('hover:shadow-md transition-all duration-300 h-full flex flex-col', className)}>
      <CardContent className="p-4 sm:p-6 flex-grow flex flex-col">
        <QuoteIcon className="h-6 w-6 sm:h-8 sm:w-8 text-primary/20 mb-3 sm:mb-4" />
        
        <blockquote className="text-base sm:text-lg mb-4 sm:mb-6 flex-grow">
          &ldquo;{content}&rdquo;
        </blockquote>
        
        <div className="flex items-center mt-auto">
          {avatar && !imageError ? (
            <div className="relative h-10 w-10 sm:h-12 sm:w-12 rounded-full overflow-hidden mr-3 sm:mr-4">
              <Image
                src={avatar}
                alt={name}
                fill
                className="object-cover"
                onError={() => setImageError(true)}
                unoptimized // Remove this in production with proper images
              />
            </div>
          ) : (
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-primary/10 flex items-center justify-center mr-3 sm:mr-4">
              <span className="font-medium text-primary">
                {name.charAt(0)}
              </span>
            </div>
          )}
          
          <div>
            <div className="font-semibold text-sm sm:text-base">{name}</div>
            <div className="text-xs sm:text-sm text-muted-foreground">{role}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 