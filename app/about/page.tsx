import AboutPage from "@/components/about-page";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'About',
  description: 'でじこんちゃんのプロフィールと東京都市大学デジタルコンテンツ研究会の紹介ページです。',
  openGraph: {
    title: 'About | でじこんちゃん.net',
    description: 'でじこんちゃんのプロフィールと東京都市大学デジタルコンテンツ研究会の紹介ページです。',
    url: 'https://でじこんちゃん.net/about',
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
    canonical: 'https://でじこんちゃん.net/about',
  },
};

export default function About() {
  return <AboutPage />;
}
