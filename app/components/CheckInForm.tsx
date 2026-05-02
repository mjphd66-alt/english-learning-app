'use client'

import { useState, useRef } from 'react'
import { addCheckIn, getUserData, getLocalDateString } from '@/app/lib/storage'
import { achievements } from '@/app/lib/data'

interface CheckInProps {
  onCheckInComplete?: () => void
  targetDate?: string
}

export function CheckInForm({ onCheckInComplete, targetDate }: CheckInProps) {
  const [submitted, setSubmitted] = useState(false)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [mode, setMode] = useState<'choose' | 'preview'>('choose')
  const [newAchievements, setNewAchievements] = useState<string[]>([])
  const [selectedDate, setSelectedDate] = useState(targetDate || getLocalDateString())
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('video/')) {
      alert('请选择视频文件')
      return
    }
    const url = URL.createObjectURL(file)
    setVideoUrl(url)
    setMode('preview')
  }

  const openCamera = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'video/*'
    input.capture = 'environment'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const url = URL.createObjectURL(file)
        setVideoUrl(url)
        setMode('preview')
      }
    }
    input.click()
  }

  const handleSubmit = () => {
    const oldData = getUserData()
    const oldAch = achievements.filter(a => a.condition(oldData)).map(a => a.id)

    addCheckIn(15, ['video-checkin'], selectedDate)

    const newData = getUserData()
    const newAch = achievements
      .filter(a => a.condition(newData)).map(a => a.id)
      .filter(id => !oldAch.includes(id))

    setNewAchievements(newAch)
    setSubmitted(true)
    setVideoUrl(null)
    setMode('choose')
  }

  const reset = () => {
    setSubmitted(false)
    setVideoUrl(null)
    setMode('choose')
    onCheckInComplete?.()
  }

  if (submitted) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="bg-green-50 border-2 border-green-400 rounded-xl p-8 text-center">
          <div className="text-6xl mb-4 animate-bounce">🎉</div>
          <h3 className="text-2xl font-bold text-green-600 mb-2">打卡成功!</h3>
          <p className="text-green-600">继续加油，坚持学英语！</p>
        </div>

        {newAchievements.length > 0 && (
          <div className="mt-4 bg-yellow-50 border-2 border-yellow-400 rounded-xl p-4 text-center">
            <div className="text-3xl mb-2">🏆 恭喜解锁新成就!</div>
            <div className="grid grid-cols-2 gap-2">
              {newAchievements.map(id => {
                const ach = achievements.find(a => a.id === id)
                return ach ? (
                  <div key={id} className="bg-white rounded p-2">
                    <div className="text-2xl">{ach.icon}</div>
                    <p className="font-bold text-xs">{ach.name}</p>
                  </div>
                ) : null
              })}
            </div>
          </div>
        )}

        <button
          onClick={reset}
          className="mt-4 w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold"
        >
          继续打卡
        </button>
      </div>
    )
  }

  const today = getLocalDateString()
  const isToday = selectedDate === today

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">✅ 视频打卡</h2>

      <div className="mb-4">
        <label className="block text-sm text-gray-600 mb-1">打卡日期</label>
        <input
          type="date"
          value={selectedDate}
          max={today}
          onChange={e => setSelectedDate(e.target.value)}
          className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 outline-none"
        />
        {!isToday && (
          <p className="text-sm text-orange-500 mt-1">📝 补卡模式</p>
        )}
      </div>

      {mode === 'choose' && (
        <div className="space-y-4">
          <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4 text-center mb-4">
            <span className="text-3xl block mb-2">📱</span>
            <p className="text-sm text-gray-600">先用手机相机录制英语视频，然后在这里上传</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={openCamera}
              className="p-6 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 text-white font-bold hover:shadow-lg transition transform hover:scale-105"
            >
              <div className="text-4xl mb-2">📹</div>
              <div>拍摄视频</div>
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-6 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-500 text-white font-bold hover:shadow-lg transition transform hover:scale-105"
            >
              <div className="text-4xl mb-2">📁</div>
              <div>从相册选择</div>
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <p className="text-center text-gray-400 text-xs">每天可以上传多个视频</p>
        </div>
      )}

      {mode === 'preview' && videoUrl && (
        <div className="space-y-4">
          <div className="bg-black rounded-xl overflow-hidden">
            <video src={videoUrl} controls autoPlay playsInline className="w-full" />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => { setVideoUrl(null); setMode('choose') }}
              className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold"
            >
              🔄 重新选择
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 py-3 bg-gradient-to-r from-green-400 to-green-500 text-white rounded-xl font-bold"
            >
              ✅ 确认打卡
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
