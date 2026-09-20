import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";

import BodyClass from "@/components/body-class";
import styles from "@/styles/not-found.module.scss";

export const metadata: Metadata = {
  // layout の template で「404 | でじこんちゃん.net」になる
  title: '404',
  description: 'お探しのページは見つかりませんでした。',
  // metadata は浅いマージなので、キーごと再定義すれば root の値は残らない。
  // 404 にインデックス可と正規URLを主張させない。
  robots: { index: false, follow: false },
  alternates: { canonical: null },
};

export default function NotFound() {
  return (
    <>
      <BodyClass name="body-notfound" />

      <div className={styles.page}>
        {/* 白背景のまま配布されている画像。styles 側の mix-blend-mode で下地に溶かす。
            意味は隣のテキストが伝えているので alt は空にする */}
        <Image
          className={styles.art}
          src="/images/404.webp"
          alt=""
          width={1200}
          height={1200}
          // 表示は最大 200px。指定しないと 1200px と 3840px の候補を出してしまう
          sizes="200px"
          priority
        />

        {/* 見た目の主役は数字だが、ページの主見出しは文のほう。
            1つの h1 に入れて「404 ページが見つかりませんでした」と読ませる */}
        <h1 className={styles.heading}>
          <span className={styles.code}>404</span>
          <span className={styles.lead}>ページが見つかりませんでした</span>
        </h1>

        <p className={styles.detail}>
          URLが間違っているか、ページが移動しちゃったみたい…ごめんね！
        </p>

        <Link className={styles.cta} href="/">
          ホームに戻る
        </Link>
      </div>
    </>
  );
}
