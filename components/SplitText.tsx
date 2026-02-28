"use client";

import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText as GSAPSplitText } from 'gsap/SplitText';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, GSAPSplitText, useGSAP);

export interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  ease?: string | ((t: number) => number);
  splitType?: 'chars' | 'words' | 'lines' | 'words, chars';
  from?: gsap.TweenVars;
  to?: gsap.TweenVars;
  threshold?: number;
  rootMargin?: string;
  tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span';
  textAlign?: React.CSSProperties['textAlign'];
  onLetterAnimationComplete?: () => void;
  initialDelay?: number;
  useScrollTrigger?: boolean;
}

const SplitText: React.FC<SplitTextProps> = ({
  text,
  className,
  delay = 100,
  duration = 0.6,
  ease = 'power3.out',
  splitType = 'chars',
  from = { y: '100%', opacity: 0 },
  to = { y: '0%', opacity: 1 },
  threshold = 0.1,
  rootMargin = '-100px',
  tag: Tag = 'p',
  textAlign = 'center',
  onLetterAnimationComplete,
  initialDelay = 0,
  useScrollTrigger = true,
}) => {
  const containerRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    const el = containerRef.current;
    if (!el) return;

    const split = new GSAPSplitText(el, {
      type: splitType,
      charsClass: 'split-char',
      wordsClass: 'split-word',
      linesClass: 'split-line',
    });

    // splitType に応じてアニメーション対象要素を選択
    let targets: Element[];
    if (splitType === 'chars') {
      targets = split.chars;
    } else if (splitType === 'words') {
      targets = split.words;
    } else if (splitType === 'lines') {
      targets = split.lines;
    } else {
      targets = split.chars;
    }

    // overflow hidden を親に設定してクリッピング
    gsap.set(el, { overflow: 'hidden' });

    const tweenVars: gsap.TweenVars = {
      ...to,
      duration,
      stagger: delay / 1000,
      ease,
      onComplete: () => {
        if (onLetterAnimationComplete) onLetterAnimationComplete();
      },
    };

    if (useScrollTrigger) {
      // ScrollTrigger でスクロール連動アニメーション
      gsap.fromTo(targets, from, {
        ...tweenVars,
        scrollTrigger: {
          trigger: el,
          start: `top bottom${rootMargin}`,
          toggleActions: 'play none none none',
        },
      });
    } else {
      // スクロールトリガーなし（ページ上部の要素向け）
      gsap.fromTo(targets, from, {
        ...tweenVars,
        delay: initialDelay,
      });
    }

    return () => {
      split.revert();
    };
  }, { scope: containerRef, dependencies: [text] });

  return (
    <Tag
      ref={containerRef as React.RefObject<never>}
      className={className}
      style={{ textAlign }}
    >
      {text}
    </Tag>
  );
};

export default SplitText;
