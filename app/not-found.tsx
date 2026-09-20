import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";

import BodyClass from "@/components/body-class";
import styles from "@/styles/not-found.module.scss";

// 絵柄だけが違う同寸の立ち絵。並び順がそのまま data-nf-art の番号になる。
// 増減させたら styles/not-found.module.scss の $art-count も直す
const ARTS = [
  "/images/404/surprised.webp",
  "/images/404/upside-down.webp",
  "/images/404/standing.webp",
] as const;

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
        {/* 立ち絵の抽選。/_not-found は静的プリレンダなので、ここで Math.random() を
            サーバー側で呼ぶとビルド時に 1 回評価され、そのデプロイの間ずっと同じ絵になる。
            描画前にブラウザで引き、どれを見せるかは CSS の属性セレクタに任せる。
            React が script をホイストするのは src と async を持つときだけなので、
            この位置にそのまま出力され、下の img がレイアウトされる前に走る */}
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.dataset.nfArt=Math.floor(Math.random()*${ARTS.length})`,
          }}
        />

        {/* 3枚ともアルファ付きなので、背景を消す加工は要らない。
            意味は隣のテキストが伝えているので alt は空にする */}
        {ARTS.map((src, i) => (
          <Image
            key={src}
            className={styles.art}
            data-nf-art={i}
            src={src}
            alt=""
            width={720}
            height={720}
            // 表示は最大 200px。ただし images.unoptimized で最適化を切っている
            // あいだ、この指定は効かない (srcSet ごと出力されない)。
            // 設定を戻すときに表示幅を測り直さずに済むよう、値だけ残してある
            sizes="200px"
          />
        ))}

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
