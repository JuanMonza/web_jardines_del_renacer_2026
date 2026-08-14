import '@/styles/globals.css';
import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import Script from 'next/script';
import AppShell from '@/components/layout/AppShell';

const GOOGLE_TAG_MANAGER_ID = 'GTM-THR7J2P9';

export const metadata: Metadata = {
  title: 'Jardines del Renacer - Dignidad y Paz Eterna',
  description:
    'Servicios funerarios y de previsión con dignidad, respeto y paz eterna para tus seres queridos. Planes personalizados, recorrido 360° y homenajes digitales.',
  icons: {
    icon: '/logos_jr_favico.png',
  },
};

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'], // Regular, Medium, SemiBold, Bold, ExtraBold
  variable: '--font-montserrat',
  display: 'swap',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${montserrat.variable}`}>
      <head>
        <Script id="google-tag-manager" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GOOGLE_TAG_MANAGER_ID}');`}
        </Script>
      </head>
      <body className="antialiased min-h-screen flex flex-col font-sans">
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GOOGLE_TAG_MANAGER_ID}`}
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
            title="Google Tag Manager"
          />
        </noscript>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
