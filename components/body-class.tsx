"use client";

import { useEffect, useLayoutEffect } from "react";

// サーバーでは useLayoutEffect が警告を出すので、そこだけ useEffect にする。
// サーバーには document が無く、どちらにしても何も実行されない。
const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

// 背景は body のクラスで切り替える方式 (styles/globals.css の .body-*)。
// ページごとに 1 つ描画し、付け外しの所有者をこのコンポーネントだけに保つ。
//
// レイアウトエフェクトであることが重要。React はページ遷移のとき
// startViewTransition({ update }) の update の中で DOM の更新とレイアウト
// エフェクトを実行し、その直後に新しいスナップショットを撮る。旧ページの
// クリーンアップ (クラスの除去) と新ページの追加が同じ update に収まるので、
// スナップショットには新しい背景が写る。
//
// useEffect (passive effect) は transition.ready の後に回るため、撮影時点では
// まだ旧ページのクラスが付いたままになる。::view-transition-new が live 表現の
// ブラウザでは数フレーム遅れて追いつくが、静止画のブラウザでは遷移のあいだ
// 背景が古いままになる (#40)。
export default function BodyClass({ name }: { name: string }) {
  useIsomorphicLayoutEffect(() => {
    document.body.classList.add(name);
    return () => {
      document.body.classList.remove(name);
    };
  }, [name]);

  return null;
}
