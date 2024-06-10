"use client";

import { useEffect } from "react";
import "@/styles/globals.css";
import Menu from "@/components/menu";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const body = document.body;
    body.classList.add("body-default");

    // 任意の他のクラス名を追加する例
    // body.classList.add("additional-class");

    return () => {
      body.classList.remove("body-default");

      // 任意の他のクラス名を削除する例
      // body.classList.remove("additional-class");
    };
  }, []);

  return (
        <html lang="ja">
          <head>
            <title>でじこんちゃん</title>
          </head>
          <body >
            <main>{children}</main>
            <nav className='nav'>
              <Menu />
            </nav>
            <footer>© 2024 でじこんちゃん / Designed by ヤマシタマナト</footer>
          </body>
        </html>
  );
}
