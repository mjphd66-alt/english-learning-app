import { UserData, CheckIn } from './types'
import { STORAGE_KEY } from './data'

export function getUserData(): UserData {
  if (typeof window === 'undefined') {
    return getDefaultUserData()
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const data = JSON.parse(stored)
      // Convert visitedCategories from array to Set if needed
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
    // Convert Set to array for JSON serialization
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

export function addCheckIn(durationMinutes: number, contentIds: string[]): CheckIn {
  const data = getUserData()
  const today = new Date().toISOString().split('T')[0]
  
  // Check if already checked in today
  const existingCheckIn = data.checkIns.find(c => c.date === today)
  if (existingCheckIn) {
    // Update existing check-in
    existingCheckIn.durationMinutes += durationMinutes
    existingCheckIn.contentIds = [...new Set([...existingCheckIn.contentIds, ...contentIds])]
  } else {
    const newCheckIn: CheckIn = {
      id: `checkin_${Date.now()}`,
      date: today,
      durationMinutes,
      contentIds,
      streak: calculateStreak(data.checkIns)
    }
    data.checkIns.unshift(newCheckIn)
    data.totalCheckIns += 1
  }

  // Update learning time
  data.totalLearningMinutes += durationMinutes
  
  // Update visited categories
  contentIds.forEach(id => {
    // Find which category this content belongs to
    // This would be populated from the content lookup
  })

  data.currentStreak = calculateStreak(data.checkIns)
  data.longestStreak = Math.max(data.longestStreak, data.currentStreak)

  saveUserData(data)
  
  return data.checkIns.find(c => c.date === today) as CheckIn
}

export function addCategoryVisit(categoryId: string): void {
  const data = getUserData()
  data.visitedCategories.add(categoryId)
  saveUserData(data)
}

export function calculateStreak(checkIns: CheckIn[]): number {
  if (checkIns.length === 0) return 0

  let streak = 0
  const today = new Date()
  
  for (let i = 0; i < checkIns.length; i++) {
    const checkInDate = new Date(checkIns[i].date)
    const expectedDate = new Date(today)
    expectedDate.setDate(expectedDate.getDate() - i)
    
    const checkInDateStr = checkInDate.toISOString().split('T')[0]
    const expectedDateStr = expectedDate.toISOString().split('T')[0]
    
    if (checkInDateStr === expectedDateStr) {
      streak++
    } else {
      break
    }
  }

  return streak
}

export function getTodayCheckIn(): CheckIn | undefined {
  const data = getUserData()
  const today = new Date().toISOString().split('T')[0]
  return data.checkIns.find(c => c.date === today)
}

export function getCheckInsForWeek(): CheckIn[] {
  const data = getUserData()
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
  
  return data.checkIns.filter(c => {
    const checkInDate = new Date(c.date)
    return checkInDate >= oneWeekAgo
  })
}

export function getCheckInsForMonth(): CheckIn[] {
  const data = getUserData()
  const oneMonthAgo = new Date()
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
  
  return data.checkIns.filter(c => {
    const checkInDate = new Date(c.date)
    return checkInDate >= oneMonthAgo
  })
}

export function getUnlockedAchievements(data: UserData, allAchievements: any[]): string[] {
  return allAchievements
    .filter(ach => ach.condition(data))
    .map(ach => ach.id)
}
