import "@/styles/globals.css";
import Menu from "@/components/menu";
import { ProfilePage, WithContext } from 'schema-dts';
import { Metadata } from "next";
import Head from 'next/head'
import Link from "next/link";
import Script from "next/script";
import { Suspense } from 'react';

import Analytics from './analytics';

export const metadata: Metadata = {
  title: 'でじこんちゃん - 東京都市大学デジタルコンテンツ研究会',
  description: '東京都市大学デジタルコンテンツ研究会の公式ヴァーチャルコンシェルジュの「でじこんちゃん」です！',
  keywords: ['でじこんちゃん', '東京都市大学', 'デジタルコンテンツ研究会', 'TCU', '山下マナト', 'デジコン', 'ginkiha', 'tcu-dc', 'デジコンちゃん', 'AI', 'でじこんちゃんAI'],
  authors: [{name: '山下マナト', url: 'https://manapuraza.com'}],
  creator: '山下マナト', 
  publisher: '山下マナト',
  openGraph: {
    title: 'でじこんちゃん - 東京都市大学デジタルコンテンツ研究会',
    description: '東京都市大学デジタルコンテンツ研究会の公式ヴァーチャルコンシェルジュの「でじこんちゃん」です！！！',
    url: 'https://でじこんちゃん.net',
    siteName: 'でじこんちゃん - 東京都市大学デジタルコンテンツ研究会',

    images: [
      {
        url: 'http://でじこんちゃん.net/ogp.jpg',
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
    card: 'summary_large_image',
    title: 'でじこんちゃん.net',
    description: '東京都市大学デジタルコンテンツ研究会の公式ヴァーチャルコンシェルジュの「でじこんちゃん」です！！！！',
    creator: '@tcu_dc',
    images: {
      url: 'http://でじこんちゃん.net/ogp.jpg',
      alt: 'dc-chan',
    }
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {

  const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  
  const jsonLd: WithContext<ProfilePage> = 
  {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "dateCreated": "2024-07-10T20:30:00-05:00",
    "dateModified": "2024-07-10T20:53:00-05:00",
    "mainEntity": {
      "@type": "Person",
      "name": "でじこんちゃん",
      "alternateName": ["デジコンちゃん", "Digicon-chan", "DC-chan", "デジコン"],
      "additionalName": "でじこんちゃん",
      "identifier": "https://でじこんちゃん.net",
      "url": "https://でじこんちゃん.net",
      "description": "東京都市大学デジタルコンテンツ研究会の公式ヴァーチャルコンシェルジュ / Tokyo City University Digital Content Study Society's official virtual concierge",
      "image": "https://でじこんちゃん.net/ogp.jpg",
      "birthDate": "2014-06-04",
      "gender": "female",
      "knowsAbout": [
        "Tokyo City University - Digital Content Study Society",
        "Official Virtual Concierge",
        "Tokyo City University virtual student",
        "Creator"
      ],
      "alumniOf": {
        "@type": "CollegeOrUniversity",
        "name": "Tokyo City University",
        "url": "https://www.tcu.ac.jp/"
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "Customer Support",
        "email": "tcu.dcs@gmail.com",
        "url": "https://tcu-dc.net/contact",
        "availableLanguage": ["Japanese", "English"]
      },
      "sameAs": [
        "https://tcu-dc.net",
        "https://manapuraza.com",
        "https://twitter.com/tcu_dc",
        "https://x.com/tcu_dc",
        "https://x.com/tcu_dc_bot22"
      ]
    }
  };

  return (
        <html lang="ja">
          <Head>
            <title>でじこんちゃん - 東京都市大学デジタルコンテンツ研究会</title>
          </Head>
          <head>
            <Script
              id="json-ld"
              key="json-ld"
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {GA_MEASUREMENT_ID && (
              <>
                {/* Global Site Tag (gtag.js) - Google Analytics */}
                <Script
                  src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
                  strategy="afterInteractive"
                />
                <Script id="ga-init" strategy="afterInteractive">
                  {`
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());

                    gtag('config', '${GA_MEASUREMENT_ID}', {
                      page_path: window.location.pathname,
                    });
                  `}
                </Script>
              </>
              )}
          </head>

          <body >
            <main>
              <Suspense fallback={<div>Loading...</div>}>
                <Analytics />
              </Suspense>
              {children}
              <nav className='nav'>
                <Menu />
              </nav>
              <footer>© 2024 でじこんちゃん.net / Designed/Dev by <Link href="https://manapuraza.com">ヤマシタマナト(TCU-DC)</Link></footer>
            </main>
          </body>
        </html>
  );
}
