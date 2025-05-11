
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from './lib/ThemeProvider';
import App from './App.tsx';
import './index.css';
import { optimizeLCPImages } from './lib/image-optimizer';

// Error handling for script loading issues
window.addEventListener('error', (event) => {
  if (event.target && (event.target as HTMLElement).tagName === 'SCRIPT') {
    console.warn('Script loading error. Attempting recovery...');
    
    // Try to recover by manually loading critical resources
    const failedSrc = (event.target as HTMLScriptElement).src;
    if (failedSrc) {
      console.info('Failed to load script:', failedSrc);
    }
  }
});

// Optimize LCP images when available
optimizeLCPImages();

// Remove the skeleton loader element if it exists
const skeletonRoot = document.querySelector('#root > .hero-placeholder');
if (skeletonRoot) {
  skeletonRoot.remove();
}

// Function to initialize app with retry logic
const initializeApp = () => {
  try {
    const rootElement = document.getElementById("root");
    if (!rootElement) {
      throw new Error("Root element not found");
    }
    
    const root = createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <ThemeProvider defaultTheme="dark">
          <App />
        </ThemeProvider>
      </React.StrictMode>
    );
  } catch (error) {
    console.error('Error initializing application:', error);
    
    // Retry rendering after a delay if initial render fails
    setTimeout(() => {
      console.info('Retrying application initialization...');
      initializeApp();
    }, 1000);
  }
};

// Start the application
initializeApp();
