"use client";

import React, { useState, useRef, useEffect } from 'react';
import styles from "@/styles/dc-chan.module.scss";
import dcchan_default from "@/public/images/dcchan.webp";
import dcchanMov from "@/public/images/v.mov";
import dcchanWebm from "@/public/images/v.webm";

const dcchanMovURL = `/images/v.mov`;
const dcchanWebmURL = `/images/v.webm`;

function DCchan() {
    const zoomLevel = 2;
    const zoomWindowSize = 200;

    const [isHovered, setIsHovered] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const imageRef = useRef<HTMLVideoElement>(null);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const handleMouseEnter = () => {
        setIsHovered(true);
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLVideoElement>) => {
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

    if (!isMounted) {
        return null;
    }

    return(
        <section className={styles.dcchan}>
            <video 
                playsInline 
                autoPlay 
                muted 
                ref={imageRef} 
                className={styles.image} 
                onMouseEnter={handleMouseEnter} 
                onMouseMove={handleMouseMove} 
                onMouseLeave={handleMouseLeave}
            >
                <source src={dcchanMov} type='video/mov' />
                <source src={dcchanWebm} type='video/webm' />
                <source src={dcchanMovURL} type='video/mov' />
                <source src={dcchanWebmURL} type='video/webm' />
            </video>

            {isHovered && imageRef.current && (
                <div
                className={styles.zoomWindow}
                style={{
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
