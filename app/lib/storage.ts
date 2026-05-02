import { UserData, CheckIn } from './types'
import { STORAGE_KEY } from './data'

export function getLocalDateString(date: Date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function getUserData(): UserData {
  if (typeof window === 'undefined') {
    return getDefaultUserData()
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const data = JSON.parse(stored)
      if (Array.isArray(data.visitedCategories)) {
        data.visitedCategories = new Set(data.visitedCategories)
      } else if (typeof data.visitedCategories === 'object' && !data.visitedCategories._isSet) {
        data.visitedCategories = new Set(Object.keys(data.visitedCategories))
      }
      return data
    }
  } catch (error) {
    console.error('Failed to load user data:', error)
  }

  return getDefaultUserData()
}

export function saveUserData(data: UserData): void {
  if (typeof window === 'undefined') return

  try {
    const serializable = {
      ...data,
      visitedCategories: Array.from(data.visitedCategories || [])
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable))
  } catch (error) {
    console.error('Failed to save user data:', error)
  }
}

export function getDefaultUserData(): UserData {
  return {
    userId: `user_${Date.now()}`,
    createdAt: new Date().toISOString(),
    checkIns: [],
    totalCheckIns: 0,
    currentStreak: 0,
    longestStreak: 0,
    totalLearningMinutes: 0,
    visitedCategories: new Set(),
    achievements: [],
    levelProgress: {}
  }
}

export function addCheckIn(durationMinutes: number, contentIds: string[], dateStr?: string): CheckIn {
  const data = getUserData()
  const date = dateStr || getLocalDateString()

  const newCheckIn: CheckIn = {
    id: `checkin_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    date,
    durationMinutes,
    contentIds,
    streak: 0
  }
  data.checkIns.unshift(newCheckIn)

  const uniqueDates = [...new Set(data.checkIns.map(c => c.date))]
  data.totalCheckIns = uniqueDates.length

  data.totalLearningMinutes += durationMinutes

  data.currentStreak = calculateStreak(data.checkIns)
  data.longestStreak = Math.max(data.longestStreak, data.currentStreak)

  saveUserData(data)

  return newCheckIn
}

export function addCategoryVisit(categoryId: string): void {
  const data = getUserData()
  data.visitedCategories.add(categoryId)
  saveUserData(data)
}

export function addLearningTime(minutes: number): void {
  if (minutes < 0.05) return
  const data = getUserData()
  data.totalLearningMinutes += Math.round(minutes)
  saveUserData(data)
}

export function calculateStreak(checkIns: CheckIn[]): number {
  const dates = [...new Set(checkIns.map(c => c.date))].sort().reverse()
  if (dates.length === 0) return 0

  const today = getLocalDateString()
  const yesterday = getLocalDateString(new Date(Date.now() - 86400000))

  if (dates[0] !== today && dates[0] !== yesterday) return 0

  let streak = 1
  for (let i = 0; i < dates.length - 1; i++) {
    const curr = new Date(dates[i] + 'T00:00:00')
    const prev = new Date(dates[i + 1] + 'T00:00:00')
    const diff = Math.round((curr.getTime() - prev.getTime()) / 86400000)
    if (diff === 1) {
      streak++
    } else {
      break
    }
  }

  return streak
}

export function getTodayCheckIn(): CheckIn | undefined {
  const data = getUserData()
  const today = getLocalDateString()
  return data.checkIns.find(c => c.date === today)
}

export function getCheckInsForDate(dateStr: string): CheckIn[] {
  const data = getUserData()
  return data.checkIns.filter(c => c.date === dateStr)
}

export function getCheckInsForMonth(year?: number, month?: number): CheckIn[] {
  const data = getUserData()
  const now = new Date()
  const y = year ?? now.getFullYear()
  const m = month ?? now.getMonth()
  const prefix = `${y}-${String(m + 1).padStart(2, '0')}`
  return data.checkIns.filter(c => c.date.startsWith(prefix))
}

export function getCheckInDatesForMonth(year: number, month: number): Set<string> {
  const checkins = getCheckInsForMonth(year, month)
  return new Set(checkins.map(c => c.date))
}

export function getUnlockedAchievements(data: UserData, allAchievements: any[]): string[] {
  return allAchievements
    .filter(ach => ach.condition(data))
    .map(ach => ach.id)
}
