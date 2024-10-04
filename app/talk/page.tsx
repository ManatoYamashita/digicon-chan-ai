"use client";

import React, { useState } from 'react';
import Chat from "@/components/chat"
import EmoDCchan from "@/components/emoDCchan"
import styles from './page.module.scss';
import "@/styles/globals.css";

export default function Talk() {

    const [emotion, setEmotion] = useState<string>('普通');
      
    return (
        <div className={styles.talk}>
            <section>
                <EmoDCchan emotion={emotion} />
            </section>
            <section className={styles.chatSection}>
                <Chat setEmotion={setEmotion} />
            </section>
        </div>
    )
}