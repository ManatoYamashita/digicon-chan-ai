"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from '../styles/menu.module.scss';

function Menu() {
    const pathname = usePathname(); // 現在のパスを取得
    const [selected, setSelected] = useState<string>('home');

    useEffect(() => {
        const currentPath = pathname?.substring(1) || 'home';
        setSelected(currentPath);
    }, [pathname]);

    // A11y: ラベル用のテキスト
    const menuLabels = {
        home: 'ホーム',
        about: 'でじこんちゃんについて',
        talk: 'おしゃべりする'
    };

    return (
        <nav className={`${styles.menu} ${styles[selected]}`} aria-label="メインナビゲーション">
            <div className={styles.menuItem}>
                <Link 
                    href="/" 
                    className={`${styles.label} ${selected === 'home' ? styles.selected : ''}`}
                    aria-label={menuLabels.home}
                    title={menuLabels.home}
                    onClick={() => setSelected('home')}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 21 20"
                        height="20"
                        width="21"
                        className={styles.icon}
                        aria-hidden="true"
                    >
                        <path
                            fill="inherit"
                            d="M18.9999 6.01002L12.4499 0.770018C11.1699 -0.249982 9.16988 -0.259982 7.89988 0.760018L1.34988 6.01002C0.409885 6.76002 -0.160115 8.26002 0.0398848 9.44002L1.29988 16.98C1.58988 18.67 3.15988 20 4.86988 20H15.4699C17.1599 20 18.7599 18.64 19.0499 16.97L20.3099 9.43002C20.4899 8.26002 19.9199 6.76002 18.9999 6.01002ZM10.9199 16C10.9199 16.41 10.5799 16.75 10.1699 16.75C9.75988 16.75 9.41988 16.41 9.41988 16V13C9.41988 12.59 9.75988 12.25 10.1699 12.25C10.5799 12.25 10.9199 12.59 10.9199 13V16Z"
                        ></path>
                    </svg>
                </Link>
            </div>

            <div className={styles.menuItem}>
                <Link 
                    href="/about" 
                    className={`${styles.label} ${selected === 'about' ? styles.selected : ''}`}
                    aria-label={menuLabels.about}
                    title={menuLabels.about}
                    onClick={() => setSelected('about')}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 512 512"
                        height="20"
                        width="21"
                        className={styles.icon}
                        aria-hidden="true"
                    >
                        <path fill="inherit" d="M47.6 300.4L228.3 469.1c7.5 7 17.4 10.9 27.7 10.9s20.2-3.9 27.7-10.9L464.4 300.4c30.4-28.3 47.6-68 47.6-109.5v-5.8c0-69.9-50.5-129.5-119.4-141C347 36.5 300.6 51.4 268 84L256 96 244 84c-32.6-32.6-79-47.5-124.6-39.9C50.5 55.6 0 115.2 0 185.1v5.8c0 41.5 17.2 81.2 47.6 109.5z"/>
                    </svg>
                </Link>
            </div>

            <div className={styles.menuItem}>
                <Link 
                    href="/talk" 
                    className={`${styles.label} ${selected === 'talk' ? styles.selected : ''}`}
                    aria-label={menuLabels.talk}
                    title={menuLabels.talk}
                    onClick={() => setSelected('talk')}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 512 512"
                        height="20"
                        width="21"
                        className={styles.icon}
                        aria-hidden="true"
                    >
                        <path fill="inherit" d="M512 240c0 114.9-114.6 208-256 208c-37.1 0-72.3-6.4-104.1-17.9c-11.9 8.7-31.3 20.6-54.3 30.6C73.6 471.1 44.7 480 16 480c-6.5 0-12.3-3.9-14.8-9.9c-2.5-6-1.1-12.8 3.4-17.4l0 0 0 0 0 0 0 0 .3-.3c.3-.3 .7-.7 1.3-1.4c1.1-1.2 2.8-3.1 4.9-5.7c4.1-5 9.6-12.4 15.2-21.6c10-16.6 19.5-38.4 21.4-62.9C17.7 326.8 0 285.1 0 240C0 125.1 114.6 32 256 32s256 93.1 256 208z"/>
                    </svg>
                </Link>
            </div>
        </nav>
    );
}

export default Menu;
