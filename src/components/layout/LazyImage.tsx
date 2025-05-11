
import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { addSrcSetToImage } from '@/lib/image-optimizer';
import { Skeleton } from "@/components/ui/skeleton";

interface LazyImageProps {
  src: string;
  alt: string;
  width?: string | number;
  height?: string | number;
  className?: string;
  priority?: boolean;
}

export function LazyImage({ 
  src, 
  alt, 
  width, 
  height, 
  className,
  priority = false
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(priority);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  
  useEffect(() => {
    if (priority) {
      setIsVisible(true);
      return;
    }
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      });
    }, {
      rootMargin: '200px' // Start loading images 200px before they enter the viewport
    });
    
    if (imgRef.current) {
      observer.observe(imgRef.current);
    }
    
    return () => {
      observer.disconnect();
    };
  }, [priority]);
  
  useEffect(() => {
    if (isVisible && imgRef.current) {
      // Apply srcset for responsive images
      addSrcSetToImage(imgRef.current, src);
    }
  }, [isVisible, src]);
  
  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(true);
  };

  // Calculate explicit dimensions for better CLS
  const imageWidth = typeof width === 'number' ? width : width ? width : '100%';
  const imageHeight = typeof height === 'number' ? height : height ? height : '100%';

  return (
    <div 
      className={cn(
        "relative overflow-hidden bg-muted/30",
        className
      )}
      style={{
        width: imageWidth,
        height: imageHeight,
      }}
    >
      {/* Placeholder/skeleton */}
      {!isLoaded && (
        <Skeleton className="absolute inset-0" />
      )}
      
      {isVisible && !hasError && (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          width={typeof width === 'number' ? width : undefined}
          height={typeof height === 'number' ? height : undefined}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-300",
            isLoaded ? "opacity-100" : "opacity-0"
          )}
        />
      )}
      
      {/* Fallback for failed images */}
      {hasError && (
        <div className="w-full h-full flex items-center justify-center bg-muted/20 text-muted-foreground">
          <span className="text-xs">{alt || 'Image'}</span>
        </div>
      )}
    </div>
  );
}
