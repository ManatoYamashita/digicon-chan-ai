"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import type { Emotion } from "@/components/chat-page";
import styles from "@/styles/chat-character.module.scss";

type Props = {
  emotion: Emotion;
  imageSrc: string;
};

export default function ChatCharacter({ emotion, imageSrc }: Props) {
  return (
    <div className={styles.character}>
      <AnimatePresence mode="wait">
        <motion.div
          key={emotion}
          className={styles.imageWrap}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Image
            src={imageSrc}
            fill
            alt={`でじこんちゃん - ${emotion}`}
            sizes="(max-width: 768px) 100vw, 40vw"
            className={styles.img}
            priority
            unoptimized
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
