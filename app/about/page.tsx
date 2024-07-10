"use client";

import { useEffect } from 'react';
import styles from './page.module.scss';
// import Ticket from '@/components/ticket';
import LikeLP from '@/components/likeLP';
import "@/styles/globals.css";

export default function About() {

    useEffect(() => {
        const body = document.body;
        body.classList.add("body-about");
    
        return () => {
          body.classList.remove("body-about");
        };
    }, []);
    
    return (
        <>
            <div className={styles.about}>
                {/* <Ticket title="2024/06/04" description="under constraction" className={styles.ticket}/> */}
                <LikeLP
                    title='"でじこんちゃん"について'
                    subtitle='About DC-chan'
                    button='おしゃべりする'
                />
            </div>
        </>
    );
}