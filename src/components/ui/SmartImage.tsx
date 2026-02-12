import React from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import { cn } from '@/lib/utils';

interface SmartImageProps {
    src: string;
    alt: string;
    className?: string;
    wrapperClassName?: string;
    effect?: 'blur' | 'black-and-white' | 'opacity';
    width?: string | number;
    height?: string | number;
    placeholderSrc?: string;
}

/**
 * SmartImage Component
 * Optimized for SEO and Performance.
 * Automatically handles lazy loading and provides a blur effect.
 */
export const SmartImage: React.FC<SmartImageProps> = ({
    src,
    alt,
    className,
    wrapperClassName,
    effect = 'blur',
    width,
    height,
    placeholderSrc,
}) => {
    // Ensure alt text is descriptive for SEO
    const descriptiveAlt = alt || 'Anime illustration for OtakuTV';

    return (
        <LazyLoadImage
            src={src}
            alt={descriptiveAlt}
            effect={effect}
            className={cn("transition-all duration-300", className)}
            wrapperClassName={cn("overflow-hidden block leading-[0]", wrapperClassName)}
            width={width}
            height={height}
            placeholderSrc={placeholderSrc || "/placeholder.svg"}
        />
    );
};
