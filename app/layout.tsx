import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

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
      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
