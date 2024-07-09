import React from "react";
import { useEffect, useState } from "react";
import Image, { StaticImageData } from "next/image";
import normal from "/public/images/dcchan-default.gif";
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
        if (emotion == '["喜"]') {
            setEmotionImage(happy);
        } else if (emotion === '["怒"]') {
            setEmotionImage(angry);
        } else if (emotion === '["哀"]') {
            setEmotionImage(sad);
        } else if (emotion == '["楽"]') {
            setEmotionImage(happy);
        } else if (emotion === '["驚"]') {
            setEmotionImage(sad);
        } else if (emotion === '["照"]') {
            setEmotionImage(sad);
        }
        else {
            console.log('normal');
            setEmotionImage(normal);
        }
    }, [emotion]);

    return (
        <div className={styles.emo}>
            <section className={styles.detail}>
                <h1 className={styles.title}>Talk with でじこんちゃん!</h1>
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
