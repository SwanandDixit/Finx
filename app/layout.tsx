import type { Metadata } from 'next'
import { Space_Grotesk, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'FINX — Learn Money the Hard Way',
  description: 'Real market simulations. Real historical data. Zero real risk. A simulation-driven financial intelligence platform for young Indians.',
  keywords: ['finance', 'simulation', 'investment', 'trading', 'India', 'stocks', 'crypto', 'mutual funds'],
  openGraph: {
    title: 'FINX — Learn Money the Hard Way',
    description: 'Real market simulations. Real historical data. Zero real risk.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${jetbrainsMono.variable}`}>
      <body className="font-heading antialiased">
        {children}
      </body>
    </html>
  )
}
