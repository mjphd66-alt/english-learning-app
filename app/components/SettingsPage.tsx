'use client'

import { useState, useEffect } from 'react'
import { useApp } from '@/app/lib/context'
import { getStorageInfo, getAllCheckins, deleteCheckin } from '@/app/lib/db'
import { AnimatedButton } from '@/app/lib/animations'

export function SettingsPage() {
  const { settings, updateSettings, refreshData } = useApp()
  const [nickname, setNickname] = useState(settings.nickname)
  const [storageInfo, setStorageInfo] = useState({ totalVideos: 0, totalSizeMB: '0', uniqueDays: 0 })
  const [showSaved, setShowSaved] = useState(false)

  useEffect(() => {
    getStorageInfo().then(setStorageInfo)
  }, [])

  const handleSaveNickname = async () => {
    await updateSettings({ nickname })
    setShowSaved(true)
    setTimeout(() => setShowSaved(false), 2000)
  }

  const handleCleanup = async (days: number) => {
    const checkins = await getAllCheckins()
    const cutoff = new Date(Date.now() - days * 86400000).toISOString().split('T')[0]
    const toDelete = checkins.filter(c => c.date < cutoff)
    if (toDelete.length === 0) { alert('没有需要清理的视频'); return }
    if (!confirm(`确定删除 ${toDelete.length} 个${days}天前的视频吗？`)) return
    for (const c of toDelete) await deleteCheckin(c.id)
    await refreshData()
    getStorageInfo().then(setStorageInfo)
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-white">⚙️ 设置</h2>

      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">👤 个人信息</h3>
        <div className="flex gap-3">
          <input type="text" value={nickname} onChange={e => setNickname(e.target.value)} maxLength={20}
            className="flex-1 p-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 outline-none" />
          <AnimatedButton onClick={handleSaveNickname}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold">
            {showSaved ? '✓' : '保存'}
          </AnimatedButton>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">💾 存储信息</h3>
        <div className="space-y-3">
          <div className="flex justify-between text-gray-600">
            <span>视频总数</span><span className="font-bold">{storageInfo.totalVideos} 个</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>存储大小</span><span className="font-bold">{storageInfo.totalSizeMB} MB</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>打卡天数</span><span className="font-bold">{storageInfo.uniqueDays} 天</span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-3">清理旧视频释放空间</p>
          <div className="flex gap-3">
            <AnimatedButton onClick={() => handleCleanup(30)}
              className="flex-1 py-2 bg-orange-100 text-orange-600 rounded-xl font-medium text-sm">
              清理30天前
            </AnimatedButton>
            <AnimatedButton onClick={() => handleCleanup(7)}
              className="flex-1 py-2 bg-red-100 text-red-600 rounded-xl font-medium text-sm">
              清理7天前
            </AnimatedButton>
          </div>
        </div>
      </div>
    </div>
  )
}
