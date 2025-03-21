import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';

interface ServiceCardProps {
  title: string;
  description: string;
  image: string;
  href: string;
  className?: string;
}

export function ServiceCard({
  title,
  description,
  image,
  href,
  className,
}: ServiceCardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card className={cn('overflow-hidden transition-all duration-300 hover:shadow-lg h-full flex flex-col', className)}>
      <div className="relative w-full h-40 sm:h-48 bg-slate-100">
        {!imageError ? (
          <Image
            src={image}
            alt={title}
            fill
            className={cn(
              "object-cover transition-opacity duration-500",
              isLoading ? "opacity-0" : "opacity-100"
            )}
            onLoad={() => setIsLoading(false)}
            onError={() => setImageError(true)}
            unoptimized // Remove this in production with proper images
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-200 text-slate-400">
            <div className="text-center p-4">
              <div className="text-3xl font-light mb-2">{title.charAt(0)}</div>
              <div className="text-sm">{title}</div>
            </div>
          </div>
        )}
        {isLoading && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>
      
      <CardContent className="p-4 sm:p-6 flex-grow flex flex-col">
        <h3 className="text-lg sm:text-xl font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground text-sm sm:text-base mb-4 flex-grow">{description}</p>
        
        <div className="mt-auto">
          <Link href={href} passHref>
            <Button
              variant="secondary"
              size="sm"
              className="group w-full sm:w-auto"
              aria-label={`Learn more about ${title}`}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <span className="transition-all duration-300">
                {isHovered ? "Explore Service" : "Learn more"}
              </span>
              <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
} 