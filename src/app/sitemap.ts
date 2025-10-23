import { MetadataRoute } from 'next'
 
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://atomican.com';
  const routes = [
    '/lab/workbench',
    '/lab/assistant',
    '/lab/market',
    '/lab/apparatus',
    '/lab/settings'
  ];

  const sitemapRoutes = routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
    },
    ...sitemapRoutes
  ];
}
