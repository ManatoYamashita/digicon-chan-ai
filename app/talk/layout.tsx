import React from 'react';
import "@/styles/globals.css";
import { WithContext, Person } from 'schema-dts';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '『でじこんちゃん』とおしゃべり！',
  description: '東京都市大学デジタルコンテンツ研究会の公式ヴァーチャルコンシェルジュの「でじこんちゃん」のAIとおしゃべりしよう!',
  keywords: ['でじこんちゃん', '東京都市大学', 'デジタルコンテンツ研究会', 'TCU', '山下マナト', 'デジコン', 'ginkiha', 'tcu-dc', 'デジコンちゃん', 'AI', 'でじこんちゃんAI', 'chatGPT'],
  authors: [{name: '山下マナト', url: 'https://manapuraza.com'}],
  creator: '山下マナト', 
  publisher: '山下マナト',
  openGraph: {
    title: '『でじこんちゃん』とおしゃべり！',
    description: '東京都市大学デジタルコンテンツ研究会の公式ヴァーチャルコンシェルジュの「でじこんちゃん」のAIとおしゃべりしよう!!',
    url: 'https://dc-chan.vercel.app',
    siteName: '「でじこんちゃん」とおしゃべり！',
    images: [
      {
        url: 'https://dc-chan.vercel.app/ogp.jpg',
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
    card: 'app',
    title: 'でじこんちゃん - AIとおしゃべりしよう!',
    description: '東京都市大学デジタルコンテンツ研究会の公式ヴァーチャルコンシェルジュの「でじこんちゃん」のAIとおしゃべりしよう!!!',
    creator: '@tcu_dc',
    images: {
      url: 'https://dc-chan.vercel.app/ogp.jpg',
      alt: 'dc-chan',
    },
    app: {
      name: 'twitter_app',
      id: {
        iphone: 'twitter_app://iphone',
        ipad: 'twitter_app://ipad',
        googleplay: 'twitter_app://googleplay',
      },
      url: {
        iphone: 'https://iphone_url',
        ipad: 'https://ipad_url',
      },
    },
  },
}

export default function TalkLayout({ children }: { children: React.ReactNode }) {
    
  const jsonLd: WithContext<Person> = {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: 'でじこんちゃんとおしゃべりしよう！',
      image: '/ogp.jpg',
      description: '東京都市大学デジタルコンテンツ研究会の公式ヴァーチャルコンシェルジュの「でじこんちゃん」AIとおしゃべり！',
      disambiguatingDescription: '東京都市大学デジタルコンテンツ研究会の公式ヴァーチャルコンシェルジュの「でじこんちゃん」です！',
      birthDate: '2014-06-04',
      birthPlace: '東京都市大学 横浜キャンパス',
      url: 'https://dc.tus.ac.jp/',
  };
    
    return (
        <div className="body-talk">
            <script
              key="json-ld"
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            {children}
        </div>
    );
}
