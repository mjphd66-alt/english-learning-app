'use client'

import { useState, useEffect } from 'react'
import { UserData } from '@/app/lib/types'
import { getUserData, getCheckInsForMonth } from '@/app/lib/storage'

export function CheckInCalendar() {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [currentDate, setCurrentDate] = useState(new Date())

  useEffect(() => {
    setUserData(getUserData())
  }, [])

  if (!userData) return null

  const monthCheckIns = getCheckInsForMonth()
  const checkInDates = new Set(monthCheckIns.map(c => c.date.split('T')[0]))

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()

  const days = []
  for (let i = 0; i < firstDay; i++) {
    days.push(null)
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i)
  }

  const monthName = currentDate.toLocaleString('zh-CN', { month: 'long', year: 'numeric' })

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">📅 打卡日历</h2>
        <div className="text-lg font-semibold text-gray-600">{monthName}</div>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-2 mb-4">
        {['日', '一', '二', '三', '四', '五', '六'].map(day => (
          <div key={day} className="text-center font-bold text-gray-600 text-sm py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Days */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} className="aspect-square" />
          }

          const dateStr = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            day
          ).toISOString().split('T')[0]

          const isCheckedIn = checkInDates.has(dateStr)
          const isToday = new Date().toISOString().split('T')[0] === dateStr

          return (
            <div
              key={day}
              className={`aspect-square flex items-center justify-center rounded-lg font-bold text-sm transition transform ${
                isCheckedIn
                  ? 'bg-gradient-to-br from-green-400 to-green-500 text-white shadow-lg'
                  : isToday
                  ? 'bg-yellow-100 text-yellow-700 border-2 border-yellow-400'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {isCheckedIn ? (
                <span className="text-lg">✓</span>
              ) : (
                day
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-6 pt-6 border-t-2 border-gray-200">
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
            <div className="text-2xl font-bold text-primary">{monthCheckIns.length}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
