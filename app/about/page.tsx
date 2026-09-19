import AboutPage from "@/components/about-page";
import { SITE_URL } from '@/lib/site';
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'About',
  description: 'でじこんちゃんのプロフィールと東京都市大学デジタルコンテンツ研究会の紹介ページです。',
  openGraph: {
    title: 'About | でじこんちゃん.net',
    description: 'でじこんちゃんのプロフィールと東京都市大学デジタルコンテンツ研究会の紹介ページです。',
    url: `${SITE_URL}/about`,
    images: [
      {
        url: '/ogp.jpg',
        width: 1200,
        height: 630,
        alt: 'でじこんちゃん About',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About | でじこんちゃん.net',
    description: 'でじこんちゃんのプロフィールと東京都市大学デジタルコンテンツ研究会の紹介。',
  },
  alternates: {
    canonical: `${SITE_URL}/about`,
  },
};

export default function About() {
  return <AboutPage />;
}
