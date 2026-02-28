"use client";

import { useRef } from 'react';
import Greets from './greets';
import SplitText from './SplitText';
import styles from '@/styles/hello.module.scss';
import { Dela_Gothic_One } from 'next/font/google';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

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
    const phrasesRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        if (!phrasesRef.current) return;

        // フレーズのスケールアニメーション
        gsap.fromTo(phrasesRef.current.children,
            { scale: 0 },
            {
                scale: 1,
                duration: 1,
                stagger: 0.2,
                ease: 'back.out(1.7)',
            }
        );
    }, { scope: phrasesRef });

    return (
        <section className={styles.hello}>
            <div ref={phrasesRef} className={styles.phrases}>
                <Greets greets={greets} />
                <Greets greets={msg1} />
                <Greets greets={msg2} />
            </div>
            <SplitText
                text={title}
                tag="h1"
                className={`${styles.title} ${delaGothicOne.className}`}
                splitType="chars"
                from={{ y: '100%' }}
                to={{ y: '0%' }}
                duration={1}
                delay={100}
                ease="power4.inOut"
                initialDelay={1}
                useScrollTrigger={false}
                textAlign="left"
            />
            <span className={styles.desu}>&nbsp;ですっ！</span>
        </section>
    );
}
