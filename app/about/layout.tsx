import "@/styles/globals.css";
import { WithContext, Person } from "schema-dts";
import { Metadata } from "next";
import Head from "next/head";

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
    
  const jsonLd: WithContext<Person> = {
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
  
  return (
    <>
      <Head>
        <script
          key="json-ld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </Head>
      <div className="body-about">
        {children}
      </div>
    </>
  );
}
