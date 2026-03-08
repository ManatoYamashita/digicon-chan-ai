"use client";

import Image from "next/image";
import type { Emotion } from "@/components/chat-page";
import styles from "@/styles/chat-character.module.scss";

type Props = {
  emotion: Emotion;
  imageSrc: string;
};

export default function ChatCharacter({ emotion, imageSrc }: Props) {
  return (
    <div className={styles.character}>
      <div className={styles.imageWrap}>
        <Image
          src={imageSrc}
          fill
          alt={`でじこんちゃん - ${emotion}`}
          sizes="(max-width: 768px) 100vw, 40vw"
          className={styles.img}
          priority
          unoptimized
        />
      </div>
    </div>
  );
}
