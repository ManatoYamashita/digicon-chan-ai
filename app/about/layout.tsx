"use client";

import React, { useEffect } from "react";
import "@/styles/globals.css";

export default function AboutLayout({ children }: { children: React.ReactNode }) {
    
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'About でじこんちゃん',
    image: '/ogp.jpg',
    description: '東京都市大学デジタルコンテンツ研究会の公式ヴァーチャルコンシェルジュの「でじこんちゃん」について',
    keywords: 'でじこんちゃん, 東京都市大学, デジタルコンテンツ研究会, デジコン, TCU, tcu-dc, 山下マナト',

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
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
        {children}
      </div>
  );
}
