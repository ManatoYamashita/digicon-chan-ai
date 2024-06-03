"use client";

import { useEffect, useRef } from 'react';
import Greets from './greets';
import styles from '@/styles/hello.module.scss';
import { Dela_Gothic_One } from 'next/font/google';
import gsap from 'gsap';

type Props = {
    greets: string[];
    msg1: string;
    msg2: string;
    title: string;
}

const delaGothicOne = Dela_Gothic_One({
    weight: '400',
    style: 'normal',
    subsets: ['latin'],
    display: 'swap',
});

export default function Hello({ greets, msg1, msg2, title }: Props) {
    const titleRef = useRef<HTMLHeadingElement>(null);
    const phrasesRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!titleRef.current || !phrasesRef.current) return;
        const text = titleRef.current.textContent || '';
        titleRef.current.textContent = '';

        // 一文字ごとにspanタグで囲む
        text.split('').forEach(char => {
            const span = document.createElement('span');
            span.textContent = char;
            titleRef.current?.appendChild(span);
        });

        // titleのアニメーション
        gsap.fromTo(Array.from(titleRef.current.children),

            { y: '100%' },  // 初期位置を指定
            { 
                y: '0%',  // 最終位置を指定
                duration: 1,
                stagger: 0.1,
                delay: 1,
                ease: 'Power4.easeInOut',
            }
        );

        // pharesesのアニメーション
        gsap.fromTo(phrasesRef.current.children,
            { scale: 0 },
            {
                scale: 1,
                duration: 1,
                stagger: 0.2,
                ease: 'back.out(1.7)',
            }    
        );
    }, [title]);

    return (
        <section className={styles.hello}>
            <div ref={phrasesRef} className={styles.phrases}>
                <Greets greets={greets} />
                <Greets greets={msg1} />
                <Greets greets={msg2} />
            </div>
            <h1 
                ref={titleRef}
                className={`${styles.title} ${delaGothicOne.className}`}
            >
                {title}
            </h1>
            <span className={styles.desu}>&nbsp;ですっ！</span>
        </section>
    );
}
