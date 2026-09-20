"use client";

import Image from "next/image";
import type { Emotion } from "@/lib/emotion";
import styles from "@/styles/chat-character.module.scss";

// 画像が伝える表情を言葉にする。感情のキー (楽・default など) をそのまま読ませない
const EMOTION_ALT: Record<Emotion, string> = {
  "楽": "笑顔のでじこんちゃん",
  "怒": "怒っているでじこんちゃん",
  "哀": "悲しんでいるでじこんちゃん",
  "困": "困っているでじこんちゃん",
  "照": "照れているでじこんちゃん",
  default: "でじこんちゃん",
};

type Props = {
  emotion: Emotion;
  imageSrc: string;
};

export default function ChatCharacter({ emotion, imageSrc }: Props) {
  return (
    <div className={styles.character}>
      <div className={styles.imageWrap}>
        {/* 立ち絵はアニメーション WebP。Next.js の画像最適化はどの幅でも元のファイルを返すだけなので、最適化を通さず静的ファイルとして配信する */}
        <Image
          src={imageSrc}
          fill
          alt={EMOTION_ALT[emotion]}
          className={styles.img}
          priority
          unoptimized
        />
      </div>
    </div>
  );
}
