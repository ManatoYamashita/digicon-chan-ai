"use client";

import { useEffect } from "react";
import "@/styles/globals.css";
import Menu from "@/components/menu";

export default function RootLayout({ children }: { children: React.ReactNode }) {
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
            <main>{children}</main>
            <nav className='nav'>
              <Menu />
            </nav>
            <footer>© 2024 でじこんちゃん / Designed by ヤマシタマナト</footer>
          </body>
        </html>
  );
}
