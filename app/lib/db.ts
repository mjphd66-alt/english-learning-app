import { openDB, IDBPDatabase } from 'idb'
import { Checkin, Stats, Achievement, UserSettings } from './types'

interface AppDB {
  checkins: { key: string; value: Checkin; indexes: { 'by-date': string } }
  settings: { key: string; value: UserSettings & { id: string } }
  achievements: { key: string; value: Achievement; indexes: { 'by-type': string } }
  stats: { key: string; value: Stats & { id: string } }
  learning: { key: string; value: { id: string; totalMinutes: number; visitedCategories: string[]; userId: string; createdAt: string } }
}

let db: IDBPDatabase<AppDB> | null = null

export async function getDB() {
  if (db) return db
  db = await openDB<AppDB>('kids-english-app', 1, {
    upgrade(d) {
      const cs = d.createObjectStore('checkins', { keyPath: 'id' })
      cs.createIndex('by-date', 'date')
      d.createObjectStore('settings', { keyPath: 'id' })
      const ach = d.createObjectStore('achievements', { keyPath: 'id' })
      ach.createIndex('by-type', 'badgeType')
      d.createObjectStore('stats', { keyPath: 'id' })
      d.createObjectStore('learning', { keyPath: 'id' })
    },
  })
  return db
}

// Checkins
export async function saveCheckin(checkin: Checkin) {
  const d = await getDB()
  await d.put('checkins', checkin)
}

export async function getAllCheckins(): Promise<Checkin[]> {
  const d = await getDB()
  return d.getAll('checkins')
}

export async function getCheckinsByDate(date: string): Promise<Checkin[]> {
  const d = await getDB()
  const all = await d.getAllFromIndex('checkins', 'by-date')
  return all.filter(c => c.date === date)
}

export async function deleteCheckin(id: string) {
  const d = await getDB()
  await d.delete('checkins', id)
}

// Settings
export async function getUserSettings(): Promise<UserSettings> {
  const d = await getDB()
  const s = await d.get('settings', 'user')
  return s || { nickname: '小朋友' }
}

export async function saveUserSettings(settings: UserSettings) {
  const d = await getDB()
  await d.put('settings', { ...settings, id: 'user' })
}

// Achievements
export async function getAllAchievements(): Promise<Achievement[]> {
  const d = await getDB()
  return d.getAll('achievements')
}

export async function saveAchievement(achievement: Achievement) {
  const d = await getDB()
  await d.put('achievements', achievement)
}

export async function hasAchievement(badgeType: string): Promise<boolean> {
  const d = await getDB()
  const all = await d.getAllFromIndex('achievements', 'by-type')
  return all.some(a => a.badgeType === badgeType)
}

// Stats
export async function getStats(): Promise<Stats> {
  const d = await getDB()
  const s = await d.get('stats', 'current')
  return s || { totalDays: 0, currentStreak: 0, longestStreak: 0, monthlyCount: 0 }
}

export async function saveStats(stats: Stats) {
  const d = await getDB()
  await d.put('stats', { ...stats, id: 'current' })
}

// Learning data
export async function getLearningData() {
  const d = await getDB()
  const data = await d.get('learning', 'main')
  return data || { id: 'main', totalMinutes: 0, visitedCategories: [] as string[], userId: `user_${Date.now()}`, createdAt: new Date().toISOString() }
}

export async function saveLearningData(data: { totalMinutes: number; visitedCategories: string[]; userId: string; createdAt: string }) {
  const d = await getDB()
  await d.put('learning', { ...data, id: 'main' })
}

export async function addCategoryVisit(categoryId: string) {
  const data = await getLearningData()
  if (!data.visitedCategories.includes(categoryId)) {
    data.visitedCategories.push(categoryId)
    await saveLearningData(data)
  }
}

// Calculate stats
export function getLocalDateString(date: Date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function calculateStatsFromCheckins(checkins: Checkin[]): Stats {
  const dates = [...new Set(checkins.map(c => c.date))].sort()
  if (dates.length === 0) return { totalDays: 0, currentStreak: 0, longestStreak: 0, monthlyCount: 0 }

  const totalDays = dates.length
  let longestStreak = 1
  let tempStreak = 1

  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1] + 'T00:00:00')
    const curr = new Date(dates[i] + 'T00:00:00')
    const diff = Math.round((curr.getTime() - prev.getTime()) / 86400000)
    if (diff === 1) {
      tempStreak++
    } else {
      longestStreak = Math.max(longestStreak, tempStreak)
      tempStreak = 1
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak)

  const today = getLocalDateString()
  const yesterday = getLocalDateString(new Date(Date.now() - 86400000))
  let currentStreak = 0

  if (dates[dates.length - 1] === today || dates[dates.length - 1] === yesterday) {
    currentStreak = 1
    let checkDate = new Date(dates[dates.length - 1] + 'T00:00:00')
    for (let i = dates.length - 2; i >= 0; i--) {
      const prevDate = new Date(dates[i] + 'T00:00:00')
      const diff = Math.round((checkDate.getTime() - prevDate.getTime()) / 86400000)
      if (diff === 1) { currentStreak++; checkDate = prevDate }
      else break
    }
  }

  const thisMonth = today.slice(0, 7)
  const monthlyCount = dates.filter(d => d.startsWith(thisMonth)).length

  return { totalDays, currentStreak, longestStreak, monthlyCount }
}

// Check and unlock achievements
export async function checkAndUnlockAchievements(stats: Stats): Promise<string[]> {
  const newBadges: string[] = []

  if (stats.totalDays >= 1 && !(await hasAchievement('first_checkin'))) newBadges.push('first_checkin')
  if (stats.currentStreak >= 3 && !(await hasAchievement('streak_3'))) newBadges.push('streak_3')
  if (stats.currentStreak >= 7 && !(await hasAchievement('streak_7'))) newBadges.push('streak_7')
  if (stats.currentStreak >= 30 && !(await hasAchievement('streak_30'))) newBadges.push('streak_30')
  if (stats.totalDays >= 10 && !(await hasAchievement('total_10'))) newBadges.push('total_10')
  if (stats.totalDays >= 50 && !(await hasAchievement('total_50'))) newBadges.push('total_50')
  if (stats.totalDays >= 100 && !(await hasAchievement('total_100'))) newBadges.push('total_100')

  for (const badgeType of newBadges) {
    await saveAchievement({ id: `ach-${badgeType}-${Date.now()}`, badgeType: badgeType as any, unlockedAt: new Date().toISOString() })
  }

  return newBadges
}

// Storage size calculation
export async function getStorageInfo() {
  const d = await getDB()
  const checkins = await d.getAll('checkins')
  const achievements = await d.getAll('achievements')
  let totalSize = 0
  for (const c of checkins) {
    totalSize += (c.videoBlob?.size || 0) + (c.thumbnailBlob?.size || 0)
    totalSize += 200
  }
  totalSize += achievements.length * 100
  return {
    totalVideos: checkins.length,
    totalSizeMB: (totalSize / 1024 / 1024).toFixed(1),
    uniqueDays: new Set(checkins.map(c => c.date)).size,
  }
}
