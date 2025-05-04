
/**
 * Image loading optimization utilities
 */

// Function to preload critical images
export function preloadCriticalImages(imageUrls: string[]) {
  if (typeof window !== 'undefined') {
    imageUrls.forEach(url => {
      if (!url) return;
      
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = url;
      link.as = 'image';
      link.fetchPriority = 'high';
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
  if (!baseUrl || baseUrl.includes('placeholder') || baseUrl.includes('data:image')) {
    return;
  }
  
  // Handle URLs that might already have query params
  const hasQueryParams = baseUrl.includes('?');
  const separator = hasQueryParams ? '&' : '?';
  
  img.srcset = `
    ${baseUrl}${separator}w=300 300w,
    ${baseUrl}${separator}w=600 600w,
    ${baseUrl}${separator}w=900 900w,
    ${baseUrl} 1200w
  `;
  img.sizes = '(max-width: 640px) 300px, (max-width: 1024px) 600px, 900px';
  
  // Enable image decode API when supported
  if ('decode' in img) {
    img.decoding = 'async';
  }
}

// Optimize images on the page for LCP metric
export function optimizeLCPImages() {
  if (typeof window === 'undefined') return;
  
  // Wait until DOM is fully loaded
  window.addEventListener('DOMContentLoaded', () => {
    // Find the most likely LCP candidates (hero images, large banners)
    const lcpCandidates = document.querySelectorAll(
      '.hero-image, .banner-image, main > div:first-child img'
    );
    
    lcpCandidates.forEach((img) => {
      if (img instanceof HTMLImageElement) {
        img.fetchPriority = 'high';
        img.loading = 'eager';
        img.decoding = 'sync';
      }
    });
  });
}
