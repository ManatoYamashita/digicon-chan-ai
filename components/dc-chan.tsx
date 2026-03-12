"use client";

import React, { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import styles from "@/styles/dc-chan.module.scss";
import dcchan from "@/public/images/dcchan.webp";

const ZOOM_LEVEL = 2;
const ZOOM_WINDOW_SIZE = 200;

function DCchan() {
    const [isHovered, setIsHovered] = useState(false);
    const imageSizeRef = useRef({ width: 0, height: 0 });
    const imageRef = useRef<HTMLImageElement>(null);
    const zoomRef = useRef<HTMLDivElement>(null);

    const handleMouseEnter = useCallback(() => {
        if (imageRef.current) {
            imageSizeRef.current = {
                width: imageRef.current.width,
                height: imageRef.current.height,
            };
        }
        setIsHovered(true);
    }, []);

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLImageElement>) => {
        if (!imageRef.current || !zoomRef.current) return;
        const rect = imageRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const { width, height } = imageSizeRef.current;

        const zoom = zoomRef.current.style;
        zoom.backgroundSize = `${width * ZOOM_LEVEL}px ${height * ZOOM_LEVEL}px`;
        zoom.backgroundPosition = `-${x * ZOOM_LEVEL - ZOOM_WINDOW_SIZE / 2}px -${y * ZOOM_LEVEL - ZOOM_WINDOW_SIZE / 2}px`;
    }, []);

    const handleMouseLeave = useCallback(() => {
        setIsHovered(false);
    }, []);

    return(
        <section className={styles.dcchan}>
            <Image
                src={dcchan}
                alt="でじこんちゃん - 東京都市大学デジタルコンテンツ研究会公式キャラクター"
                priority
                sizes="100vw"
                width={700}
                height={393}
                ref={imageRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                className={styles.image}
                onMouseEnter={handleMouseEnter}
            />

            {isHovered && (
                <div
                ref={zoomRef}
                className={styles.zoomWindow}
                style={{
                    backgroundImage: `url(${dcchan.src})`,
                }}
                />
            )}
        </section>
    );
}

export default DCchan;
