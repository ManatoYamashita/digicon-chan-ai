// app/layout.tsx
"use client";

import '../styles/globals.css';
import Menu from '@/components/menu';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const [bodyClass, setBodyClass] = useState('body-default');

  useEffect(() => {
    const getBodyClass = () => {
      switch (pathname) {
        case '/':
          return 'body-home';
        case '/about':
          return 'body-about';
        case '/talk':
          return 'body-talk';
        default:
          return 'body-default';
      }
    };

    setBodyClass(getBodyClass());
  }, [pathname]);

  return (
    <html lang="en">
      <head>
        <title>でじこんちゃん HPB 2024</title>
      </head>
      <body className={bodyClass}>
        <main>{children}</main>
        <nav className='nav'>
          <Menu />
        </nav>
        <footer>© 2024 でじこんちゃん HPB / Designed by ヤマシタマナト</footer>
      </body>
    </html>
  );
};

export default RootLayout;
