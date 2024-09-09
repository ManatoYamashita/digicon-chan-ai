import React from 'react';
import "@/styles/globals.css";
import { WithContext, ProfilePage } from 'schema-dts';
import { Metadata } from 'next';
import Script from 'next/script';


export const metadata: Metadata = {
  title: '『でじこんちゃん』AIとおしゃべり！',
  description: '東京都市大学デジタルコンテンツ研究会の公式ヴァーチャルコンシェルジュの「でじこんちゃん」のAIとおしゃべりしよう!デジコンちゃんじゃなくて、でじこんちゃんだよ！',
  keywords: ['でじこんちゃん', '東京都市大学', 'デジタルコンテンツ研究会', 'TCU', '山下マナト', 'デジコン', 'ginkiha', 'tcu-dc', 'デジコンちゃん', 'AI', 'でじこんちゃんAI', 'chatGPT'],
  authors: [{name: '山下マナト', url: 'https://manapuraza.com'}],
  creator: '山下マナト', 
  publisher: '山下マナト',
  openGraph: {
    title: '『でじこんちゃん』とおしゃべり！',
    description: '東京都市大学デジタルコンテンツ研究会の公式ヴァーチャルコンシェルジュの「でじこんちゃん」のAIとおしゃべりしよう!!',
    url: 'https://でじこちゃん.net/talk',
    siteName: '「でじこんちゃん」とおしゃべり！',
    images: [
      {
        url: 'https://でじこちゃん.net/ogp.jpg',
        width: 600,
        height: 600,
        alt: '『でじこんちゃん』とおしゃべりしよう！',
      },
    ],
    locale: 'ja_JP',
    type: 'website',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
    other: {
      rel: 'apple-touch-icon-precomposed',
      url: 'favicon.ico',
    },
  },
  twitter: {
    card: 'summary_large_image',
    title: 'でじこんちゃん AI',
    description: '東京都市大学デジタルコンテンツ研究会の公式ヴァーチャルコンシェルジュの「でじこんちゃん」のAIとおしゃべりしよう!!!',
    creator: '@tcu_dc',
    images: {
      url: 'https://でじこちゃん.net/ogp.jpg',
      alt: 'dc-chan',
    },
  },
}

export default function TalkLayout({ children }: { children: React.ReactNode }) {
    
  const jsonLd: WithContext<ProfilePage> = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "dateCreated": "2024-07-10T20:30:00-05:00",
    "dateModified": "2024-07-10T20:53:00-05:00",
    "mainEntity": {
      "@type": "Person",
      "name": "でじこんちゃん（Digicon-chan）",
      "alternateName": "tcu_dc_bot22",
      "identifier": "https://でじこちゃん.net",
      "url": "https://でじこちゃん.net",
      "description": "東京都市大学デジタルコンテンツ研究会の公式ヴァーチャルコンシェルジュ / Tokyo City University Digital Content Study Society's official virtual concierge",
      "image": "https://dc-chan.vercel.app/ogp.jpg",
      "sameAs": [
        "https://tcu-dc.net",
        "https://manapuraza.com",
        "https://twitter.com/tcu_dc",
      ]
    }
  };
    
    return (
      <>
        <head>
          <Script
            id="json-ld"
            key="json-ld"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
        </head>
        <div className="body-talk">
          {children}
        </div>
      </>
    );
}
