'use client'

import { useState, useRef } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { useApp } from '@/app/lib/context'
import { saveCheckin, getLocalDateString } from '@/app/lib/db'
import { AnimatedButton, Confetti, ProgressSpinner, BadgeUnlockAnimation } from '@/app/lib/animations'
import { CheckinType } from '@/app/lib/types'

interface CheckInProps {
  onCheckInComplete?: () => void
  targetDate?: string
}

export function CheckInForm({ onCheckInComplete, targetDate }: CheckInProps) {
  const { refreshData, newBadges, clearNewBadges } = useApp()
  const [checkinType, setCheckinType] = useState<CheckinType>('video')
  const [step, setStep] = useState<'choose' | 'preview' | 'saving'>('choose')
  const [mediaUrl, setMediaUrl] = useState<string>('')
  const [mediaBlob, setMediaBlob] = useState<Blob | null>(null)
  const [thumbnailUrl, setThumbnailUrl] = useState<string>('')
  const [thumbnailBlob, setThumbnailBlob] = useState<Blob | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedDate, setSelectedDate] = useState(targetDate || getLocalDateString())
  const [showConfetti, setShowConfetti] = useState(false)
  const [showBadge, setShowBadge] = useState(false)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const audioInputRef = useRef<HTMLInputElement>(null)

  const generateThumbnail = (videoFile: Blob): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const video = document.createElement('video')
      const url = URL.createObjectURL(videoFile)
      video.src = url
      video.muted = true
      video.playsInline = true
      let resolved = false
      const done = (blob: Blob | null) => { if (!resolved) { resolved = true; URL.revokeObjectURL(url); resolve(blob) } }
      const timeout = setTimeout(() => done(null), 5000)
      video.addEventListener('loadeddata', () => { video.currentTime = 0.5 })
      video.addEventListener('seeked', () => {
        clearTimeout(timeout)
        try {
          const canvas = document.createElement('canvas')
          canvas.width = video.videoWidth || 640
          canvas.height = video.videoHeight || 480
          const ctx = canvas.getContext('2d')
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
            canvas.toBlob((blob) => done(blob), 'image/jpeg', 0.7)
          } else done(null)
        } catch { done(null) }
      })
      video.addEventListener('error', () => { clearTimeout(timeout); done(null) })
      video.load()
    })
  }

  const processVideoFile = async (file: File) => {
    if (!file.type.startsWith('video/')) { alert('请选择视频文件'); return }
    const thumb = await generateThumbnail(file)
    setMediaBlob(file)
    setMediaUrl(URL.createObjectURL(file))
    setThumbnailBlob(thumb)
    if (thumb) setThumbnailUrl(URL.createObjectURL(thumb))
    setCheckinType('video')
    setStep('preview')
  }

  const processAudioFile = (file: File) => {
    if (!file.type.startsWith('audio/') && !file.type.startsWith('video/')) { alert('请选择音频文件'); return }
    setMediaBlob(file)
    setMediaUrl(URL.createObjectURL(file))
    setCheckinType('audio')
    setStep('preview')
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: CheckinType) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (type === 'video') processVideoFile(file)
    else processAudioFile(file)
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

  const openAudioRecorder = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'audio/*'
    input.capture = 'microphone' as any
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) processAudioFile(file)
    }
    input.click()
  }

  const confirmUpload = async () => {
    if (!mediaBlob) return
    setStep('saving')
    setUploadProgress(30)

    const checkin = {
      id: uuidv4(),
      date: selectedDate,
      type: checkinType,
      videoBlob: checkinType === 'video' ? mediaBlob : undefined,
      audioBlob: checkinType === 'audio' ? mediaBlob : undefined,
      thumbnailBlob: checkinType === 'video' ? (thumbnailBlob || undefined) : undefined,
      durationMinutes: 15,
      contentIds: [`${checkinType}-checkin`],
      createdAt: new Date().toISOString(),
    }

    setUploadProgress(60)
    await saveCheckin(checkin as any)
    setUploadProgress(90)
    await refreshData()
    setUploadProgress(100)

    setShowConfetti(true)
    setTimeout(() => setShowConfetti(false), 3000)
    if (newBadges.length > 0) setShowBadge(true)
    setTimeout(() => {
      setStep('choose'); setMediaUrl(''); setMediaBlob(null); setThumbnailUrl(''); setThumbnailBlob(null)
      onCheckInComplete?.()
    }, 1500)
  }

  const retry = () => {
    if (mediaUrl) URL.revokeObjectURL(mediaUrl)
    if (thumbnailUrl) URL.revokeObjectURL(thumbnailUrl)
    setMediaUrl(''); setThumbnailUrl(''); setMediaBlob(null); setThumbnailBlob(null); setStep('choose')
  }

  const today = getLocalDateString()
  const isToday = selectedDate === today

  return (
    <>
      <Confetti show={showConfetti} />
      <BadgeUnlockAnimation badgeType={newBadges[0] || ''} show={showBadge} onClose={() => { setShowBadge(false); clearNewBadges() }} />

      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">✅ 打卡</h2>

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
              <p className="text-sm text-gray-600">录制或上传英语学习视频/音频</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <AnimatedButton onClick={openCamera}
                className="p-5 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 text-white font-bold">
                <div className="text-3xl mb-2">📹</div><div className="text-sm">拍摄视频</div>
              </AnimatedButton>
              <AnimatedButton onClick={() => { setCheckinType('video'); videoInputRef.current?.click() }}
                className="p-5 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-500 text-white font-bold">
                <div className="text-3xl mb-2">📁</div><div className="text-sm">上传视频</div>
              </AnimatedButton>
              <AnimatedButton onClick={openAudioRecorder}
                className="p-5 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 text-white font-bold">
                <div className="text-3xl mb-2">🎙️</div><div className="text-sm">录制音频</div>
              </AnimatedButton>
              <AnimatedButton onClick={() => { setCheckinType('audio'); audioInputRef.current?.click() }}
                className="p-5 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 text-white font-bold">
                <div className="text-3xl mb-2">🎵</div><div className="text-sm">上传音频</div>
              </AnimatedButton>
            </div>
            <input ref={videoInputRef} type="file" accept="video/*" onChange={e => handleFileSelect(e, 'video')} className="hidden" />
            <input ref={audioInputRef} type="file" accept="audio/*" onChange={e => handleFileSelect(e, 'audio')} className="hidden" />
            <p className="text-center text-gray-400 text-xs">每天可以上传多个视频/音频</p>
          </div>
        )}

        {step === 'preview' && mediaUrl && (
          <div className="space-y-4">
            {checkinType === 'video' ? (
              <div className="bg-black rounded-xl overflow-hidden">
                <video src={mediaUrl} controls autoPlay playsInline className="w-full" />
              </div>
            ) : (
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-8 text-center">
                <div className="text-6xl mb-4">🎙️</div>
                <p className="text-gray-600 mb-4">音频预览</p>
                <audio controls autoPlay src={mediaUrl} className="w-full max-w-md mx-auto" />
              </div>
            )}
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
