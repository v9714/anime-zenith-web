import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  schema?: any; // JSON-LD structured data
}

const SEO: React.FC<SEOProps> = ({
  title,
  description,
  keywords,
  image = 'https://otakutv.in/og-image.png',
  url = 'https://otakutv.in',
  type = 'website',
  schema,
}) => {
  const siteTitle = title ? `${title} | OtakuTV` : 'OtakuTV - Watch Anime Online | Stream HD Anime Episodes & Movies';
  const siteDescription = description || 'Watch thousands of anime series and movies in HD quality. Stream the latest episodes and enjoy the best anime streaming experience on OtakuTV.';
  const siteKeywords = keywords || 'anime, watch anime, anime streaming, anime online, otaku, HD anime';

  const canonicalUrl = url.startsWith('http') ? url : `https://otakutv.in${url}`;

  return (
    <Helmet>
      {/* Standard Meta Tags */}
      <title>{siteTitle}</title>
      <meta name="description" content={siteDescription} />
      <meta name="keywords" content={siteKeywords} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={siteDescription} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="OtakuTV" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={siteTitle} />
      <meta name="twitter:description" content={siteDescription} />
      <meta name="twitter:image" content={image} />

      {/* Schema.org JSON-LD */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
};

export const OrganizationSchema = () => (
  <Helmet>
    <script type="application/ld+json">
      {JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "OtakuTV",
        "url": "https://otakutv.in",
        "logo": "https://otakutv.in/favicon.png",
        "sameAs": [
          "https://twitter.com/otakutv",
          "https://facebook.com/otakutv"
        ]
      })}
    </script>
  </Helmet>
);

export const WebSiteSchema = () => (
  <Helmet>
    <script type="application/ld+json">
      {JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "OtakuTV",
        "url": "https://otakutv.in",
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://otakutv.in/search?q={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      })}
    </script>
  </Helmet>
);

export const BreadcrumbSchema = ({ items }: { items: { name: string; url: string }[] }) => (
  <Helmet>
    <script type="application/ld+json">
      {JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": items.map((item, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "name": item.name,
          "item": item.url
        }))
      })}
    </script>
  </Helmet>
);

export const VideoSchema = ({ name, description, thumbnailUrl, uploadDate }: { name: string; description: string; thumbnailUrl: string; uploadDate: string }) => (
  <Helmet>
    <script type="application/ld+json">
      {JSON.stringify({
        "@context": "https://schema.org",
        "@type": "VideoObject",
        "name": name,
        "description": description,
        "thumbnailUrl": thumbnailUrl,
        "uploadDate": uploadDate,
        "contentUrl": window.location.href,
        "embedUrl": window.location.href
      })}
    </script>
  </Helmet>
);

export const MangaSchema = ({ name, description, author, image, url, genres, rating, dateModified }: any) => (
  <Helmet>
    <script type="application/ld+json">
      {JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Book",
        "name": name,
        "description": description,
        "author": {
          "@type": "Person",
          "name": author || "Unknown"
        },
        "image": image,
        "url": url,
        "genre": genres,
        "aggregateRating": rating ? {
          "@type": "AggregateRating",
          "ratingValue": rating,
          "bestRating": "5",
          "worstRating": "1",
          "ratingCount": "100"
        } : undefined,
        "dateModified": dateModified
      })}
    </script>
  </Helmet>
);

export { SEO };
export default SEO;
