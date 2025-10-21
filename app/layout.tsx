import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../styles/index.scss'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MeCoins - ระบบเติมเครดิต',
  description: 'ระบบจัดการเครดิตออนไลน์',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th">
      <body className={`${inter.className} bg-gradient-to-t bg-purple-100`}>
        {children}
      </body>
    </html>
  )
}

