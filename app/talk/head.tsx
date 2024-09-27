import React from 'react';
import { WithContext, ProfilePage } from 'schema-dts';

export default function Head() {
    const jsonLd: WithContext<ProfilePage> = {
        "@context": "https://schema.org",
        "@type": "ProfilePage",
        "dateCreated": "2024-07-10T20:30:00-05:00",
        "dateModified": "2024-07-10T20:53:00-05:00",
        "mainEntity": {
          "@type": "Person",
          "name": "でじこんちゃん（Digicon-chan）",
          "alternateName": "tcu_dc_bot22",
          "identifier": "https://でじこちゃん.net",
          "url": "https://でじこちゃん.net",
          "description": "東京都市大学デジタルコンテンツ研究会の公式ヴァーチャルコンシェルジュ / Tokyo City University Digital Content Study Society's official virtual concierge",
          "image": "https://dc-chan.vercel.app/ogp.jpg",
          "sameAs": [
            "https://tcu-dc.net",
            "https://manapuraza.com",
            "https://twitter.com/tcu_dc",
          ]
        }
      };

  return (
    <>
        <script
            id="json-ld"
            key="json-ld"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    </>
  );
}
