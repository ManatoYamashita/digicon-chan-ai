"use client";

import { useRef } from "react";
import Image from "next/image";
import {
  motion,
  useMotionValue,
  useSpring,
  type MotionStyle,
} from "framer-motion";
import styles from "@/styles/tilted-card.module.scss";

type TiltedCardProps = {
  imageSrc: string;
  altText: string;
  containerWidth?: string;
  containerHeight?: string;
  imageWidth?: number;
  imageHeight?: number;
  scaleOnHover?: number;
  rotateAmplitude?: number;
};

const springConfig = { stiffness: 260, damping: 20, mass: 0.5 };

export default function TiltedCard({
  imageSrc,
  altText,
  containerWidth = "100%",
  containerHeight = "100%",
  imageWidth = 740,
  imageHeight = 464,
  scaleOnHover = 1.05,
  rotateAmplitude = 14,
}: TiltedCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const scale = useMotionValue(1);

  const springRotateX = useSpring(rotateX, springConfig);
  const springRotateY = useSpring(rotateY, springConfig);
  const springScale = useSpring(scale, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    rotateX.set(-y * rotateAmplitude);
    rotateY.set(x * rotateAmplitude);
  };

  const handleMouseEnter = () => {
    scale.set(scaleOnHover);
  };

  const handleMouseLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
    scale.set(1);
  };

  const cardStyle: MotionStyle = {
    rotateX: springRotateX,
    rotateY: springRotateY,
    scale: springScale,
  };

  return (
    <div
      ref={ref}
      className={styles.container}
      style={{ width: containerWidth, height: containerHeight }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div className={styles.card} style={cardStyle}>
        <Image
          src={imageSrc}
          alt={altText}
          width={imageWidth}
          height={imageHeight}
          className={styles.image}
          priority
        />
      </motion.div>
    </div>
  );
}
