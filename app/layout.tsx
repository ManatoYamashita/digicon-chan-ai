"use client";

import { useEffect } from "react";
import "@/styles/globals.css";
import Menu from "@/components/menu";
import { Person, WithContext } from 'schema-dts';
import JsonLd from "@/components/jsonLd";
import { Metadata } from "next";

export default function RootLayout({ children }: { children: React.ReactNode }) {

  const metadata: Metadata = {
    title: 'でじこんちゃん - 東京都市大学デジタルコンテンツ研究会',
    description: '東京都市大学デジタルコンテンツ研究会の公式ヴァーチャルコンシェルジュの「でじこんちゃん」です！',
    keywords: ['でじこんちゃん', '東京都市大学', 'デジタルコンテンツ研究会', 'TCU', '山下マナト', 'デジコン', 'ginkiha', 'tcu-dc', 'デジコンちゃん', 'AI', 'でじこんちゃんAI'],
    authors: [{name: '山下マナト', url: 'https://manapuraza.com'}],
    creator: '山下マナト', 
    publisher: '山下マナト',
    openGraph: {
      title: 'でじこんちゃん - 東京都市大学デジタルコンテンツ研究会',
      description: '東京都市大学デジタルコンテンツ研究会の公式ヴァーチャルコンシェルジュの「でじこんちゃん」です！！！',
      url: 'https://dc-chan.vercel.app',
      siteName: 'でじこんちゃん - 東京都市大学デジタルコンテンツ研究会',
      images: [
        {
          url: 'https://dc-chan.vercel.app/ogp.jpg',
          width: 600,
          height: 600,
          alt: 'でじこんちゃん - 東京都市大学デジタルコンテンツ研究会',
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
      description: '東京都市大学デジタルコンテンツ研究会の公式ヴァーチャルコンシェルジュの「でじこんちゃん」です！！！！',
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
  
  const PersonData: WithContext<Person> = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'でじこんちゃん - 東京都市大学 デジタルコンテンツ研究会',
    image: '/ogp.jpg',
    description: '東京都市大学デジタルコンテンツ研究会の公式ヴァーチャルコンシェルジュの「でじこんちゃん」です！',
    disambiguatingDescription: '東京都市大学デジタルコンテンツ研究会の公式ヴァーチャルコンシェルジュの「でじこんちゃん」です！',
    birthDate: '2014-06-04',
    birthPlace: '東京都市大学 横浜キャンパス',
    url: 'https://dc.tus.ac.jp/',
};

  useEffect(() => {
    const body = document.body;
    body.classList.add("body-default");

    return () => {
      body.classList.remove("body-default");
    };
  }, []);

  return (
        <html lang="ja">
          <head>
            <title>でじこんちゃん</title>
          </head>
          <body >
            <main>{children}</main>
            <JsonLd {...PersonData} />
            <nav className='nav'>
              <Menu />
            </nav>
            <footer>© 2024 でじこんちゃん / Designed by ヤマシタマナト</footer>
          </body>
        </html>
  );
}
