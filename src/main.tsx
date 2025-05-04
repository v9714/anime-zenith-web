
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from './lib/ThemeProvider';
import App from './App.tsx';
import './index.css';
import { optimizeLCPImages } from './lib/image-optimizer';

// Optimize LCP images when available
optimizeLCPImages();

// Remove the skeleton loader element if it exists
const skeletonRoot = document.querySelector('#root > .hero-placeholder');
if (skeletonRoot) {
  skeletonRoot.remove();
}

// Hydrate the app with ThemeProvider
createRoot(document.getElementById("root")!).render(
  <ThemeProvider defaultTheme="dark">
    <App />
  </ThemeProvider>
);
