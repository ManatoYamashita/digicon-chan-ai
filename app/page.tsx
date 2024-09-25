"use client";

import { useEffect, useRef } from "react";
import dynamic from 'next/dynamic';
import Image from "next/image";
import gsap from "gsap";
import Sidebar from "@/components/sidebar";
import Card from "@/components/card";
import Music from "@/components/music";
import Toggle from "@/components/toggle";
import Sounds from "@/components/sounds";
import Hello from "@/components/hello";
import styles from './page.module.scss';
import "@/styles/globals.css";

// DCchanコンポーネントを動的にインポート
const DynamicDCchan = dynamic(() => import('@/components/dc-chan'), { ssr: false });

export default function Home() {
  const r1Ref = useRef<HTMLDivElement>(null);
  const r2Ref = useRef<HTMLDivElement>(null);
  const r3Ref = useRef<HTMLDivElement>(null);
  const r4Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (r1Ref.current?.children) {
      gsap.fromTo(r1Ref.current.children,
        { y: '100%' }, 
        {
          y: '0%',
          duration: .5,
          stagger: 0.2,
          ease: 'Circ.inOut',
          delay: 1,
        }    
      );
    }
  }, [r1Ref]);

  useEffect(() => {
    if (r2Ref.current?.children) {
      gsap.fromTo(r2Ref.current.children,
        { y: '100%', opacity: 0}, 
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
  }, [r2Ref]);

  useEffect(() => {
    if (r3Ref.current?.children) {
      gsap.fromTo(r3Ref.current.children,
        { x: '-100%', opacity: 0}, 
        {
          x: '0%',
          opacity: 1,
          duration: .5,
          stagger: 0.1,
          delay: 1.4,
          ease: 'power4.Out',
        }    
      );
    }
  }, [r3Ref]);

  useEffect(() => {
    if (r4Ref.current?.children) {
      gsap.fromTo(r4Ref.current.children,
        { y: '100%' }, 
        {
          y: '0%',
          duration: .5,
          stagger: 0.2,
          delay: 0,
          ease: 'Circ.inOut',
        }    
      );
    }
  }, [r4Ref]);

  useEffect(() => {
      const body = document.body;
      body.classList.add("body-default");

      return () => {
        body.classList.remove("body-default");
      };
  }, []);

  return (
    <>
      <section className={styles.back}>

        <div className={styles.row} ref={r1Ref}>
          <Music title="DeskTop Musics" description="Kunimaly feat:でじこんちゃん(ver0)" />
          <Card title="Graphics" subtitle="Illustration / Animation / CG / GraphicsDesign" description="Origin:あいしろ / 3D:Garnet,ほし / Design(Animation):山下マナト,shika" /> 
        </div>

        <div className={styles.row2} ref={r2Ref}>
          <div className={styles.r2_column}>
            <Toggle />
            <Image src="/images/dc-logo.webp" alt="東京都市大学 デジコン" fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className={styles.logo} />
          </div>
          <Sounds title="Voices" description="Press to listen to voices." />
        </div>

        <div className={styles.row3} ref={r3Ref}>
          <Sidebar />
          <Hello
            greets={["Hello", "こんにちは", "안녕하세요", "你好"]}  // 4つまで
            msg1="東京都市大学 デジタルコンテンツ研究会"
            msg2="公式ヴァーチャルコンシェルジュの..."
            title="でじこんちゃん"
          />
        </div>
      </section>
      
      <section className={styles.front}>
        <div ref={r4Ref}>
          <DynamicDCchan />
        </div>
      </section>
    </>
  )
}
