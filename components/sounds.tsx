import Image from "next/image";
import styles from"@/styles/sounds.module.scss";
import ImgSrc from "@/public/images/dcchan-icon.webp";
import { useState } from "react";

type Props = {
    title: string,
    description: string
}

function Sounds({title, description}: Props) {

    const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

    const playSound = (soundFile: string) => {
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      }
      const newAudio = new Audio(soundFile);
      setCurrentAudio(newAudio);
      newAudio.play().catch(error => console.error("Failed to play sound:", error));
    };

    return (
        <div className={styles.sounds}>
            <div className={styles.image_container}>
                <Image
                    src={ImgSrc} 
                    className={styles.image}
                    alt="でじこんちゃん"
                    unoptimized
                    fill
                    sizes="(max-width: 480px) 30vw, (max-width: 1000px) 10vw"
                />
            </div>
            <section className={styles.details}>
                <div className={styles.title}>
                    <span>{ title }</span>
                </div>
                <div className={styles.size}>
                    <span>{ description }</span>
                </div>
                <div className={styles.action}>
                    <div className={styles.btnarea}>
                        <button type="button" className={styles.button} onClick={() => playSound('/sounds/v1.mp3')}>ver1.0</button>
                        <button type="button" className={styles.button} onClick={() => playSound('/sounds/v2.mp3')}>ver2.0</button>
                        <button type="button" className={styles.button} onClick={() => playSound('/sounds/v3.mp3')}>ver3.0</button>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Sounds;