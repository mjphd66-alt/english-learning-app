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

export type CheckinType = 'video' | 'audio'

export interface Checkin {
  id: string
  date: string
  type: CheckinType
  videoBlob?: Blob
  audioBlob?: Blob
  thumbnailBlob?: Blob
  durationMinutes: number
  contentIds: string[]
  createdAt: string
}

export type BadgeType =
  | 'first_checkin'
  | 'streak_3'
  | 'streak_7'
  | 'streak_14'
  | 'streak_30'
  | 'streak_100'
  | 'total_5'
  | 'total_10'
  | 'total_30'
  | 'total_50'
  | 'total_100'
  | 'video_1'
  | 'video_10'
  | 'video_50'
  | 'study_10m'
  | 'study_1h'
  | 'study_5h'
  | 'study_20h'
  | 'first_audio'

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
  totalVideos: number
  totalAudios: number
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

export const BADGE_CONFIG: Record<BadgeType, { name: string; description: string; icon: string; category: string }> = {
  first_checkin: { name: '初出茅庐', description: '完成第一次打卡', icon: '🎯', category: '打卡' },
  first_audio: { name: '声声入耳', description: '完成第一次音频打卡', icon: '🎙️', category: '打卡' },
  streak_3: { name: '小有成就', description: '连续打卡3天', icon: '🔥', category: '连续' },
  streak_7: { name: '坚持一周', description: '连续打卡7天', icon: '💪', category: '连续' },
  streak_14: { name: '两周达人', description: '连续打卡14天', icon: '⚡', category: '连续' },
  streak_30: { name: '月度冠军', description: '连续打卡30天', icon: '🏆', category: '连续' },
  streak_100: { name: '百日坚持', description: '连续打卡100天', icon: '💎', category: '连续' },
  total_5: { name: '初试锋芒', description: '累计打卡5天', icon: '🌱', category: '累计' },
  total_10: { name: '崭露头角', description: '累计打卡10天', icon: '⭐', category: '累计' },
  total_30: { name: '稳步前行', description: '累计打卡30天', icon: '📈', category: '累计' },
  total_50: { name: '半百里程', description: '累计打卡50天', icon: '🌟', category: '累计' },
  total_100: { name: '百日达人', description: '累计打卡100天', icon: '👑', category: '累计' },
  video_1: { name: '镜头首秀', description: '上传第一个视频', icon: '📹', category: '视频' },
  video_10: { name: '视频达人', description: '上传10个视频', icon: '🎬', category: '视频' },
  video_50: { name: '视频大师', description: '上传50个视频', icon: '🎥', category: '视频' },
  study_10m: { name: '初尝学习', description: '累计学习10分钟', icon: '📖', category: '学习' },
  study_1h: { name: '学有所成', description: '累计学习1小时', icon: '📚', category: '学习' },
  study_5h: { name: '学习使者', description: '累计学习5小时', icon: '🎓', category: '学习' },
  study_20h: { name: '学习大师', description: '累计学习20小时', icon: '🧠', category: '学习' },
}
