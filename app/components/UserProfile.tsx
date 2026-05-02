'use client'

import { useApp } from '@/app/lib/context'

export function UserProfile() {
  const { stats, learningMinutes, settings } = useApp()

  const hours = Math.floor(learningMinutes / 60)
  const minutes = learningMinutes % 60

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">👋 {settings.nickname}</h2>
        </div>
        <div className="text-4xl">🌟</div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-red-100 to-red-200 rounded-lg p-4">
          <div className="text-sm text-gray-600">打卡天数</div>
          <div className="text-3xl font-bold text-red-600">{stats.totalDays}</div>
        </div>
        <div className="bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg p-4">
          <div className="text-sm text-gray-600">连续打卡</div>
          <div className="text-3xl font-bold text-orange-600">
            {stats.currentStreak}<span className="text-lg">天</span>
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg p-4">
          <div className="text-sm text-gray-600">学习时长</div>
          <div className="text-3xl font-bold text-blue-600">
            {hours > 0 ? `${hours}h${minutes}m` : `${learningMinutes}m`}
          </div>
        </div>
      </div>

      {stats.longestStreak > 0 && stats.longestStreak > stats.currentStreak && (
        <div className="mt-4 p-4 bg-purple-50 border-2 border-purple-200 rounded-lg">
          <p className="text-sm text-gray-600">最长连续纪录</p>
          <p className="text-2xl font-bold text-purple-600">🔥 {stats.longestStreak} 天</p>
        </div>
      )}
    </div>
  )
}
