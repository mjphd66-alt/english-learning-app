'use client'

import { useState } from 'react'
import { addCheckIn, getUserData } from '@/app/lib/storage'
import { learningCategories, achievements } from '@/app/lib/data'

interface CheckInProps {
  onCheckInComplete?: () => void
}

export function CheckInForm({ onCheckInComplete }: CheckInProps) {
  const [selectedContents, setSelectedContents] = useState<string[]>([])
  const [durationMinutes, setDurationMinutes] = useState(15)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [newAchievements, setNewAchievements] = useState<string[]>([])

  const handleContentToggle = (contentId: string) => {
    setSelectedContents(prev =>
      prev.includes(contentId)
        ? prev.filter(id => id !== contentId)
        : [...prev, contentId]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (selectedContents.length === 0 || durationMinutes <= 0) {
      setErrorMsg('请选择学习内容并设置学习时长')
      return
    }

    setIsSubmitting(true)
    setErrorMsg('')

    try {
      // Get old achievements
      const oldData = getUserData()
      const oldAchievements = achievements
        .filter(ach => ach.condition(oldData))
        .map(ach => ach.id)

      // Add check-in
      addCheckIn(durationMinutes, selectedContents)

      // Get new data and check for new achievements
      const newData = getUserData()
      const newUnlockedAchievements = achievements
        .filter(ach => ach.condition(newData))
        .map(ach => ach.id)
        .filter(id => !oldAchievements.includes(id))

      setNewAchievements(newUnlockedAchievements)
      setSubmitted(true)
      setSelectedContents([])
      setDurationMinutes(15)

      // Show success message
      setTimeout(() => {
        setSubmitted(false)
        onCheckInComplete?.()
      }, 3000)
    } catch (error) {
      setErrorMsg('打卡失败，请重试')
      console.error('Check-in error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">✅ 每日打卡</h2>

      {submitted ? (
        <div>
          <div className="bg-green-50 border-2 border-green-400 rounded-lg p-8 text-center mb-6">
            <div className="text-6xl mb-4 animate-bounce">🎉</div>
            <h3 className="text-2xl font-bold text-green-600 mb-2">打卡成功!</h3>
            <p className="text-green-600 mb-2">今天学了 {durationMinutes} 分钟</p>
            <p className="text-green-600">继续加油，坚持学英语！</p>
          </div>

          {newAchievements.length > 0 && (
            <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-6 text-center">
              <div className="text-4xl mb-3">🏆 恭喜解锁新成就!</div>
              <div className="grid grid-cols-2 gap-3">
                {newAchievements.map(achId => {
                  const ach = achievements.find(a => a.id === achId)
                  return ach ? (
                    <div key={achId} className="bg-white rounded p-3">
                      <div className="text-3xl mb-1">{ach.icon}</div>
                      <p className="font-bold text-sm text-gray-800">{ach.name}</p>
                      <p className="text-xs text-gray-600">{ach.description}</p>
                    </div>
                  ) : null
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Learning Duration */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              ⏱️ 今天学习多久？(分钟)
            </label>
            <div className="flex gap-2 flex-wrap">
              {[5, 10, 15, 20, 30, 45, 60].map(min => (
                <button
                  key={min}
                  type="button"
                  onClick={() => setDurationMinutes(min)}
                  className={`px-4 py-2 rounded-full font-semibold transition ${
                    durationMinutes === min
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {min} 分钟
                </button>
              ))}
            </div>
            <input
              type="number"
              min="1"
              max="240"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Math.max(1, parseInt(e.target.value) || 0))}
              className="mt-3 w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary transition"
              placeholder="或输入自定义时长"
            />
          </div>

          {/* Content Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              📚 今天学了哪些内容? (至少选一个)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {learningCategories.map(content => (
                <button
                  key={content.id}
                  type="button"
                  onClick={() => handleContentToggle(content.id)}
                  className={`p-3 rounded-lg border-2 transition ${
                    selectedContents.includes(content.id)
                      ? 'border-4 bg-yellow-50'
                      : 'border-gray-200 bg-white'
                  }`}
                  style={
                    selectedContents.includes(content.id)
                      ? { borderColor: content.color }
                      : {}
                  }
                >
                  <div className="text-3xl mb-2 text-center">{content.icon}</div>
                  <h4 className="font-semibold text-xs text-gray-800 text-center">{content.title}</h4>
                </button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 text-red-600">
              {errorMsg}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-primary to-pink-500 text-white font-bold py-3 px-6 rounded-lg hover:shadow-lg transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? '提交中...' : '✅ 确认打卡'}
          </button>

          <p className="text-center text-sm text-gray-500">
            记录你的学习时间，坚持每天学习，你就是小学霸！
          </p>
        </form>
      )}
    </div>
  )
}
