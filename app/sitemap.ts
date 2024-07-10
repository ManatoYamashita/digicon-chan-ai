import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseURL = process.env.BASE_URL || '';
  const lastModified = new Date();

  const staticPaths = [{
    url: baseURL,
    lastModified
  }];

  return [ ...staticPaths ];
}