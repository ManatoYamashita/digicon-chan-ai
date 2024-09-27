"use client";

import React from "react";
import Image, { StaticImageData } from "next/image";

import normal from "/public/images/default.webp";
import noEmotion from "/public/images/undefined.webp";
import happy from "/public/images/happy.webp";
import angry from "/public/images/angry.webp";
import confused from "/public/images/confuse.webp";
import styles from '@/styles/emoDCchan.module.scss';
import { Dela_Gothic_One } from 'next/font/google';

type EmotionProps = {
    emotion: string;
}

const delaGothicOne = Dela_Gothic_One({
    weight: '400',
    style: 'normal',
    subsets: ['latin'],
    display: 'swap',
});

export default function EmoDCchan({ emotion }: EmotionProps) {
    // 余分な空白を削除
    const trimmedEmotion = emotion.trim();

    // emotionに対応する画像と顔文字をマッピング
    const emotionAssets: { [key: string]: { image: StaticImageData; kaomoji: string; } } = {
        '普通': {
            image: normal,
            kaomoji: '『でじこんちゃんAIです！何でも聞いてね！』',
        },
        '楽': {
            image: happy,
            kaomoji: '(● ˃̶͈̀ロ˂̶͈́)੭ꠥ⁾⁾♪',
        },
        '怒': {
            image: angry,
            kaomoji: '( *｀ω´)',
        },
        '哀': {
            image: confused,
            kaomoji: '(T ^ T)',
        },
        '困惑': {
            image: confused,
            kaomoji: '(・∀・)',
        },
        '照': {
            image: confused,
            kaomoji: '(*≧∀≦*)',
        },
    };

    // emotionに対応する画像と顔文字を取得、なければデフォルトを使用
    const { image: emotionImage, kaomoji } = emotionAssets[trimmedEmotion] || {
        image: noEmotion,
        kaomoji: '...!!?',
    };

    return (
        <div className={styles.emo}>
            <section className={styles.detail}>
                <h1 className={`${styles.title} ${delaGothicOne.className}`}>
                    Let&apos;s talk with <br />
                    <span className={styles.titleSpan}>でじこんちゃんAI!!</span>
                </h1>
                <p className={styles.kaomoji}>
                    {kaomoji}
                </p>
            </section>
            <Image
                className={styles.dcChan}
                src={emotionImage}
                alt="でじこんちゃんAIのアニメーション"
                priority
                width={700}
                height={393}
                unoptimized
            />
        </div>
    );
}
