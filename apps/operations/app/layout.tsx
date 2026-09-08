import { Geist, Newsreader } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });
const newsreader = Newsreader({ subsets: ['latin'], variable: '--font-display' });

const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem('oc-theme:v1')||localStorage.getItem('oc-theme');if(t!=='light'&&t!=='dark'){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}document.documentElement.dataset.theme=t;}catch(e){document.documentElement.dataset.theme='light';}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} ${newsreader.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body>
        {children}
        <Toaster richColors position="top-right" closeButton />
      </body>
    </html>
  );
}
