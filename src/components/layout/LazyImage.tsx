
import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { addSrcSetToImage } from '@/lib/image-optimizer';

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

  return (
    <div 
      className={cn(
        "relative overflow-hidden bg-muted/30",
        className
      )}
      style={{
        width: width,
        height: height,
      }}
    >
      {/* Placeholder/skeleton */}
      {!isLoaded && (
        <div className="absolute inset-0 skeleton" />
      )}
      
      {isVisible && (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          width={typeof width === 'number' ? width : undefined}
          height={typeof height === 'number' ? height : undefined}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          onLoad={handleLoad}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-300",
            isLoaded ? "opacity-100" : "opacity-0"
          )}
        />
      )}
    </div>
  );
}
