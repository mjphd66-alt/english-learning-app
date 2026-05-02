export interface LearningResource {
  id: string
  title: string
  englishTitle?: string
  pronunciation?: string
  image?: string
  audio?: string
  video?: string
  description?: string
}

export interface LearningCategory {
  id: string
  icon: string
  title: string
  description: string
  color: string
  type: 'vocab' | 'textbook' | 'video' | 'phrases'
  items: LearningResource[]
}

export interface Checkin {
  id: string
  date: string
  videoBlob?: Blob
  thumbnailBlob?: Blob
  durationMinutes: number
  contentIds: string[]
  createdAt: string
}

export type BadgeType =
  | 'first_checkin'
  | 'streak_3'
  | 'streak_7'
  | 'streak_30'
  | 'total_10'
  | 'total_50'
  | 'total_100'

export interface Achievement {
  id: string
  badgeType: BadgeType
  unlockedAt: string
}

export interface Stats {
  totalDays: number
  currentStreak: number
  longestStreak: number
  monthlyCount: number
}

export interface UserSettings {
  nickname: string
}

export interface UserData {
  userId: string
  createdAt: string
  totalLearningMinutes: number
  visitedCategories: Set<string>
}

export interface AchievementDef {
  id: string
  name: string
  description: string
  icon: string
  level: number
  badgeType: BadgeType
  condition: (stats: Stats) => boolean
}

export const BADGE_CONFIG: Record<BadgeType, { name: string; description: string; icon: string }> = {
  first_checkin: { name: '初出茅庐', description: '完成第一次打卡', icon: '🎯' },
  streak_3: { name: '连续3天', description: '连续打卡3天', icon: '🔥' },
  streak_7: { name: '坚持一周', description: '连续打卡7天', icon: '💪' },
  streak_30: { name: '月度冠军', description: '连续打卡30天', icon: '🏆' },
  total_10: { name: '初露锋芒', description: '累计打卡10天', icon: '⭐' },
  total_50: { name: '半百里程', description: '累计打卡50天', icon: '🌟' },
  total_100: { name: '百日达人', description: '累计打卡100天', icon: '👑' },
}
