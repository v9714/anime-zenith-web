import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.tsx';
import './index.css';
import { optimizeLCPImages } from './lib/image-optimizer';


// Create a proper error handler for the application
const handleError = (event: ErrorEvent | PromiseRejectionEvent) => {
  console.error('Application error:', event);

  // Log errors but don't reload automatically to prevent infinite loops
  if (event instanceof ErrorEvent && event.message?.includes('Cannot read properties of null')) {
    console.error('React hooks error detected');
  }

  // For resource loading errors like script/module failures
  if (event instanceof ErrorEvent && event.target && (event.target as HTMLElement).tagName === 'SCRIPT') {
    console.warn('Script loading error:', (event.target as HTMLScriptElement).src);
  }
};

// Register global error handlers
window.addEventListener('error', handleError);
window.addEventListener('unhandledrejection', handleError);

// Optimize LCP images when available
optimizeLCPImages();

// Remove the skeleton loader element if it exists
const skeletonRoot = document.querySelector('#root > .hero-placeholder');
if (skeletonRoot) {
  skeletonRoot.remove();
}

// Function to initialize app with proper error handling
const initializeApp = () => {
  try {
    const rootElement = document.getElementById("root");
    if (!rootElement) {
      throw new Error("Root element not found");
    }

    const root = createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <HelmetProvider>
          <App />
        </HelmetProvider>
      </React.StrictMode>
    );
  } catch (error) {
    console.error('Error initializing application:', error);

    // Create fallback UI in case of critical rendering errors
    const rootElement = document.getElementById("root");
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="padding: 20px; text-align: center;">
          <h2>Something went wrong</h2>
          <p>The application failed to initialize. Please try refreshing the page.</p>
        </div>
      `;
    }
  }
};

// Start the application
initializeApp();
