'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ReactNode } from 'react'

export function AnimatedButton({ children, onClick, className = '', disabled = false }: {
  children: ReactNode; onClick?: () => void; className?: string; disabled?: boolean
}) {
  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.05 } : undefined}
      whileTap={!disabled ? { scale: 0.95 } : undefined}
      onClick={onClick}
      disabled={disabled}
      className={className}
    >
      {children}
    </motion.button>
  )
}

export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
      {children}
    </motion.div>
  )
}

export function Confetti({ show }: { show: boolean }) {
  if (!show) return null
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FED766', '#F8B500', '#FF69B4', '#9B59B6', '#2ECC71']
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {Array.from({ length: 40 }).map((_, i) => {
        const color = colors[i % colors.length]
        const left = Math.random() * 100
        const delay = Math.random() * 0.5
        const duration = 1.5 + Math.random()
        const size = 6 + Math.random() * 8
        return (
          <motion.div
            key={i}
            initial={{ y: -20, x: 0, opacity: 1, rotate: 0 }}
            animate={{ y: typeof window !== 'undefined' ? window.innerHeight + 50 : 800, x: (Math.random() - 0.5) * 200, opacity: 0, rotate: Math.random() * 720 }}
            transition={{ duration, delay, ease: 'easeOut' }}
            style={{ position: 'absolute', left: `${left}%`, top: 0, width: size, height: size, borderRadius: Math.random() > 0.5 ? '50%' : '2px', backgroundColor: color }}
          />
        )
      })}
    </div>
  )
}

export function BadgeUnlockAnimation({ badgeType, show, onClose }: { badgeType: string; show: boolean; onClose: () => void }) {
  const BADGES: Record<string, { name: string; icon: string }> = {
    first_checkin: { name: '初出茅庐', icon: '🎯' },
    streak_3: { name: '连续3天', icon: '🔥' },
    streak_7: { name: '坚持一周', icon: '💪' },
    streak_30: { name: '月度冠军', icon: '🏆' },
    total_10: { name: '初露锋芒', icon: '⭐' },
    total_50: { name: '半百里程', icon: '🌟' },
    total_100: { name: '百日达人', icon: '👑' },
  }
  const badge = BADGES[badgeType] || { name: '新成就', icon: '🎊' }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="bg-white rounded-3xl p-8 text-center shadow-2xl max-w-sm mx-4"
          >
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: Infinity }} className="text-7xl mb-4">
              {badge.icon}
            </motion.div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">解锁新成就!</h3>
            <p className="text-lg text-purple-600 font-bold">{badge.name}</p>
            <button onClick={onClose} className="mt-6 px-8 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-bold">太棒了!</button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function ProgressSpinner({ progress }: { progress: number }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="text-5xl">💾</motion.div>
      <div className="w-48 h-3 bg-gray-200 rounded-full overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
      </div>
      <p className="text-gray-500 text-sm">{progress}%</p>
    </div>
  )
}
