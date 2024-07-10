import React from 'react';
import "@/styles/globals.css";

export default function TalkLayout({ children }: { children: React.ReactNode }) {
    
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: 'でじこんちゃんとおしゃべりしよう！',
        image: '/ogp.jpg',
        description: '東京都市大学デジコンの公式キャラクタ『でじこんちゃん』のAIと会話を楽しめます。',
        keywords: 'でじこんちゃん, AI, ChatGPT, 東京都市大学, デジタルコンテンツ研究会, デジコン, TCU, tcu-dc, 山下マナト',
        publisher: {
          "@type": "Organization",
          name: '東京都市大学 デジタルコンテンツ研究会 山下マナト',
        },
      };
    
    return (
        <div className="body-talk">
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            {children}
        </div>
    );
}
