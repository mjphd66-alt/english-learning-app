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

export interface CheckIn {
  id: string
  date: string
  durationMinutes: number
  contentIds: string[]
  notes?: string
  streak?: number
}

export interface UserData {
  userId: string
  createdAt: string
  checkIns: CheckIn[]
  totalCheckIns: number
  currentStreak: number
  longestStreak: number
  totalLearningMinutes: number
  visitedCategories: Set<string>
  achievements: string[]
  levelProgress: {
    [key: string]: number
  }
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  level: number
  condition: (userData: UserData) => boolean
}
