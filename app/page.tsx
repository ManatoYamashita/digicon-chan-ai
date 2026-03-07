"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Sidebar from "@/components/sidebar";
import Card from "@/components/card";
import Music from "@/components/music";
import Toggle from "@/components/toggle";
import Sounds from "@/components/sounds";
import Hello from "@/components/hello";
import DCchan from "@/components/dc-chan";
import styles from './page.module.scss';
import "@/styles/globals.css";

gsap.registerPlugin(useGSAP);

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const r1Ref = useRef<HTMLDivElement>(null);
  const r2Ref = useRef<HTMLDivElement>(null);
  const r3Ref = useRef<HTMLDivElement>(null);
  const r4Ref = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (r1Ref.current?.children) {
      gsap.fromTo(r1Ref.current.children,
        { y: '100%' },
        {
          y: '0%',
          duration: 0.5,
          stagger: 0.2,
          ease: 'circ.inOut',
          delay: 1,
        }
      );
    }

    if (r2Ref.current?.children) {
      gsap.fromTo(r2Ref.current.children,
        { y: '100%', opacity: 0 },
        {
          y: '0%',
          opacity: 1,
          duration: 1,
          stagger: 0.2,
          delay: 1.2,
          ease: 'power4.inOut',
        }
      );
    }

    if (r3Ref.current?.children) {
      gsap.fromTo(r3Ref.current.children,
        { x: '-100%', opacity: 0 },
        {
          x: '0%',
          opacity: 1,
          duration: 0.5,
          stagger: 0.1,
          delay: 1.4,
          ease: 'power4.out',
        }
      );
    }

    if (r4Ref.current?.children) {
      gsap.fromTo(r4Ref.current.children,
        { y: '100%' },
        {
          y: '0%',
          duration: 0.5,
          stagger: 0.2,
          delay: 0,
          ease: 'circ.inOut',
        }
      );
    }
  }, { scope: containerRef });

  useEffect(() => {
    document.body.classList.add("body-default");
    return () => {
      document.body.classList.remove("body-default");
    };
  }, []);

  return (
    <div ref={containerRef}>
      <section className={styles.back}>

        <div className={styles.row} ref={r1Ref}>
          <Music title="DeskTop Musics" description="Kunimaly feat:でじこんちゃん(ver0)" />
          <Card title="Graphics" subtitle="Illu/Anime/Design: 山下マナト" description="WebDesignはこちらのtweetを元にしています。" />
        </div>

        <div className={styles.row2} ref={r2Ref}>
          <div className={styles.r2_column}>
            <Toggle />
            <Image
              src="/images/dc-logo.webp"
              alt="都市大 デジコン"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className={styles.logo}
            />
          </div>
          <Sounds title="DC-chan" description="Press to listen to voices." />
        </div>

        <div className={styles.row3} ref={r3Ref}>
          <Sidebar />
          <Hello
            greets={["Hello", "こんにちは", "안녕하세요", "你好"]}
            msg1="東京都市大学 デジタルコンテンツ研究会"
            msg2="公式ヴァーチャルコンシェルジュの..."
            title="でじこんちゃん"
          />
        </div>
      </section>

      <section className={styles.front}>
        <div ref={r4Ref}>
          <DCchan />
        </div>
      </section>
    </div>
  );
}
