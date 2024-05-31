"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '../styles/menu.module.scss';

function Menu() {
    const [selected, setSelected] = useState<string>('home');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const currentPath = window.location.pathname.substring(1);
            setSelected(currentPath || 'home');
        }
    }, []);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSelected(event.target.id);
    };

    return (
        <section className={styles.menu}>
            <Link href="/" passHref>
                <label
                    title="home"
                    htmlFor="home"
                    className={`${styles.label} ${selected === 'home' ? styles.selected : ''}`}
                    id="homeLabel"
                    onClick={() => setSelected('home')}
                >
                    <input
                        id="home"
                        name="page"
                        type="radio"
                        aria-label="homeLabel"
                        onChange={handleChange}
                        checked={selected === 'home'}
                    />
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 21 20"
                        height="20"
                        width="21"
                        className={styles.icon}
                    >
                        <path
                            fill="inherit"
                            d="M18.9999 6.01002L12.4499 0.770018C11.1699 -0.249982 9.16988 -0.259982 7.89988 0.760018L1.34988 6.01002C0.409885 6.76002 -0.160115 8.26002 0.0398848 9.44002L1.29988 16.98C1.58988 18.67 3.15988 20 4.86988 20H15.4699C17.1599 20 18.7599 18.64 19.0499 16.97L20.3099 9.43002C20.4899 8.26002 19.9199 6.76002 18.9999 6.01002ZM10.9199 16C10.9199 16.41 10.5799 16.75 10.1699 16.75C9.75988 16.75 9.41988 16.41 9.41988 16V13C9.41988 12.59 9.75988 12.25 10.1699 12.25C10.5799 12.25 10.9199 12.59 10.9199 13V16Z"
                        ></path>
                    </svg>
                </label>
            </Link>

            <Link href="/about" passHref>
                <label
                    title="heart"
                    htmlFor="heart"
                    className={`${styles.label} ${selected === 'heart' ? styles.selected : ''}`}
                    id="heartLabel"
                    onClick={() => setSelected('heart')}
                >
                    <input
                        id="heart"
                        name="page"
                        type="radio"
                        aria-label="heartLabel"
                        onChange={handleChange}
                        checked={selected === 'heart'}
                    />
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 512 512"
                        height="20"
                        width="21"
                        className={styles.icon}
                    >
                        <path fill="inherit" d="M47.6 300.4L228.3 469.1c7.5 7 17.4 10.9 27.7 10.9s20.2-3.9 27.7-10.9L464.4 300.4c30.4-28.3 47.6-68 47.6-109.5v-5.8c0-69.9-50.5-129.5-119.4-141C347 36.5 300.6 51.4 268 84L256 96 244 84c-32.6-32.6-79-47.5-124.6-39.9C50.5 55.6 0 115.2 0 185.1v5.8c0 41.5 17.2 81.2 47.6 109.5z"/>
                    </svg>
                </label>
            </Link>

            <Link href="/talk" passHref>
                <label
                    title="talk"
                    htmlFor="talk"
                    className={`${styles.label} ${selected === 'talk' ? styles.selected : ''}`}
                    id="talkLabel"
                    onClick={() => setSelected('talk')}
                >
                    <input
                        id="talk"
                        name="page"
                        type="radio"
                        aria-label="talkLabel"
                        onChange={handleChange}
                        checked={selected === 'talk'}
                    />
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 512 512"
                        height="20"
                        width="21"
                        className={styles.icon}
                    >
                        <path fill="inherit" d="M512 240c0 114.9-114.6 208-256 208c-37.1 0-72.3-6.4-104.1-17.9c-11.9 8.7-31.3 20.6-54.3 30.6C73.6 471.1 44.7 480 16 480c-6.5 0-12.3-3.9-14.8-9.9c-2.5-6-1.1-12.8 3.4-17.4l0 0 0 0 0 0 0 0 .3-.3c.3-.3 .7-.7 1.3-1.4c1.1-1.2 2.8-3.1 4.9-5.7c4.1-5 9.6-12.4 15.2-21.6c10-16.6 19.5-38.4 21.4-62.9C17.7 326.8 0 285.1 0 240C0 125.1 114.6 32 256 32s256 93.1 256 208z"/>
                    </svg>
                </label>
            </Link>

            {/* <Link href="https://tcu-dc.net" passHref>
                <label
                    title="dc"
                    htmlFor="dc"
                    className={`${styles.label} ${selected === 'dc' ? styles.selected : ''}`}
                    id="dcLabel"
                    onClick={() => setSelected('dc')}
                >
                    <input
                        id="dc"
                        name="page"
                        type="radio"
                        aria-label="dcLabel"
                        onChange={handleChange}
                        checked={selected === 'dc'}
                    />
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 512 512"
                        height="25"
                        width="26"
                        className={`${styles.dcicon} ${styles.icon}`}
                    >
                        <g fill="inherit" id="b">
                            <g id="c">
                                <g>
                                    <g id="d">
                                        <g>
                                            <g id="e">
                                                <g id="f">
                                                    <g id="g">
                                                        <g>
                                                            <path id="h" className="st0" d="M258.6,106.6l41.7-41.5c2.9-2.9,7.6-2.9,10.5,0l41.5,41.7c2.9,2.9,2.9,7.6,0,10.5l-41.7,41.5
                                                                c-2.9,2.9-7.6,2.9-10.5,0l-41.5-41.7C255.7,114.2,255.7,109.5,258.6,106.6z"/>
                                                            <path id="i" className="st0" d="M203.3,161.8l41.7-41.5c2.9-2.9,7.6-2.9,10.5,0L297,162c2.9,2.9,2.9,7.6,0,10.5L255.3,214
                                                                c-2.9,2.9-7.6,2.9-10.5,0l-41.5-41.7C200.4,169.4,200.4,164.7,203.3,161.8z"/>
                                                            <path id="j" className="st1" d="M258.4,217.1l41.7-41.5c2.9-2.9,7.6-2.9,10.5,0l41.5,41.7c2.9,2.9,2.9,7.6,0,10.5l-41.7,41.6
                                                                c-2.9,2.9-7.6,2.9-10.5,0l-41.5-41.7C255.5,224.7,255.5,220,258.4,217.1z"/>
                                                            <path id="k" className="st0" d="M148,216.9l41.7-41.5c2.9-2.9,7.6-2.9,10.5,0l41.5,41.7c2.9,2.9,2.9,7.6,0,10.5L200,269.1
                                                                c-2.9,2.9-7.6,2.9-10.5,0L148,227.4C145,224.5,145,219.8,148,216.9z"/>
                                                            <path id="l" className="st0" d="M92.6,272l41.7-41.5c2.9-2.9,7.6-2.9,10.5,0l41.5,41.7c2.9,2.9,2.9,7.6,0,10.5l-41.7,41.5
                                                                c-2.9,2.9-7.6,2.9-10.5,0l-41.5-41.7C89.6,279.6,89.7,274.9,92.6,272z"/>
                                                            <path id="m" className="st0" d="M92.8,161.5l41.7-41.5c2.9-2.9,7.6-2.9,10.5,0l41.5,41.7c2.9,2.9,2.9,7.6,0,10.5l-41.7,41.5
                                                                c-2.9,2.9-7.6,2.9-10.5,0L92.8,172C89.9,169.1,89.9,164.4,92.8,161.5z"/>
                                                            <path id="n" className="st1" d="M202.8,382.7l41.7-41.5c2.9-2.9,7.6-2.9,10.5,0l41.5,41.7c2.9,2.9,2.9,7.6,0,10.5l-41.7,41.5
                                                                c-2.9,2.9-7.6,2.9-10.5,0l-41.5-41.7C199.9,390.3,199.9,385.6,202.8,382.7z"/>
                                                            <path id="o" className="st1" d="M368.9,217.3l41.7-41.5c2.9-2.9,7.6-2.9,10.5,0l41.5,41.7c2.9,2.9,2.9,7.6,0,10.5l-41.7,41.5
                                                                c-2.9,2.9-7.6,2.9-10.5,0l-41.5-41.7C365.9,224.9,366,220.2,368.9,217.3z"/>
                                                            <path id="p" className="st1" d="M203,272.2l41.7-41.5c2.9-2.9,7.6-2.9,10.5,0l41.5,41.7c2.9,2.9,2.9,7.6,0,10.5L255,324.4
                                                                c-2.9,2.9-7.6,2.9-10.5,0L203,282.7C200.1,279.8,200.1,275.1,203,272.2z"/>
                                                        </g>
                                                    </g>
                                                </g>
                                            </g>
                                            <path id="q" className="st0" d="M37.5,216.9l41.7-41.5c2.9-2.9,7.6-2.9,10.5,0l41.5,41.7c2.9,2.9,2.9,7.6,0,10.5l-41.7,41.5
                                                c-2.9,2.9-7.6,2.9-10.5,0l-41.5-41.7C34.5,224.5,34.5,219.8,37.5,216.9z"/>
                                        </g>
                                    </g>
                                </g>
                            </g>
                        </g>
                    </svg>
                </label>
            </Link> */}
        </section>
    );
}

export default Menu;
