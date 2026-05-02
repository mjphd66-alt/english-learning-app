'use client'

import { useState, useEffect } from 'react'
import { UserData } from '@/app/lib/types'
import { getUserData } from '@/app/lib/storage'
import { achievements as allAchievements } from '@/app/lib/data'

export function Achievements() {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [unlockedIds, setUnlockedIds] = useState<string[]>([])

  useEffect(() => {
    const data = getUserData()
    setUserData(data)
    setUnlockedIds(
      allAchievements
        .filter(ach => ach.condition(data))
        .map(ach => ach.id)
    )
  }, [])

  if (!userData) return null

  // Group achievements by level
  const level1 = allAchievements.filter(a => a.level === 1)
  const level2 = allAchievements.filter(a => a.level === 2)
  const level3 = allAchievements.filter(a => a.level === 3)

  const renderAchievementGroup = (title: string, achievements: typeof allAchievements) => (
    <div key={title} className="mb-6">
      <h3 className="text-lg font-bold text-gray-800 mb-3">{title}</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {achievements.map(achievement => {
          const isUnlocked = unlockedIds.includes(achievement.id)

          return (
            <div
              key={achievement.id}
              className={`rounded-lg p-4 text-center transition transform ${
                isUnlocked
                  ? 'bg-gradient-to-br from-yellow-100 to-yellow-200 scale-105 shadow-lg'
                  : 'bg-gray-100 opacity-50 grayscale'
              }`}
            >
              <div className={`text-4xl mb-2 ${!isUnlocked && 'grayscale opacity-50'}`}>
                {achievement.icon}
              </div>
              <h4 className="font-bold text-sm text-gray-800">{achievement.name}</h4>
              <p className="text-xs text-gray-600 mt-1">{achievement.description}</p>
              {isUnlocked && <p className="text-xs text-yellow-600 mt-2 font-bold">✓ 已解锁</p>}
            </div>
          )
        })}
      </div>
    </div>
  )

  const unlockedCount = unlockedIds.length

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">🏆 成就徽章</h2>

      {/* Progress Summary */}
      <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-2">已解锁徽章</p>
            <p className="text-4xl font-bold text-purple-600">{unlockedCount}</p>
            <p className="text-sm text-gray-600 mt-2">共 {allAchievements.length} 个</p>
          </div>
          <div className="text-5xl">🎯</div>
        </div>
        <div className="mt-4 bg-white bg-opacity-50 rounded-lg p-2">
          <div className="w-full bg-gray-300 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-yellow-400 to-pink-500 h-2 rounded-full transition-all duration-500"
              style={{
                width: `${(unlockedCount / allAchievements.length) * 100}%`
              }}
            />
          </div>
          <p className="text-xs text-gray-600 mt-2 text-center">
            {Math.round((unlockedCount / allAchievements.length) * 100)}% 完成度
          </p>
        </div>
      </div>

      {/* Level 1 Achievements */}
      {renderAchievementGroup('🌱 初级徽章 (入门)', level1)}

      {/* Level 2 Achievements */}
      {renderAchievementGroup('🌳 中级徽章 (进阶)', level2)}

      {/* Level 3 Achievements */}
      {renderAchievementGroup('🏆 高级徽章 (精英)', level3)}

      {/* Locked Achievements Summary */}
      {unlockedCount < allAchievements.length && (
        <div className="mt-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            💪 还有 {allAchievements.length - unlockedCount} 个徽章等你去解锁！继续坚持学习吧！
          </p>
        </div>
      )}

      {unlockedCount === allAchievements.length && (
        <div className="mt-6 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg text-center">
          <p className="text-2xl mb-2">👑 🎉 🎊</p>
          <p className="font-bold text-yellow-700">你已解锁所有成就徽章！</p>
          <p className="text-sm text-yellow-600 mt-2">你是真正的英语小达人！</p>
        </div>
      )}
    </div>
  )
}
