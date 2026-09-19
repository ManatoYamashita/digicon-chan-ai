import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'でじこんちゃん.net',
    short_name: 'でじこんちゃん',
    description: '東京都市大学デジタルコンテンツ研究会の公式ヴァーチャルコンシェルジュ',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#ff91a4',
    icons: [
      {
        src: '/favicon.png',
        sizes: '500x500',
        type: 'image/png',
      },
    ],
  }
}
