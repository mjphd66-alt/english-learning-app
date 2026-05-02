'use client'

import { useState, useEffect } from 'react'
import { getUserData, getLocalDateString, getCheckInDatesForMonth, getCheckInsForDate } from '@/app/lib/storage'
import { CheckIn } from '@/app/lib/types'

interface CheckInCalendarProps {
  onMakeUpCheckIn?: (date: string) => void
}

export function CheckInCalendar({ onMakeUpCheckIn }: CheckInCalendarProps) {
  const [userData, setUserData] = useState(() => {
    if (typeof window === 'undefined') return null
    return getUserData()
  })
  const [viewYear, setViewYear] = useState(new Date().getFullYear())
  const [viewMonth, setViewMonth] = useState(new Date().getMonth())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  useEffect(() => {
    setUserData(getUserData())
  }, [viewYear, viewMonth])

  if (!userData) return null

  const today = getLocalDateString()
  const checkInDates = getCheckInDatesForMonth(viewYear, viewMonth)
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const firstDay = new Date(viewYear, viewMonth, 1).getDay()

  const days: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) days.push(null)
  for (let i = 1; i <= daysInMonth; i++) days.push(i)

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1) }
    else setViewMonth(viewMonth - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1) }
    else setViewMonth(viewMonth + 1)
  }

  const monthLabel = `${viewYear}年${viewMonth + 1}月`

  const selectedCheckIns = selectedDate ? getCheckInsForDate(selectedDate) : []

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <button onClick={prevMonth} className="text-xl text-gray-600 hover:text-purple-600 px-2">◀</button>
        <h2 className="text-xl font-bold text-gray-800">📅 {monthLabel}</h2>
        <button onClick={nextMonth} className="text-xl text-gray-600 hover:text-purple-600 px-2">▶</button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {['日', '一', '二', '三', '四', '五', '六'].map(day => (
          <div key={day} className="text-center text-sm text-gray-400 py-1">{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} className="aspect-square" />
          }

          const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const isCheckedIn = checkInDates.has(dateStr)
          const isToday = dateStr === today
          const isPast = dateStr < today
          const isSelected = selectedDate === dateStr

          return (
            <button
              key={day}
              onClick={() => {
                if (isCheckedIn || isPast || isToday) {
                  setSelectedDate(selectedDate === dateStr ? null : dateStr)
                }
              }}
              className={`aspect-square rounded-lg flex flex-col items-center justify-center text-sm font-medium transition ${
                isCheckedIn
                  ? 'bg-gradient-to-br from-green-400 to-green-500 text-white shadow-sm'
                  : isToday
                  ? 'bg-yellow-100 text-yellow-700 border-2 border-yellow-400'
                  : isPast
                  ? 'bg-gray-50 text-gray-400 hover:bg-purple-50'
                  : 'bg-gray-50 text-gray-300'
              } ${isSelected ? 'ring-2 ring-purple-500 ring-offset-1' : ''}`}
            >
              <span>{day}</span>
              {isCheckedIn && <span className="text-xs">✓</span>}
            </button>
          )
        })}
      </div>

      {selectedDate && (
        <div className="mt-4 border-t-2 border-gray-100 pt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-800">
              {selectedDate} {checkInDates.has(selectedDate) ? '已打卡' : '未打卡'}
            </h3>
            <button onClick={() => setSelectedDate(null)} className="text-gray-400 text-sm">收起</button>
          </div>

          {selectedCheckIns.length > 0 && (
            <div className="space-y-2 mb-3">
              {selectedCheckIns.map((c: CheckIn, i: number) => (
                <div key={c.id} className="flex items-center gap-3 bg-green-50 rounded-xl p-3">
                  <span className="text-2xl">🎬</span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">视频 {i + 1}</p>
                  </div>
                  <span className="text-green-500">✓</span>
                </div>
              ))}
            </div>
          )}

          {!checkInDates.has(selectedDate) && selectedDate <= today && (
            <button
              onClick={() => onMakeUpCheckIn?.(selectedDate)}
              className="w-full py-3 bg-gradient-to-r from-purple-400 to-pink-500 text-white rounded-xl font-bold hover:shadow-lg transition"
            >
              📝 补卡
            </button>
          )}
        </div>
      )}

      <div className="mt-4 pt-4 border-t-2 border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-400 rounded"></div>
              <span className="text-sm text-gray-600">已打卡</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-100 rounded border border-gray-300"></div>
              <span className="text-sm text-gray-600">未打卡</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">本月打卡</div>
            <div className="text-2xl font-bold text-purple-600">{checkInDates.size}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
