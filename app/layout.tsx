"use client";

import { useEffect } from "react";
import "@/styles/globals.css";
import Menu from "@/components/menu";

export default function RootLayout({ children }: { children: React.ReactNode }) {

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'でじこんちゃん - 東京都市大学 デジタルコンテンツ研究会',
    image: '/ogp.jpg',
    description: '東京都市大学デジタルコンテンツ研究会の公式ヴァーチャルコンシェルジュの「でじこんちゃん」です！',
    keywords: 'でじこんちゃん, 東京都市大学, デジタルコンテンツ研究会, デジコン, TCU, tcu-dc, 山下マナト',
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
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <main>{children}</main>
            <nav className='nav'>
              <Menu />
            </nav>
            <footer>© 2024 でじこんちゃん / Designed by ヤマシタマナト</footer>
          </body>
        </html>
  );
}
