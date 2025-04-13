"use client";

import styles from './page.module.scss';
// import Ticket from '@/components/ticket';
import Discription from '@/components/discription';
import "@/styles/globals.css";

export default function About() {
    
    return (
        <div className={styles.about}>
            {/* <Ticket title="2024/06/04" description="under constraction" className={styles.ticket}/> */}
            <Discription
                title='"でじこんちゃん"について'
                subtitle='略歴'
                button='おしゃべりする!'
            />
        </div>
    );
}