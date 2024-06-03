"use client";

import React, { useState, useRef } from 'react';
import Image from "next/image";
import styles from "@/styles/dc-chan.module.scss";
import dcchan_default from "@/public/images/dc-chan_hoshi.png";

function DCchan() {
    const zoomLevel = 2;
    const zoomWindowSize = 200;

    const [isHovered, setIsHovered] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const imageRef = useRef<HTMLImageElement>(null);

    const handleMouseEnter = () => {
        setIsHovered(true);
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLImageElement>) => {
        if (imageRef.current) {
          const rect = imageRef.current.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          setPosition({ x, y });
        }
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
    };

    return(
        <section className={styles.dcchan}>
            <Image
                ref={imageRef}
                src={dcchan_default}
                alt="dc-chan"
                fill
                className={styles.image}
                onMouseEnter={handleMouseEnter}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                priority
                draggable={false}
            />

            {isHovered && imageRef.current && (
                <div
                className={styles.zoomWindow}
                style={{
                    // width: zoomWindowSize,
                    // height: zoomWindowSize,
                    // top: position.y - zoomWindowSize / 2,
                    backgroundImage: `url(${dcchan_default.src})`,
                    backgroundSize: `${imageRef.current.width * zoomLevel}px ${
                    imageRef.current.height * zoomLevel
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
