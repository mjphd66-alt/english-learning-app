'use client'

import { useState } from 'react'
import { useApp } from '@/app/lib/context'
import { getLocalDateString, deleteCheckin as deleteCheckinDB } from '@/app/lib/db'
import { AnimatedButton } from '@/app/lib/animations'
import { BADGE_CONFIG, Checkin } from '@/app/lib/types'

interface CheckInCalendarProps {
  onMakeUpCheckIn?: (date: string) => void
}

export function CheckInCalendar({ onMakeUpCheckIn }: CheckInCalendarProps) {
  const { checkins, stats, refreshData } = useApp()
  const [viewYear, setViewYear] = useState(new Date().getFullYear())
  const [viewMonth, setViewMonth] = useState(new Date().getMonth())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [previewCheckin, setPreviewCheckin] = useState<Checkin | null>(null)

  const today = getLocalDateString()
  const prefix = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`
  const monthCheckinDates = new Set(checkins.filter(c => c.date.startsWith(prefix)).map(c => c.date))
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const firstDay = new Date(viewYear, viewMonth, 1).getDay()

  const days: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) days.push(null)
  for (let i = 1; i <= daysInMonth; i++) days.push(i)

  const prevMonth = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1) } else setViewMonth(viewMonth - 1) }
  const nextMonth = () => { if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1) } else setViewMonth(viewMonth + 1) }

  const selectedCheckIns = selectedDate ? checkins.filter(c => c.date === selectedDate) : []

  const handleDelete = async (id: string) => {
    await deleteCheckinDB(id)
    await refreshData()
    setDeleteConfirm(null)
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold text-gray-800">📅 打卡日历</h2>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-purple-50 rounded-xl p-3 text-center">
          <span className="text-2xl">📊</span>
          <p className="text-xl font-bold text-purple-600">{stats.totalDays}</p>
          <p className="text-xs text-gray-500">总天数</p>
        </div>
        <div className="bg-orange-50 rounded-xl p-3 text-center">
          <span className="text-2xl">🔥</span>
          <p className="text-xl font-bold text-orange-500">{stats.currentStreak}</p>
          <p className="text-xs text-gray-500">连续</p>
        </div>
        <div className="bg-green-50 rounded-xl p-3 text-center">
          <span className="text-2xl">📅</span>
          <p className="text-xl font-bold text-green-500">{stats.monthlyCount}</p>
          <p className="text-xs text-gray-500">本月</p>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <AnimatedButton onClick={prevMonth} className="text-lg text-gray-600 hover:text-purple-600 px-2">◀</AnimatedButton>
        <h3 className="text-lg font-bold text-gray-700">{viewYear}年{viewMonth + 1}月</h3>
        <AnimatedButton onClick={nextMonth} className="text-lg text-gray-600 hover:text-purple-600 px-2">▶</AnimatedButton>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {['日', '一', '二', '三', '四', '五', '六'].map(day => (
          <div key={day} className="text-center text-sm text-gray-400 py-1">{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day, idx) => {
          if (day === null) return <div key={`empty-${idx}`} className="aspect-square" />
          const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const isCheckedIn = monthCheckinDates.has(dateStr)
          const isToday = dateStr === today
          const isPast = dateStr < today
          const isSelected = selectedDate === dateStr
          return (
            <button key={day} onClick={() => { if (isCheckedIn || isPast || isToday) setSelectedDate(selectedDate === dateStr ? null : dateStr) }}
              className={`aspect-square rounded-lg flex flex-col items-center justify-center text-sm font-medium transition ${
                isCheckedIn ? 'bg-gradient-to-br from-green-400 to-green-500 text-white shadow-sm'
                  : isToday ? 'bg-yellow-100 text-yellow-700 border-2 border-yellow-400'
                  : isPast ? 'bg-gray-50 text-gray-400 hover:bg-purple-50'
                  : 'bg-gray-50 text-gray-300'
              } ${isSelected ? 'ring-2 ring-purple-500 ring-offset-1' : ''}`}>
              <span>{day}</span>
              {isCheckedIn && <span className="text-xs">✓</span>}
            </button>
          )
        })}
      </div>

      {selectedDate && (
        <div className="mt-4 border-t-2 border-gray-100 pt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-800">{selectedDate} {monthCheckinDates.has(selectedDate) ? '✓ 已打卡' : ''}</h3>
            <button onClick={() => setSelectedDate(null)} className="text-gray-400 text-sm">收起</button>
          </div>

          {selectedCheckIns.length > 0 && (
            <div className="space-y-2 mb-3">
              {selectedCheckIns.map((c, i) => {
                const isAudio = c.type === 'audio'
                return (
                  <button key={c.id} onClick={() => setPreviewCheckin(c)}
                    className="w-full flex items-center gap-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-3 text-left hover:shadow-md transition">
                    {c.thumbnailBlob ? (
                      <img src={URL.createObjectURL(c.thumbnailBlob)} alt="" className="w-14 h-14 rounded-lg object-cover" />
                    ) : isAudio ? (
                      <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-white text-2xl">🎙️</div>
                    ) : (
                      <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-2xl">🎬</div>
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{isAudio ? '音频' : '视频'} {i + 1}</p>
                      <p className="text-xs text-gray-500">{new Date(c.createdAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    <span className="text-purple-500">▶</span>
                  </button>
                )
              })}
            </div>
          )}

          {!monthCheckinDates.has(selectedDate) && selectedDate <= today && (
            <AnimatedButton onClick={() => onMakeUpCheckIn?.(selectedDate)}
              className="w-full py-3 bg-gradient-to-r from-purple-400 to-pink-500 text-white rounded-xl font-bold">📝 补卡</AnimatedButton>
          )}
        </div>
      )}

      {previewCheckin && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
          <div className="flex items-center justify-between p-4 text-white bg-black/50">
            <button onClick={() => setPreviewCheckin(null)} className="text-2xl">←</button>
            <span className="font-bold">{previewCheckin.date} {previewCheckin.type === 'audio' ? '音频' : '视频'}</span>
            <button onClick={() => { setDeleteConfirm(previewCheckin.id); setPreviewCheckin(null) }} className="text-red-400">🗑️</button>
          </div>
          <div className="flex-1 flex items-center justify-center bg-black p-4">
            {previewCheckin.type === 'audio' && previewCheckin.audioBlob ? (
              <audio controls autoPlay src={URL.createObjectURL(previewCheckin.audioBlob)} className="w-full max-w-md" />
            ) : previewCheckin.videoBlob ? (
              <video controls autoPlay playsInline src={URL.createObjectURL(previewCheckin.videoBlob)} className="max-w-full max-h-full rounded-lg" />
            ) : (
              <p className="text-white">无法播放</p>
            )}
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center mx-4" onClick={e => e.stopPropagation()}>
            <span className="text-5xl mb-4 block">🗑️</span>
            <h3 className="text-lg font-bold text-gray-800 mb-2">确定删除吗？</h3>
            <p className="text-gray-500 text-sm mb-6">删除后无法恢复</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-full font-medium">取消</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 bg-red-500 text-white py-3 rounded-full font-medium">确认删除</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
