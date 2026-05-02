'use client'

import { useState, useRef } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { useApp } from '@/app/lib/context'
import { saveCheckin, getLocalDateString } from '@/app/lib/db'
import { AnimatedButton, Confetti, ProgressSpinner, BadgeUnlockAnimation } from '@/app/lib/animations'

interface CheckInProps {
  onCheckInComplete?: () => void
  targetDate?: string
}

export function CheckInForm({ onCheckInComplete, targetDate }: CheckInProps) {
  const { refreshData, newBadges, clearNewBadges } = useApp()
  const [step, setStep] = useState<'choose' | 'preview' | 'saving'>('choose')
  const [videoUrl, setVideoUrl] = useState<string>('')
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const [thumbnailUrl, setThumbnailUrl] = useState<string>('')
  const [thumbnailBlob, setThumbnailBlob] = useState<Blob | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedDate, setSelectedDate] = useState(targetDate || getLocalDateString())
  const [showConfetti, setShowConfetti] = useState(false)
  const [showBadge, setShowBadge] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const generateThumbnail = (videoFile: Blob): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const video = document.createElement('video')
      const url = URL.createObjectURL(videoFile)
      video.src = url
      video.addEventListener('loadeddata', () => { video.currentTime = 0.5 })
      video.addEventListener('seeked', () => {
        try {
          const canvas = document.createElement('canvas')
          canvas.width = video.videoWidth || 640
          canvas.height = video.videoHeight || 480
          const ctx = canvas.getContext('2d')
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
            canvas.toBlob((blob) => { URL.revokeObjectURL(url); resolve(blob) }, 'image/jpeg', 0.7)
          } else { URL.revokeObjectURL(url); resolve(null) }
        } catch { URL.revokeObjectURL(url); resolve(null) }
      })
      video.addEventListener('error', () => { URL.revokeObjectURL(url); resolve(null) })
      video.load()
    })
  }

  const processVideoFile = async (file: File) => {
    if (!file.type.startsWith('video/')) { alert('请选择视频文件'); return }
    const thumb = await generateThumbnail(file)
    setRecordedBlob(file)
    setVideoUrl(URL.createObjectURL(file))
    setThumbnailBlob(thumb)
    if (thumb) setThumbnailUrl(URL.createObjectURL(thumb))
    setStep('preview')
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processVideoFile(file)
  }

  const openCamera = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'video/*'
    input.capture = 'environment'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) processVideoFile(file)
    }
    input.click()
  }

  const confirmUpload = async () => {
    if (!recordedBlob) return
    setStep('saving')
    setUploadProgress(30)

    const checkin = {
      id: uuidv4(),
      date: selectedDate,
      videoBlob: recordedBlob,
      thumbnailBlob: thumbnailBlob || undefined,
      durationMinutes: 15,
      contentIds: ['video-checkin'],
      createdAt: new Date().toISOString(),
    }

    setUploadProgress(60)
    await saveCheckin(checkin)
    setUploadProgress(90)
    await refreshData()
    setUploadProgress(100)

    setShowConfetti(true)
    setTimeout(() => setShowConfetti(false), 3000)
    if (newBadges.length > 0) setShowBadge(true)
    setTimeout(() => { setStep('choose'); setVideoUrl(''); setRecordedBlob(null); setThumbnailUrl(''); setThumbnailBlob(null); onCheckInComplete?.() }, 1500)
  }

  const retry = () => {
    if (videoUrl) URL.revokeObjectURL(videoUrl)
    if (thumbnailUrl) URL.revokeObjectURL(thumbnailUrl)
    setVideoUrl(''); setThumbnailUrl(''); setRecordedBlob(null); setThumbnailBlob(null); setStep('choose')
  }

  const today = getLocalDateString()
  const isToday = selectedDate === today

  return (
    <>
      <Confetti show={showConfetti} />
      <BadgeUnlockAnimation badgeType={newBadges[0] || ''} show={showBadge} onClose={() => { setShowBadge(false); clearNewBadges() }} />

      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">✅ 视频打卡</h2>

        <div className="mb-4">
          <label className="block text-sm text-gray-600 mb-1">打卡日期</label>
          <input type="date" value={selectedDate} max={today} onChange={e => setSelectedDate(e.target.value)}
            className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 outline-none" />
          {!isToday && <p className="text-sm text-orange-500 mt-1">📝 补卡模式</p>}
        </div>

        {step === 'choose' && (
          <div className="space-y-4">
            <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4 text-center mb-4">
              <span className="text-3xl block mb-2">📱</span>
              <p className="text-sm text-gray-600">先用手机相机录制英语视频，然后在这里上传</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <AnimatedButton onClick={openCamera}
                className="p-6 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 text-white font-bold">
                <div className="text-4xl mb-2">📹</div><div>拍摄视频</div>
              </AnimatedButton>
              <AnimatedButton onClick={() => fileInputRef.current?.click()}
                className="p-6 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-500 text-white font-bold">
                <div className="text-4xl mb-2">📁</div><div>从相册选择</div>
              </AnimatedButton>
            </div>
            <input ref={fileInputRef} type="file" accept="video/*" onChange={handleFileSelect} className="hidden" />
            <p className="text-center text-gray-400 text-xs">每天可以上传多个视频</p>
          </div>
        )}

        {step === 'preview' && videoUrl && (
          <div className="space-y-4">
            <div className="bg-black rounded-xl overflow-hidden">
              <video src={videoUrl} controls autoPlay playsInline className="w-full" />
            </div>
            <div className="flex gap-3">
              <AnimatedButton onClick={retry} className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold">🔄 重新选择</AnimatedButton>
              <AnimatedButton onClick={confirmUpload} className="flex-1 py-3 bg-gradient-to-r from-green-400 to-green-500 text-white rounded-xl font-bold">✅ 确认打卡</AnimatedButton>
            </div>
          </div>
        )}

        {step === 'saving' && (
          <div className="py-8 flex flex-col items-center">
            <ProgressSpinner progress={uploadProgress} />
            <p className="mt-4 text-gray-600 font-bold">{uploadProgress < 100 ? '正在保存...' : '保存成功! 🎉'}</p>
          </div>
        )}
      </div>
    </>
  )
}
