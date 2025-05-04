
/**
 * Image loading optimization utilities
 */

// Function to preload critical images
export function preloadCriticalImages(imageUrls: string[]) {
  if (typeof window !== 'undefined') {
    imageUrls.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = url;
      link.as = 'image';
      document.head.appendChild(link);
    });
  }
}

// Function to determine image size based on viewport width
export function getResponsiveImageSize(defaultSize: number, maxSize: number): number {
  if (typeof window === 'undefined') return defaultSize;
  
  const viewportWidth = window.innerWidth;
  if (viewportWidth <= 640) return Math.min(defaultSize, viewportWidth * 0.8);
  if (viewportWidth <= 768) return Math.min(defaultSize * 1.2, maxSize);
  if (viewportWidth <= 1024) return Math.min(defaultSize * 1.4, maxSize);
  
  return Math.min(defaultSize * 1.6, maxSize);
}

// Function to add srcset to image elements
export function addSrcSetToImage(img: HTMLImageElement, baseUrl: string): void {
  if (!baseUrl.includes('placeholder') && !baseUrl.includes('data:image')) {
    img.srcset = `
      ${baseUrl}?w=300 300w,
      ${baseUrl}?w=600 600w,
      ${baseUrl}?w=900 900w,
      ${baseUrl} 1200w
    `;
    img.sizes = '(max-width: 640px) 300px, (max-width: 1024px) 600px, 900px';
  }
}
