"use client";

import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

type Props = {
  children: ReactNode;
};

export default function PageAnimations({ children }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const container = containerRef.current;
    if (!container) return;

    const r1 = container.querySelector<HTMLElement>('[data-animate="r1"]');
    const r2 = container.querySelector<HTMLElement>('[data-animate="r2"]');
    const r3 = container.querySelector<HTMLElement>('[data-animate="r3"]');
    const r4 = container.querySelector<HTMLElement>('[data-animate="r4"]');

    if (r1?.children) {
      gsap.fromTo(r1.children,
        { y: '100%' },
        {
          y: '0%',
          duration: 0.35,
          stagger: 0.12,
          ease: 'back.out(1.4)',
          delay: 0.3,
        }
      );
    }

    if (r2?.children) {
      gsap.fromTo(r2.children,
        { y: '100%', opacity: 0 },
        {
          y: '0%',
          opacity: 1,
          duration: 1,
          stagger: 0.2,
          delay: 0.55,
          ease: 'power4.inOut',
        }
      );
    }

    if (r3?.children) {
      gsap.fromTo(r3.children,
        { x: '-100%', opacity: 0 },
        {
          x: '0%',
          opacity: 1,
          duration: 0.5,
          stagger: 0.1,
          delay: 0.75,
          ease: 'power4.out',
        }
      );
    }

    if (r4?.children) {
      gsap.fromTo(r4.children,
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

  return <div ref={containerRef}>{children}</div>;
}
