import { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: new Date('2026-03-08'),
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: `${SITE_URL}/chat`,
      lastModified: new Date('2026-03-08'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: new Date('2026-03-08'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ]
}
