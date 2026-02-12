const fs = require('fs');
const axios = require('axios');

const BASE_URL = 'https://otakutv.in';
const ANIME_API = 'https://otakutv.in/api/content/api/anime';
const MANGA_API = 'https://otakutv.in/api/manga/api/manga';

async function generateSitemap() {
    console.log('Generating dynamic sitemap...');

    const staticRoutes = [
        '',
        '/anime',
        '/manga',
        '/episodes',
        '/search',
        '/contact',
        '/seasonal',
        '/genres'
    ];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

    // Add static routes
    staticRoutes.forEach(route => {
        xml += `  <url>
    <loc>${BASE_URL}${route}</loc>
    <changefreq>daily</changefreq>
    <priority>${route === '' ? '1.0' : '0.8'}</priority>
  </url>
`;
    });

    // Only include static routes as requested - removed dynamic :id routes
    try {
        console.log('Skipping dynamic detail routes per user request.');
    } catch (error) {
        console.error('Error in sitemap generation:', error.message);
    }

    xml += '</urlset>';

    fs.writeFileSync('./public/sitemap.xml', xml);
    console.log('Sitemap generated successfully at ./public/sitemap.xml');
}

generateSitemap();
