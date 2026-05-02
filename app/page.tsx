'use client'

import { useState, useEffect } from 'react'
import { UserData } from './lib/types'
import { getUserData } from './lib/storage'
import { NavBar } from './components/NavBar'
import { WelcomeBanner } from './components/WelcomeBanner'
import { UserProfile } from './components/UserProfile'
import { LearningCenter } from './components/LearningCenter'
import { CheckInForm } from './components/CheckInForm'
import { CheckInCalendar } from './components/CheckInCalendar'
import { Achievements } from './components/Achievements'

export default function Home() {
  const [currentTab, setCurrentTab] = useState('home')
  const [userData, setUserData] = useState<UserData | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    setUserData(getUserData())
  }, [refreshKey])

  const handleCheckInComplete = () => {
    setRefreshKey(k => k + 1)
  }

  const handleTabChange = (tab: string) => {
    setCurrentTab(tab)
    // Refresh data when switching tabs
    setTimeout(() => setRefreshKey(k => k + 1), 100)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 pb-32 pt-4 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-black text-white mb-2 drop-shadow-lg">
            ✨ 天天英语
          </h1>
          <p className="text-white text-sm drop-shadow-md">
            每天坚持学习，成为英语小达人！
          </p>
        </div>

        {/* Content */}
        <div key={refreshKey}>
          {currentTab === 'home' && (
            <>
              <WelcomeBanner userData={userData} />
              <UserProfile />
              
              <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">🎯 快速开始</h2>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => handleTabChange('learn')}
                    className="bg-gradient-to-br from-blue-400 to-blue-500 text-white p-4 rounded-lg font-bold hover:shadow-lg transition transform hover:scale-105"
                  >
                    <div className="text-3xl mb-2">📚</div>
                    <div>开始学习</div>
                  </button>
                  <button
                    onClick={() => handleTabChange('checkin')}
                    className="bg-gradient-to-br from-green-400 to-green-500 text-white p-4 rounded-lg font-bold hover:shadow-lg transition transform hover:scale-105"
                  >
                    <div className="text-3xl mb-2">✅</div>
                    <div>立即打卡</div>
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">💡 小提示</h2>
                <ul className="space-y-2 text-gray-700">
                  <li>✨ 每天坚持打卡，建立学习习惯</li>
                  <li>📹 上传学习视频，记录学习过程</li>
                  <li>🏆 解锁成就，赢取荣誉徽章</li>
                  <li>🔥 保持连续打卡，创造新纪录</li>
                </ul>
              </div>
            </>
          )}

          {currentTab === 'learn' && (
            <LearningCenter />
          )}

          {currentTab === 'checkin' && (
            <CheckInForm onCheckInComplete={handleCheckInComplete} />
          )}

          {currentTab === 'calendar' && (
            <CheckInCalendar />
          )}

          {currentTab === 'achievements' && (
            <Achievements />
          )}
        </div>
      </div>

      {/* Navigation Bar */}
      <NavBar currentTab={currentTab} onTabChange={handleTabChange} />
    </div>
  )
}
