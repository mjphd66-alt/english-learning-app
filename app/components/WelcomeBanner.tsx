'use client'

import { useState, useEffect } from 'react'
import { UserData } from '@/app/lib/types'

interface WelcomeBannerProps {
  userData: UserData | null
}

export function WelcomeBanner({ userData }: WelcomeBannerProps) {
  const [challenge, setChallenge] = useState('英语可以这样学，轻松又有趣！')

  useEffect(() => {
    const challenges = [
      '今天学一个新单词吧！',
      '你可以学多个分类呢！',
      '坚持打卡，你就是小学霸！',
      '英语可以这样学，轻松又有趣！',
      '每天进步一点点，就是最大的成功！'
    ]
    setChallenge(challenges[Math.floor(Math.random() * challenges.length)])
  }, [])

  const getTimeGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return '早上好'
    if (hour < 18) return '下午好'
    return '晚上好'
  }

  return (
    <div className="bg-gradient-to-r from-primary via-pink-500 to-purple-500 text-white rounded-lg shadow-lg p-8 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold">{getTimeGreeting()}，小朋友！</h1>
        <div className="text-5xl animate-bounce">👋</div>
      </div>
      
      <div className="bg-white bg-opacity-20 rounded-lg p-4 backdrop-blur">
        <p className="text-lg mb-2">
          {userData?.currentStreak ? (
            <>
              🔥 你已经连续打卡 <span className="font-bold text-2xl">{userData.currentStreak}</span> 天了！
            </>
          ) : (
            '📚 今天开始打卡吧，让我们一起学英语！'
          )}
        </p>
        <p className="text-sm opacity-90">
          {challenge}
        </p>
        {userData && (
          <p className="text-xs opacity-75 mt-2">
            今天已学习 {userData.totalLearningMinutes % 100} 分钟
          </p>
        )}
      </div>
    </div>
  )
}
