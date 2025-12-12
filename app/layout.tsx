import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../styles/index.scss'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: "MeCoins - MeGuild Financial System",
  description: "ระบบการเงินของ MeGuild สำหรับจัดการ MeCoins",
  icons: {
    icon: '/favicon.ico',
  },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th">
      <body className={`${inter.className} bg-gradient-to-b from-blue-100 to-purple-100`}>
        {children}
      </body>
    </html>
  )
}

