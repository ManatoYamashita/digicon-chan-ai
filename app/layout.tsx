import "@/styles/globals.css";
import Menu from "@/components/menu";
import { ProfilePage, WithContext } from 'schema-dts';
import { Metadata } from "next";
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
    siteName: 'でじこんちゃん',
    images: [
      {
        url: 'https://でじこんちゃん.net/ogp.jpg',
        width: 1200,
        height: 630,
        alt: 'でじこんちゃん - 東京都市大学デジタルコンテンツ研究会',
      },
    ],
    locale: 'ja_JP',
    type: 'website',
  },
  
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'apple-touch-icon-precomposed', url: '/apple-touch-icon-precomposed.png' },
      { rel: 'mask-icon', url: '/safari-pinned-tab.svg', color: '#5bbad5' },
    ],
  },
  
  twitter: {
    card: 'summary_large_image',
    title: 'でじこんちゃん.net',
    description: '東京都市大学デジタルコンテンツ研究会の公式ヴァーチャルコンシェルジュの「でじこんちゃん」です！！！！',
    creator: '@tcu_dc',
    site: '@tcu_dc',
    images: {
      url: 'https://でじこんちゃん.net/ogp.jpg',
      alt: 'dc-chan',
    }
  },
  
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    }
  },
  alternates: {
    canonical: 'https://でじこんちゃん.net',
    languages: {
      'ja': 'https://でじこんちゃん.net',
      'en-US': 'https://でじこんちゃん.net/en'
    }
  },
  verification: {
    google: 'googleサイト認証コードがあれば入力',
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
      "image": {
        "@type": "ImageObject",
        "url": "https://でじこんちゃん.net/ogp.jpg",
        "width": "1200",
        "height": "630",
        "caption": "でじこんちゃん - 東京都市大学デジタルコンテンツ研究会の公式キャラクター"
      },
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
        "url": "https://www.tcu.ac.jp/",
        "logo": {
          "@type": "ImageObject",
          "url": "https://www.tcu.ac.jp/favicon.ico"
        }
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
    },
    "about": {
      "@type": "WebSite",
      "name": "でじこんちゃん.net",
      "url": "https://でじこんちゃん.net",
      "description": "東京都市大学デジタルコンテンツ研究会の公式ヴァーチャルコンシェルジュサイト",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://でじこんちゃん.net/search?q={search_term_string}",
        "query": "search_term_string"
      }
    },
    "publisher": {
      "@type": "Organization",
      "name": "東京都市大学デジタルコンテンツ研究会",
      "alternateName": ["TCU-DC", "デジコン"],
      "url": "https://tcu-dc.net",
      "logo": {
        "@type": "ImageObject",
        "url": "https://でじこんちゃん.net/icon.webp",
        "width": "192",
        "height": "192"
      }
    }
  };

  // PageMapの内容
  const pageMapContent = `
  <PageMap>
    <DataObject type="thumbnail">
      <Attribute name="src" value="https://でじこんちゃん.net/images/dcchan-studentcard.webp"/>
      <Attribute name="width" value="1200"/>
      <Attribute name="height" value="630"/>
    </DataObject>
    <DataObject type="metatags">
      <Attribute name="og:image" value="https://でじこんちゃん.net/ogp.jpg"/>
      <Attribute name="og:type" value="website"/>
      <Attribute name="og:title" value="でじこんちゃん - 東京都市大学デジタルコンテンツ研究会"/>
    </DataObject>
  </PageMap>
  `;

  return (
    <html lang="ja">
      <head>
        <meta name="thumbnail" content="https://でじこんちゃん.net/images/dcchan-studentcard.webp" />
        
        <Script
          id="json-ld"
          key="json-ld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        {/* PageMapの追加 */}
        <Script
          id="page-map"
          key="page-map"
          dangerouslySetInnerHTML={{ __html: pageMapContent }}
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
      
      <body>
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