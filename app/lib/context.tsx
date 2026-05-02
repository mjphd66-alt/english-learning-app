'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Checkin, Stats, UserSettings, Achievement } from './types'
import {
  getAllCheckins, getStats, saveStats, getUserSettings,
  getAllAchievements, calculateStatsFromCheckins, checkAndUnlockAchievements, getLearningData, saveLearningData,
} from './db'

interface AppContextType {
  checkins: Checkin[]
  stats: Stats
  settings: UserSettings
  achievements: Achievement[]
  learningMinutes: number
  isLoading: boolean
  newBadges: string[]
  refreshData: () => Promise<void>
  updateSettings: (s: Partial<UserSettings>) => Promise<void>
  addLearningTime: (minutes: number) => Promise<void>
  clearNewBadges: () => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [checkins, setCheckins] = useState<Checkin[]>([])
  const [stats, setStats] = useState<Stats>({ totalDays: 0, currentStreak: 0, longestStreak: 0, monthlyCount: 0, totalVideos: 0, totalAudios: 0 })
  const [settings, setSettings] = useState<UserSettings>({ nickname: '小朋友' })
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [learningMinutes, setLearningMinutes] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [newBadges, setNewBadges] = useState<string[]>([])

  const refreshData = async () => {
    try {
      const [allCheckins, currentStats, userSettings, allAchievements, learningData] = await Promise.all([
        getAllCheckins(),
        getStats(),
        getUserSettings(),
        getAllAchievements(),
        getLearningData(),
      ])

      setCheckins(allCheckins)
      setStats(currentStats)
      setSettings(userSettings)
      setAchievements(allAchievements)
      setLearningMinutes(learningData.totalMinutes)
    } catch (error) {
      console.error('Failed to refresh data:', error)
    }
  }

  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    const updated = { ...settings, ...newSettings }
    const { saveUserSettings } = await import('./db')
    await saveUserSettings(updated)
    setSettings(updated)
  }

  const addLearningTimeFn = async (minutes: number) => {
    if (minutes < 0.05) return
    const learningData = await getLearningData()
    learningData.totalMinutes += Math.round(minutes)
    await saveLearningData(learningData)
    setLearningMinutes(learningData.totalMinutes)
  }

  const clearNewBadges = () => setNewBadges([])

  useEffect(() => {
    const init = async () => {
      setIsLoading(true)
      await refreshData()
      setIsLoading(false)
    }
    init()
  }, [])

  useEffect(() => {
    if (checkins.length === 0 && isLoading) return
    const updateStats = async () => {
      const newStats = calculateStatsFromCheckins(checkins)
      await saveStats(newStats)
      setStats(newStats)
      const badges = await checkAndUnlockAchievements(newStats, learningMinutes)
      if (badges.length > 0) {
        setNewBadges(badges)
        setAchievements(await getAllAchievements())
      }
    }
    updateStats()
  }, [checkins.length])

  return (
    <AppContext.Provider value={{
      checkins, stats, settings, achievements, learningMinutes, isLoading,
      newBadges, refreshData, updateSettings, addLearningTime: addLearningTimeFn, clearNewBadges,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
