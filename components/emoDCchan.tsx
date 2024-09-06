"use client";

import React from "react";
import { useEffect, useState } from "react";
import Image, { StaticImageData } from "next/image";

import normal from "/public/images/default.webp";
import undefined from "/public/images/undefined.webp";
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

    const [emotionImage, setEmotionImage] = useState<StaticImageData>(normal);

    // 受け取ったemotionの値によって表示する画像を変える
    useEffect(() => {
        console.log('emotion: ', emotion);
        if (emotion === '["普通"]') {
            setEmotionImage(normal);
        }
        else if (emotion == ('["楽"]' || '["楽"] ' || '["楽"]  ' || '["楽"]\n' || ' ["楽"]' || ' ["楽"] ' || ' ["楽"] ' || '  ["楽"]' || '  ["楽"] ' || '  ["楽"]  ' || '　["楽"]'|| '　["楽"] ' || '　["楽"]　' || '　["楽"]' || '["楽"]　' || ' ["楽"]　' || '  ["楽"]　')) {
            setEmotionImage(happy);
        } else if (emotion == ('["怒"]' || '["怒"] ' || '["怒"]  ' || '["怒"]\n' || ' ["怒"]' || ' ["怒"] ' || ' ["怒"]  ' || '  ["怒"]' || '  ["怒"] ' || '  ["怒"]  ' || '　["怒"]'|| '　["怒"] ' || '　["怒"]  ' || '　["怒"]' || '["怒"]　' || ' ["怒"]　' || '  ["怒"]　' || '　["怒"]　')) {
            setEmotionImage(angry);
        } else if (emotion == ('["哀"]' || '["哀"] ' || '["哀"]  ' || '["哀"]\n' || ' ["哀"]' || ' ["哀"] ' || ' ["哀"]  ' || '  ["哀"]' || '  ["哀"] ' || '  ["哀"]  ' || '　["哀"]'|| '　["哀"] ' || '　["哀"]  ' || '　["哀"]' || '["哀"]　' || ' ["哀"]　' || '  ["哀"]　' || '　["哀"]　')) {
            setEmotionImage(confused);
        } else if (emotion == ('["困惑"]' || '["困惑"] ' || '["困惑"]  ' || '["困惑"]\n' || ' ["困惑"]' || ' ["困惑"] ' || ' ["困惑"]  ' || '  ["困惑"]' || '  ["困惑"] ' || '  ["困惑"]  ' || '　["困惑"]'|| '　["困惑"] ' || '　["困惑"]  ' || '　["困惑"]' || '["困惑"]　' || ' ["困惑"]　' || '  ["困惑"]　' || '　["困惑"]　')) {
            setEmotionImage(confused);
        } else if (emotion == ('["照"]' || '["照"] ' || '["照"]  ' || '["照"]\n' || ' ["照"]' || ' ["照"] ' || ' ["照"]  ' || '  ["照"]' || '  ["照"] ' || '  ["照"]  ' || '　["照"]'|| '　["照"] ' || '　["照"]  ' || '　["照"]' || '["照"]　' || ' ["照"]　' || '  ["照"]　' || '　["照"]　')) {
            setEmotionImage(confused);
        }
        else {
            console.log('undefined');
            setEmotionImage(undefined);
        }

        setTimeout(() => {
            setEmotionImage(normal);
        }, 7000);
    }, [emotion]);

    const emotionMap: { [key: string]: string } = {
        '["普通"]': '（╹◡╹）（前髪が気になる）',
        '["楽"]': '(● ˃̶͈̀ロ˂̶͈́)੭ꠥ⁾⁾♪',
        '["怒"]': '( *｀ω´)',
        '["哀"]': '(T ^ T)',
        '["困惑"]': '(・∀・)',
        '["照"]': '(*≧∀≦*)',
        '': '...(｀・ω・´)',
      };

    return (
        <div className={styles.emo}>
            <section className={styles.detail}>
                <h1 className={`${styles.title} ${delaGothicOne.className}`}>
                    Let&apos;s talk with <br />
                    <span className={styles.titleSpan}>でじこんちゃんAI!!</span>
                </h1>
                <p className={styles.kaomoji}>
                    {emotionMap[emotion] || '『でじこんちゃんAIです！何でも聞いてね！』'}
                </p>
            </section>
            <Image 
                className={styles.dcChan} 
                src={emotionImage} 
                alt="emotion"
                priority
                width={700}
                height={393}
                unoptimized
            />
        </div>
    )
}
