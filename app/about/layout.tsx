import React from 'react';
import "@/styles/globals.css";
import { Metadata } from 'next';
import Head from './head';

export const metadata: Metadata = {
  title: 'でじこんちゃん とは',
  description: '東京都市大学デジタルコンテンツ研究会の公式ヴァーチャルコンシェルジュの「でじこんちゃん」について紹介',
  keywords: ['でじこんちゃん', '東京都市大学', 'デジタルコンテンツ研究会', 'TCU', '山下マナト', 'デジコン', 'ginkiha', 'tcu-dc', 'デジコンちゃん'],
  authors: [{name: '山下マナト', url: 'https://manapuraza.com'}],
  creator: '山下マナト', 
  publisher: '山下マナト',
  openGraph: {
    title: 'でじこんちゃん とは',
    description: '東京都市大学デジタルコンテンツ研究会の公式ヴァーチャルコンシェルジュの「でじこんちゃん」について紹介',
    url: 'https://でじこちゃん.net/about',
    siteName: 'でじこんちゃん - 東京都市大学デジタルコンテンツ研究会',
    images: [
      {
        url: 'https://でじこちゃん.net/ogp.jpg',
        width: 1200,
        height: 630,
        alt: 'でじこんちゃん とは',
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
    title: 'でじこんちゃん とは',
    description: '東京都市大学デジタルコンテンツ研究会の公式ヴァーチャルコンシェルジュの「でじこんちゃん」について紹介',
    creator: '@tcu_dc',
    images: {
      url: 'https://でじこちゃん.net/ogp.jpg',
      alt: 'dc-chan',
    }
  },
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  
  return (
    <>
      <Head />
      <div className="body-about">
        {children}
      </div>
    </>
  );
}
