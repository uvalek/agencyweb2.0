import type { Metadata } from "next";
import { Space_Grotesk, DM_Sans } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const dmSans = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "AlekAgency | Tu Recepcionista con IA para Propiedades",
  description:
    "Sistemas de IA que atienden a tus huéspedes 24/7, responden dudas al instante y gestionan reservas mientras tú duermes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark scroll-smooth">
      <body
        className={`${spaceGrotesk.variable} ${dmSans.variable} font-body antialiased bg-[#050505] text-[#F0F0F5] overflow-x-hidden`}
      >
        {/* Aurora Background */}
        <div className="aurora-container" aria-hidden="true">
          <div className="aurora-orb aurora-orb-1" />
          <div className="aurora-orb aurora-orb-2" />
          <div className="aurora-orb aurora-orb-3" />
        </div>
        <div className="noise-overlay" aria-hidden="true" />

        {/* Meta Pixel */}
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '1491453309231157');
            fbq('track', 'PageView');
          `}
        </Script>
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=1491453309231157&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>

        {children}
      </body>
    </html>
  );
}
