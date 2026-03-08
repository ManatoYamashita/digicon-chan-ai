import "@/styles/globals.css";
import { Nunito } from "next/font/google";
import { ProfilePage, WebSite, WithContext } from 'schema-dts';
import { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { Suspense } from 'react';

import Analytics from './analytics';
import Menu from '@/components/menu';

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-nunito",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://でじこんちゃん.net'),
  title: {
    default: 'でじこんちゃん - 東京都市大学デジタルコンテンツ研究会',
    template: '%s | でじこんちゃん.net',
  },
  description: '東京都市大学デジタルコンテンツ研究会の公式ヴァーチャルコンシェルジュ「でじこんちゃん」です。',
  keywords: ['でじこんちゃん', '東京都市大学', 'デジタルコンテンツ研究会', 'TCU', '山下マナト', 'デジコン', 'ginkiha', 'tcu-dc', 'デジコンちゃん', 'AI', 'でじこんちゃんAI'],
  authors: [{name: '山下マナト', url: 'https://manapuraza.com'}],
  creator: '山下マナト',
  publisher: '東京都市大学デジタルコンテンツ研究会',

  openGraph: {
    title: 'でじこんちゃん - 東京都市大学デジタルコンテンツ研究会',
    description: '東京都市大学デジタルコンテンツ研究会の公式ヴァーチャルコンシェルジュ「でじこんちゃん」です。',
    url: 'https://でじこんちゃん.net',
    siteName: 'でじこんちゃん.net',
    images: [
      {
        url: '/ogp.jpg',
        width: 1200,
        height: 630,
        alt: 'でじこんちゃん - 東京都市大学デジタルコンテンツ研究会',
      },
    ],
    locale: 'ja_JP',
    type: 'website',
  },

  icons: {
    icon: [{ url: '/favicon.ico' }],
    shortcut: '/favicon.ico',
    apple: [{ url: '/images/icons/dcchan-icon.webp' }],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'でじこんちゃん.net',
    description: '東京都市大学デジタルコンテンツ研究会の公式ヴァーチャルコンシェルジュ「でじこんちゃん」です。',
    creator: '@tcu_dc',
    site: '@tcu_dc',
    images: {
      url: '/ogp.jpg',
      alt: 'でじこんちゃん - 東京都市大学デジタルコンテンツ研究会公式キャラクター',
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
    }
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {

  const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  
  const jsonLdProfile: WithContext<ProfilePage> = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "dateCreated": "2024-07-10T20:30:00+09:00",
    "dateModified": "2026-03-08T00:00:00+09:00",
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
    "publisher": {
      "@type": "Organization",
      "name": "東京都市大学デジタルコンテンツ研究会",
      "alternateName": ["TCU-DC", "デジコン"],
      "url": "https://tcu-dc.net",
      "logo": {
        "@type": "ImageObject",
        "url": "https://でじこんちゃん.net/images/icons/dcchan-icon.webp",
        "width": "192",
        "height": "192"
      }
    }
  };

  const jsonLdWebSite: WithContext<WebSite> = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "でじこんちゃん.net",
    "url": "https://でじこんちゃん.net",
    "description": "東京都市大学デジタルコンテンツ研究会の公式ヴァーチャルコンシェルジュサイト",
    "publisher": {
      "@type": "Organization",
      "name": "東京都市大学デジタルコンテンツ研究会",
      "url": "https://tcu-dc.net"
    }
  };

  return (
    <html lang="ja">
      <head>
        <meta name="thumbnail" content="https://でじこんちゃん.net/images/dcchan-studentcard.webp" />
        
        <Script
          id="json-ld-profile"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdProfile) }}
        />
        <Script
          id="json-ld-website"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebSite) }}
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
      
      <body className={nunito.variable}>
        <main>
          <Suspense fallback={<div>Loading...</div>}>
            <Analytics />
          </Suspense>
          {children}
          <footer>© {new Date().getFullYear()} でじこんちゃん.net / Designed/Dev by <Link href="https://manapuraza.com">ヤマシタマナト(TCU-DC)</Link></footer>
        </main>
        <Menu />
      </body>
    </html>
  );
}