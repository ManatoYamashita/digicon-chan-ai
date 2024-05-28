// app/layout.tsx

import '../styles/globals.css';
import Menu from '@/components/menu';

const RootLayout = ({ children }: { children: React.ReactNode }) => {

  return (
    <html lang="en">
      <head>
        <title>My Next.js 14 App</title>
      </head>
      <body>
        <main>{children}</main>
        <nav className='nav'>
            <Menu />
        </nav>
        {/* <footer>© 2024 My Next.js 14 App</footer> */}
      </body>
    </html>
  );
};

export default RootLayout;
