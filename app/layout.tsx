import type { Metadata, Viewport } from 'next'
import './globals.css'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export const metadata: Metadata = {
  title: '天天英语 - 儿童英语学习',
  description: '天天英语，帮助儿童每天坚持学习英语，记录学习进度，赢取成就徽章',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <head>
        <meta charSet="utf-8" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="theme-color" content="#FF6B6B" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 180 180'><rect fill='%23FF6B6B' width='180' height='180'/><text x='50%' y='50%' font-size='100' font-family='Arial' fill='white' text-anchor='middle' dominant-baseline='central'>✨</text></svg>" />
      </head>
      <body className="bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 min-h-screen">
        <div className="min-h-screen">
          {children}
        </div>
      </body>
    </html>
  )
}
