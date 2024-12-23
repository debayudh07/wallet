import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'NexWall-et: Your Next-Gen Self-Custodial Crypto Wallet',
  description: 'Manage your crypto assets securely with NexWall-et, a cutting-edge self-custodial wallet for the next generation of blockchain enthusiasts.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
        <style>{`
          .react-beautiful-dnd-dragging {
            z-index: 1000;
          }
        `}</style>
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}

