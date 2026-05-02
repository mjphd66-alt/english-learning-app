'use client'

import { useApp } from '@/app/lib/context'
import { BadgeType, BADGE_CONFIG } from '@/app/lib/types'
import { motion } from 'framer-motion'

const ALL_BADGES: BadgeType[] = ['first_checkin', 'streak_3', 'streak_7', 'streak_30', 'total_10', 'total_50', 'total_100']

export function Achievements() {
  const { achievements, stats } = useApp()
  const unlockedTypes = new Set(achievements.map(a => a.badgeType))

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">🏆 成就徽章</h2>
      <p className="text-sm text-gray-500 mb-4">已解锁 {achievements.length} / {ALL_BADGES.length}</p>

      <div className="grid grid-cols-3 gap-3">
        {ALL_BADGES.map((badgeType, i) => {
          const config = BADGE_CONFIG[badgeType]
          const unlocked = unlockedTypes.has(badgeType)
          const ach = achievements.find(a => a.badgeType === badgeType)

          return (
            <motion.div key={badgeType}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`p-4 rounded-xl text-center transition ${
                unlocked
                  ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-300 shadow-md'
                  : 'bg-gray-50 border-2 border-gray-100 opacity-50'
              }`}
            >
              <motion.div animate={unlocked ? { scale: [1, 1.1, 1] } : {}} transition={{ duration: 2, repeat: Infinity }}
                className="text-4xl mb-2">{config.icon}</motion.div>
              <p className="font-bold text-sm text-gray-800">{config.name}</p>
              <p className="text-xs text-gray-500">{config.description}</p>
              {unlocked && ach && (
                <p className="text-xs text-green-500 mt-1">✓ {new Date(ach.unlockedAt).toLocaleDateString('zh-CN')}</p>
              )}
            </motion.div>
          )
        })}
      </div>

      <div className="mt-6 bg-purple-50 rounded-xl p-4">
        <h3 className="font-bold text-purple-700 mb-2">📈 当前进度</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-gray-600">累计打卡</span><span className="font-bold">{stats.totalDays}天</span></div>
          <div className="flex justify-between"><span className="text-gray-600">当前连续</span><span className="font-bold">{stats.currentStreak}天</span></div>
          <div className="flex justify-between"><span className="text-gray-600">最长连续</span><span className="font-bold">{stats.longestStreak}天</span></div>
        </div>
      </div>
    </div>
  )
}
