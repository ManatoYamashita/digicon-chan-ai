import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://でじこんちゃん.net'

  return [
    {
      url: baseUrl,
      lastModified: new Date('2026-03-08'),
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: `${baseUrl}/chat`,
      lastModified: new Date('2026-03-08'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date('2026-03-08'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ]
}
