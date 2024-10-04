import React from 'react';
import "@/styles/globals.css";
import { Metadata } from 'next';
import Head from './head';

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
    siteName: 'でじこんちゃん AI',
    images: [
      {
        url: 'https://でじこちゃん.net/ogp.jpg',
        width: 1200,
        height: 630,
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
    
    return (
      <>
        <Head />
        <div className="body-talk">
          {children}
        </div>
      </>
    );
}
