"use client";

import React, { useEffect } from "react";
import "@/styles/globals.css";
import { JsonLd } from "@/components/jsonLd";
import { WithContext, Person } from "schema-dts";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'でじこんちゃん - About',
  description: '東京都市大学デジタルコンテンツ研究会の公式ヴァーチャルコンシェルジュの「でじこんちゃん」について紹介',
  keywords: ['でじこんちゃん', '東京都市大学', 'デジタルコンテンツ研究会', 'TCU', '山下マナト', 'デジコン', 'ginkiha', 'tcu-dc', 'デジコンちゃん'],
  authors: [{name: '山下マナト', url: 'https://manapuraza.com'}],
  creator: '山下マナト', 
  publisher: '山下マナト',
  openGraph: {
    title: 'でじこんちゃん - About',
    description: '東京都市大学デジタルコンテンツ研究会の公式ヴァーチャルコンシェルジュの「でじこんちゃん」について紹介',
    url: 'https://dc-chan.vercel.app',
    siteName: 'でじこんちゃん - 東京都市大学デジタルコンテンツ研究会',
    images: [
      {
        url: 'https://dc-chan.vercel.app/ogp.jpg',
        width: 600,
        height: 600,
        alt: 'でじこんちゃん - About',
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
    title: 'でじこんちゃん - About',
    description: '東京都市大学デジタルコンテンツ研究会の公式ヴァーチャルコンシェルジュの「でじこんちゃん」について紹介',
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

export default function AboutLayout({ children }: { children: React.ReactNode }) {
    
  const PersonData: WithContext<Person> = {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: 'でじこんちゃん - About',
      image: '/ogp.jpg',
      description: '東京都市大学デジタルコンテンツ研究会の公式ヴァーチャルコンシェルジュの「でじこんちゃん」について紹介',
      disambiguatingDescription: '東京都市大学デジタルコンテンツ研究会の公式ヴァーチャルコンシェルジュの「でじこんちゃん」です！',
      birthDate: '2014-06-04',
      birthPlace: '東京都市大学 横浜キャンパス',
      url: 'https://dc.tus.ac.jp/',
  };

  useEffect(() => {
      const body = document.body;
      body.classList.add("body-about");
  
      return () => {
        body.classList.remove("body-about");
      };
    }, []);

  return (
      <div>
        <JsonLd {...PersonData} />
        {children}
      </div>
  );
}
