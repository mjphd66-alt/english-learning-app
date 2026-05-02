'use client'

import { useState, useRef } from 'react'
import { addCheckIn, getUserData } from '@/app/lib/storage'
import { achievements } from '@/app/lib/data'

interface CheckInProps {
  onCheckInComplete?: () => void
}

export function CheckInForm({ onCheckInComplete }: CheckInProps) {
  const [submitted, setSubmitted] = useState(false)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [mode, setMode] = useState<'choose' | 'record' | 'upload'>('choose')
  const [newAchievements, setNewAchievements] = useState<string[]>([])
  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 },
        audio: true
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
      const recorder = new MediaRecorder(stream)
      mediaRecorderRef.current = recorder
      chunksRef.current = []
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' })
        const url = URL.createObjectURL(blob)
        setVideoUrl(url)
        stream.getTracks().forEach(t => t.stop())
        if (videoRef.current) videoRef.current.srcObject = null
      }
      recorder.start()
      setIsRecording(true)
    } catch {
      alert('无法访问摄像头，请检查权限设置')
    }
  }

  const stopRecording = () => {
    mediaRecorderRef.current?.stop()
    setIsRecording(false)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setVideoUrl(url)
    }
  }

  const handleSubmit = () => {
    const oldData = getUserData()
    const oldAch = achievements.filter(a => a.condition(oldData)).map(a => a.id)

    addCheckIn(15, ['video-checkin'])

    const newData = getUserData()
    const newAch = achievements
      .filter(a => a.condition(newData)).map(a => a.id)
      .filter(id => !oldAch.includes(id))

    setNewAchievements(newAch)
    setSubmitted(true)
    setVideoUrl(null)
    setMode('choose')
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
          onClick={() => { setSubmitted(false); onCheckInComplete?.() }}
          className="mt-4 w-full py-3 bg-gradient-to-r from-primary to-pink-500 text-white rounded-xl font-bold"
        >
          继续打卡
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">✅ 视频打卡</h2>

      {mode === 'choose' && (
        <div className="space-y-4">
          <p className="text-gray-600 text-center mb-4">录制或上传今天的学习视频</p>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setMode('record')}
              className="p-6 rounded-xl bg-gradient-to-br from-red-400 to-red-500 text-white font-bold hover:shadow-lg transition transform hover:scale-105"
            >
              <div className="text-4xl mb-2">📹</div>
              <div>录制视频</div>
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-6 rounded-xl bg-gradient-to-br from-blue-400 to-blue-500 text-white font-bold hover:shadow-lg transition transform hover:scale-105"
            >
              <div className="text-4xl mb-2">📁</div>
              <div>上传视频</div>
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={(e) => { handleFileUpload(e); setMode('upload') }}
            className="hidden"
          />
        </div>
      )}

      {mode === 'record' && (
        <div className="space-y-4">
          <div className="relative bg-black rounded-xl overflow-hidden" style={{ minHeight: 240 }}>
            <video ref={videoRef} className="w-full" muted={isRecording} />
            {!videoUrl && !isRecording && (
              <div className="absolute inset-0 flex items-center justify-center text-white text-lg">
                点击下方按钮开始录制
              </div>
            )}
            {videoUrl && (
              <video src={videoUrl} controls className="w-full" />
            )}
          </div>

          <div className="flex gap-3">
            {!isRecording && !videoUrl && (
              <button
                onClick={startRecording}
                className="flex-1 py-4 bg-red-500 text-white rounded-xl font-bold text-lg hover:bg-red-600 transition"
              >
                🔴 开始录制
              </button>
            )}
            {isRecording && (
              <button
                onClick={stopRecording}
                className="flex-1 py-4 bg-gray-700 text-white rounded-xl font-bold text-lg animate-pulse"
              >
                ⏹️ 停止录制
              </button>
            )}
            {videoUrl && (
              <>
                <button
                  onClick={() => { setVideoUrl(null); setMode('choose') }}
                  className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold"
                >
                  重新录制
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 py-3 bg-gradient-to-r from-green-400 to-green-500 text-white rounded-xl font-bold"
                >
                  ✅ 提交打卡
                </button>
              </>
            )}
            {!isRecording && !videoUrl && (
              <button
                onClick={() => setMode('choose')}
                className="flex-1 py-4 bg-gray-200 text-gray-700 rounded-xl font-bold"
              >
                ← 返回
              </button>
            )}
          </div>
        </div>
      )}

      {mode === 'upload' && videoUrl && (
        <div className="space-y-4">
          <div className="bg-black rounded-xl overflow-hidden">
            <video src={videoUrl} controls className="w-full" />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => { setVideoUrl(null); setMode('choose') }}
              className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold"
            >
              重新选择
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 py-3 bg-gradient-to-r from-green-400 to-green-500 text-white rounded-xl font-bold"
            >
              ✅ 提交打卡
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
