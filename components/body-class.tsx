"use client";

import { useEffect } from "react";

// 背景は body のクラスで切り替える方式 (styles/globals.css の .body-*)。
// 404 はクライアント側の処理がこれだけなので、ページ本体は Server Component のまま残す。
export default function BodyClass({ name }: { name: string }) {
  useEffect(() => {
    document.body.classList.add(name);
    return () => {
      document.body.classList.remove(name);
    };
  }, [name]);

  return null;
}
