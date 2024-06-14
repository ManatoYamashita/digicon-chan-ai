"use client";

import { useEffect, useRef } from "react";
import dynamic from 'next/dynamic';
import Image from "next/image";
import gsap from "gsap";
import Sidebar from "@/components/sidebar";
import Card from "@/components/card";
import Music from "@/components/music";
import Toggle from "@/components/toggle";
import Who from "@/components/who";
import Hello from "@/components/hello";
import styles from './page.module.scss';

// DCchanコンポーネントを動的にインポート
const DynamicDCchan = dynamic(() => import('@/components/dc-chan'), { ssr: false });

export default function Home() {
  const r1Ref = useRef<HTMLDivElement>(null);
  const r2Ref = useRef<HTMLDivElement>(null);
  const r3Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (r1Ref.current?.children) {
      gsap.fromTo(r1Ref.current.children,
        { y: '100%' }, 
        {
          y: '0%',
          duration: .5,
          stagger: 0.2,
          ease: 'Circ.inOut',
          delay: 2.7,
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
          delay: 3,
          ease: 'power4.inOut',
        }    
      );
    }
  }, [r2Ref]);

  useEffect(() => {
    if (r3Ref.current?.children) {
      gsap.fromTo(r3Ref.current.children,
        { x: '-100%' }, 
        {
          x: '0%',
          duration: .5,
          stagger: 0.1,
          delay: 3.2,
          ease: 'power4.Out',
        }    
      );
    }
  }, [r3Ref]);

  return (
    <>
      <section className={styles.back}>
        <div className={styles.row} ref={r1Ref}>
          <Music title="DeskTop Musics" description="でじこんちゃん" />
          <Card title="Graphics" subtitle="Illustration / Animation / CG / GraphicsDesign" description="Origin:あいしろ / 3D:Garnet,ほし / Design(Animation):山下マナト,shika" /> 
        </div>
        <div className={styles.row2} ref={r2Ref}>
          <div className={styles.r2_column}>
            <Toggle />
            <Image src="/images/dc-logo.webp" alt="東京都市大学 デジコン" fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className={styles.logo} />
          </div>
          <Who title="でじこんちゃん" description="東京都市大学 デジタルコンテンツ研究会" />
        </div>
        <div className={styles.row3} ref={r3Ref}>
          <Sidebar />
          <Hello
            greets={["hello", "こんにちは", "안녕하세요", "你好"]}  // 4つまで
            msg1="東京都市大学 デジタルコンテンツ研究会"
            msg2="Happy Birthday to you!"
            title="でじこんちゃん HPB!"
          />
        </div>
      </section>
      
      <section className={styles.front}>
        <DynamicDCchan />
      </section>
    </>
  )
}
