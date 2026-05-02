'use client'

import { useState } from 'react'

interface NavBarProps {
  currentTab: string
  onTabChange: (tab: string) => void
}

export function NavBar({ currentTab, onTabChange }: NavBarProps) {
  const tabs = [
    { id: 'home', label: '首页', icon: '🏠' },
    { id: 'learn', label: '学习', icon: '📚' },
    { id: 'checkin', label: '打卡', icon: '✅' },
    { id: 'calendar', label: '日历', icon: '📅' },
    { id: 'achievements', label: '成就', icon: '🏆' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-2xl">
      <div className="flex justify-around items-center h-20 max-w-6xl mx-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center justify-center w-full h-full transition transform ${
              currentTab === tab.id
                ? 'text-primary scale-110'
                : 'text-gray-600 hover:text-primary'
            }`}
          >
            <div className="text-2xl">{tab.icon}</div>
            <div className="text-xs font-semibold mt-1">{tab.label}</div>
          </button>
        ))}
      </div>
    </nav>
  )
}
