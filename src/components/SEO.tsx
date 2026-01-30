import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  type?: 'website' | 'article' | 'video.movie';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  canonical?: string;
  noIndex?: boolean;
}

const SITE_NAME = "OtakuTV";
const SITE_URL = "https://otakutv.in";
const DEFAULT_IMAGE = `${SITE_URL}/og-image.jpg`;
const DEFAULT_DESCRIPTION = "Your ultimate anime streaming platform. Watch thousands of anime series and movies in HD quality. Stream the latest episodes and classic favorites.";

export function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords = "anime, watch anime, anime streaming, anime online, anime episodes, anime series, anime movies, otaku",
  image = DEFAULT_IMAGE,
  type = 'website',
  publishedTime,
  modifiedTime,
  author,
  canonical,
  noIndex = false
}: SEOProps) {
  const location = useLocation();

  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} - Your Ultimate Anime Streaming Platform`;
  const pageUrl = canonical || `${SITE_URL}${location.pathname}${location.search}`;
  const imageUrl = image.startsWith('http') ? image : `${SITE_URL}${image}`;

  useEffect(() => {
    // Update document title
    document.title = fullTitle;

    // Create or update meta tags
    const updateMetaTag = (property: string, content: string, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${property}"]`) as HTMLMetaElement;

      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, property);
        document.head.appendChild(element);
      }
      element.content = content;
    };

    // Basic SEO meta tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);
    if (author) updateMetaTag('author', author);
    if (noIndex) {
      updateMetaTag('robots', 'noindex, nofollow');
    } else {
      updateMetaTag('robots', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');
    }

    // Open Graph meta tags
    updateMetaTag('og:title', fullTitle, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:image', imageUrl, true);
    updateMetaTag('og:url', pageUrl, true);
    updateMetaTag('og:type', type, true);
    updateMetaTag('og:site_name', SITE_NAME, true);
    updateMetaTag('og:locale', 'en_US', true);

    // Twitter Card meta tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:site', '@otakutv');
    updateMetaTag('twitter:title', fullTitle);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', imageUrl);
    updateMetaTag('twitter:creator', '@otakutv');

    // Article meta tags
    if (publishedTime) updateMetaTag('article:published_time', publishedTime, true);
    if (modifiedTime) updateMetaTag('article:modified_time', modifiedTime, true);
    if (author) updateMetaTag('article:author', author, true);

    // Update canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = pageUrl;

    // Add mobile-specific meta tags
    updateMetaTag('mobile-web-app-capable', 'yes');
    updateMetaTag('apple-mobile-web-app-capable', 'yes');
    updateMetaTag('apple-mobile-web-app-status-bar-style', 'black-translucent');
    updateMetaTag('apple-mobile-web-app-title', SITE_NAME);

    // Theme color for mobile browsers
    updateMetaTag('theme-color', '#8B5CF6');
    updateMetaTag('msapplication-TileColor', '#8B5CF6');

  }, [fullTitle, description, keywords, imageUrl, pageUrl, type, publishedTime, modifiedTime, author, noIndex]);

  return null;
}

// JSON-LD Structured Data Components
export function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": SITE_NAME,
    "url": SITE_URL,
    "logo": `${SITE_URL}/logo.png`,
    "sameAs": [
      "https://twitter.com/otakutv",
      "https://facebook.com/otakutv",
      "https://instagram.com/otakutv"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Customer Service",
      "email": "support@otakutv.in"
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function WebSiteSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": SITE_NAME,
    "url": SITE_URL,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${SITE_URL}/search?title={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function BreadcrumbSchema({ items }: { items: { name: string; url: string }[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function VideoSchema({
  name,
  description,
  thumbnailUrl,
  uploadDate,
  duration,
  contentUrl
}: {
  name: string;
  description: string;
  thumbnailUrl: string;
  uploadDate: string;
  duration?: string;
  contentUrl?: string;
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": name,
    "description": description,
    "thumbnailUrl": thumbnailUrl,
    "uploadDate": uploadDate,
    ...(duration && { "duration": duration }),
    ...(contentUrl && { "contentUrl": contentUrl })
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function MangaSchema({
  name,
  description,
  author,
  image,
  url,
  genres,
  rating,
  datePublished,
  dateModified
}: {
  name: string;
  description: string;
  author?: string;
  image: string;
  url: string;
  genres?: string[];
  rating?: number;
  datePublished?: string;
  dateModified?: string;
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Book",
    "name": name,
    "description": description,
    "image": image,
    "url": url,
    ...(author && { "author": { "@type": "Person", "name": author } }),
    ...(genres && genres.length > 0 && { "genre": genres }),
    ...(rating && {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": rating,
        "bestRating": 10,
        "worstRating": 0
      }
    }),
    ...(datePublished && { "datePublished": datePublished }),
    ...(dateModified && { "dateModified": dateModified })
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
