import React from "react";
import { useEffect, useState } from "react";
import Image, { StaticImageData } from "next/image";
import normal from "/public/images/dcchan-default.gif";
import undefined from "/public/images/dcchan-undefined.gif";
import happy from "/public/images/dcchan-ki.gif";
import angry from "/public/images/dcchan-do.gif";
import sad from "/public/images/dcchan-ai.gif";
import styles from '@/styles/emoDCchan.module.scss';

type EmotionProps = {
    emotion: string;
}

export default function EmoDCchan({ emotion }: EmotionProps) {

    const [emotionImage, setEmotionImage] = useState<StaticImageData>(normal);

    // 受け取ったemotionの値によって表示する画像を変える
    useEffect(() => {
        console.log('emotion: ', emotion);
        if (emotion === '["普通"]') {
            setEmotionImage(normal);
        }
        else if (emotion == ('["楽"]' || '["楽"] ' || '["楽"]  ' || '["楽"]\n')) {
            setEmotionImage(happy);
        } else if (emotion == ('["怒"]' || '["怒"] ' || '["怒"]  ' || '["怒"]\n')) {
            setEmotionImage(angry);
        } else if (emotion == ('["哀"]' || '["哀"] ' || '["哀"]  ' || '["哀"]\n')) {
            setEmotionImage(sad);
        } else if (emotion == ('["困惑"]' || '["困惑"] ' || '["困惑"]  ' || '["困惑"]\n')) {
            setEmotionImage(sad);
        } else if (emotion == ('["照"]' || '["照"] ' || '["照"]  ' || '["照"]\n')) {
            setEmotionImage(sad);
        }
        else {
            console.log('undefined');
            setEmotionImage(undefined);
        }

        setTimeout(() => {
            setEmotionImage(normal);
        }, 20000);
    }, [emotion]);

    return (
        <div className={styles.emo}>
            <section className={styles.detail}>
                <h1 className={styles.title}>&quot;でじこんちゃん&quot;とおしゃべりしよう！</h1>
                <p className={styles.p}>今の感情: {emotion}</p>
            </section>
            <Image 
                className={styles.dcChan} 
                src={emotionImage} 
                alt="emotion" 
                width={700}
                height={393}
            />
        </div>
    )
}
