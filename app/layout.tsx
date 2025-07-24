import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'LingoMaster - 언어 학습 플랫폼',
  description: '스마트한 언어 학습의 시작',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700">
          {children}
        </div>
      </body>
    </html>
  )
} 