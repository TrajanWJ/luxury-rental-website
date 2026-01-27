import type { Metadata } from 'next'
import { Playfair_Display, Work_Sans } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { DemoProvider } from '@/components/demo-context'

import Script from 'next/script'

const playfair = Playfair_Display({ subsets: ["latin"], variable: '--font-playfair' });
const workSans = Work_Sans({ subsets: ["latin"], variable: '--font-work-sans' });

export const metadata: Metadata = {
  title: 'Luxury Rentals | Premium Home Experiences',
  description: 'Exquisite luxury rentals for discerning travelers. Curated stays in the world\'s most beautiful locations.',
  generator: 'luxury-rentals',
  icons: {
    icon: 'https://wilson-premier.com/wp-content/uploads/2023/12/WPP_Digital_RGB_logo_linen_on_charcoal.png',
    apple: 'https://wilson-premier.com/wp-content/uploads/2023/12/WPP_Digital_RGB_logo_linen_on_charcoal.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased ${playfair.variable} ${workSans.variable}`}>
        <DemoProvider>
          {children}
        </DemoProvider>
        <Analytics />
        <Script src="https://d2q3n06xhbi0am.cloudfront.net/calendar.js" strategy="afterInteractive" />
        <Script src="/hostaway-debug.js" strategy="afterInteractive" />
      </body>
    </html>
  )
}
