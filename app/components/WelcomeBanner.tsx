'use client'

import { useEffect, useState } from 'react'
import { useApp } from '@/app/lib/context'

const greetings = ['加油💪', '你真棒🌟', '继续努力🔥', '天天进步📈', '英语达人👑']

export function WelcomeBanner({ }: { userData?: any }) {
  const { stats, settings } = useApp()
  const [greeting, setGreeting] = useState('')

  useEffect(() => {
    setGreeting(greetings[Math.floor(Math.random() * greetings.length)])
  }, [])

  return (
    <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg shadow-lg p-6 mb-6 text-white">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold mb-1">{greeting} {settings.nickname}!</h2>
          <p className="text-purple-100 text-sm">
            {stats.currentStreak > 0 ? `已连续打卡 ${stats.currentStreak} 天` : '开始你的英语学习之旅吧！'}
          </p>
        </div>
        <div className="text-5xl">✨</div>
      </div>
    </div>
  )
}
