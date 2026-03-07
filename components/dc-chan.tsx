"use client";

import React, { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import styles from "@/styles/dc-chan.module.scss";
import dcchan from "@/public/images/dcchan.webp";

function DCchan() {
    const zoomLevel = 2;
    const zoomWindowSize = 200;

    const [isHovered, setIsHovered] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
    const imageRef = useRef<HTMLImageElement>(null);

    const handleMouseEnter = useCallback(() => {
        if (imageRef.current) {
            setImageSize({
                width: imageRef.current.width,
                height: imageRef.current.height,
            });
        }
        setIsHovered(true);
    }, []);

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLImageElement>) => {
        if (imageRef.current) {
          const rect = imageRef.current.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          setPosition({ x, y });
        }
    }, []);

    const handleMouseLeave = useCallback(() => {
        setIsHovered(false);
    }, []);

    return(
        <section className={styles.dcchan}>
            <Image
                src={dcchan}
                alt="dcchan"
                priority
                loading='eager'
                width={700}
                height={393}
                ref={imageRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                className={styles.image}
                onMouseEnter={handleMouseEnter}
            />

            {isHovered && imageSize.width > 0 && (
                <div
                className={styles.zoomWindow}
                style={{
                    backgroundImage: `url(${dcchan.src})`,
                    backgroundSize: `${imageSize.width * zoomLevel}px ${
                    imageSize.height * zoomLevel
                    }px`,
                    backgroundPosition: `-${position.x * zoomLevel - zoomWindowSize / 2}px -${
                    position.y * zoomLevel - zoomWindowSize / 2
                    }px`,
                }}
                />
            )}
        </section>
    );
}

export default DCchan;
