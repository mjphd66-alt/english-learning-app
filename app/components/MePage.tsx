'use client'

import { useState } from 'react'
import { Achievements } from './Achievements'
import { SettingsPage } from './SettingsPage'
import { AnimatedButton } from '@/app/lib/animations'

export function MePage() {
  const [subTab, setSubTab] = useState<'achievements' | 'settings'>('achievements')

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <AnimatedButton onClick={() => setSubTab('achievements')}
          className={`flex-1 py-3 rounded-xl font-bold text-center ${subTab === 'achievements' ? 'bg-white shadow-lg text-purple-600' : 'bg-white/50 text-white'}`}>
          🏆 成就
        </AnimatedButton>
        <AnimatedButton onClick={() => setSubTab('settings')}
          className={`flex-1 py-3 rounded-xl font-bold text-center ${subTab === 'settings' ? 'bg-white shadow-lg text-purple-600' : 'bg-white/50 text-white'}`}>
          ⚙️ 设置
        </AnimatedButton>
      </div>

      {subTab === 'achievements' && <Achievements />}
      {subTab === 'settings' && <SettingsPage />}
    </div>
  )
}
