'use client'

import { useState, useEffect } from 'react'
import { UserData } from '@/app/lib/types'
import { getUserData } from '@/app/lib/storage'

export function UserProfile() {
  const [userData, setUserData] = useState<UserData | null>(null)

  useEffect(() => {
    setUserData(getUserData())
  }, [])

  if (!userData) return null

  const hours = Math.floor(userData.totalLearningMinutes / 60)
  const minutes = userData.totalLearningMinutes % 60

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">👋 天天英语</h2>
          <p className="text-gray-600">用户ID: {userData.userId.slice(0, 8)}</p>
        </div>
        <div className="text-4xl">🌟</div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-red-100 to-red-200 rounded-lg p-4">
          <div className="text-sm text-gray-600">打卡天数</div>
          <div className="text-3xl font-bold text-red-600">{userData.totalCheckIns}</div>
        </div>

        <div className="bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg p-4">
          <div className="text-sm text-gray-600">连续打卡</div>
          <div className="text-3xl font-bold text-orange-600">
            {userData.currentStreak}
            <span className="text-lg">天</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg p-4">
          <div className="text-sm text-gray-600">学习时长</div>
          <div className="text-3xl font-bold text-blue-600">
            {hours > 0 ? `${hours}h${minutes}m` : `${userData.totalLearningMinutes}m`}
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-lg p-4">
          <div className="text-sm text-gray-600">学习分类</div>
          <div className="text-3xl font-bold text-green-600">{userData.visitedCategories.size}</div>
        </div>
      </div>

      {userData.longestStreak > 0 && userData.longestStreak > userData.currentStreak && (
        <div className="mt-4 p-4 bg-purple-50 border-2 border-purple-200 rounded-lg">
          <p className="text-sm text-gray-600">最长连续纪录</p>
          <p className="text-2xl font-bold text-purple-600">🔥 {userData.longestStreak} 天</p>
        </div>
      )}
    </div>
  )
}
