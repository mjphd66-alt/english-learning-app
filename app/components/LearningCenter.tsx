'use client'

import { useState, useRef, useEffect } from 'react'
import { learningCategories } from '@/app/lib/data'
import { useApp } from '@/app/lib/context'
import { addCategoryVisit } from '@/app/lib/db'
import { AnimatedButton } from '@/app/lib/animations'

function speak(text: string, lang = 'en-US') {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = lang; u.rate = 0.8
  window.speechSynthesis.speak(u)
}

let currentAudio: HTMLAudioElement | null = null
function stopCurrentAudio() {
  if (currentAudio) { currentAudio.pause(); currentAudio.currentTime = 0; currentAudio = null }
}

export function LearningCenter() {
  const { addLearningTime } = useApp()
  const [selectedCat, setSelectedCat] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  const [playingAudio, setPlayingAudio] = useState<string | null>(null)
  const learnStartTime = useRef<number>(0)

  useEffect(() => {
    return () => {
      if (learnStartTime.current > 0) {
        addLearningTime((Date.now() - learnStartTime.current) / 60000)
        learnStartTime.current = 0
      }
    }
  }, [])

  const cat = learningCategories.find(c => c.id === selectedCat)
  const item = cat?.items.find(i => i.id === selectedItem)

  const openItem = (id: string) => { setSelectedItem(id); learnStartTime.current = Date.now() }
  const closeItem = () => {
    if (learnStartTime.current > 0) { addLearningTime((Date.now() - learnStartTime.current) / 60000); learnStartTime.current = 0 }
    stopCurrentAudio(); setSelectedItem(null)
  }
  const closeCategory = () => { closeItem(); setSelectedCat(null) }

  const playAudio = (src: string) => {
    try {
      stopCurrentAudio(); window.speechSynthesis?.cancel()
      const a = new Audio(src); currentAudio = a; setPlayingAudio(src)
      a.onended = () => { setPlayingAudio(null); currentAudio = null }
      a.onerror = () => { setPlayingAudio(null); currentAudio = null }
      a.play().catch(() => { setPlayingAudio(null); currentAudio = null })
    } catch { setPlayingAudio(null) }
  }

  if (item && cat) {
    return (
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="p-4 flex items-center gap-3" style={{ backgroundColor: cat.color + '15' }}>
          <button onClick={closeItem} className="text-2xl">←</button>
          <span className="text-2xl">{cat.icon}</span>
          <span className="font-bold text-lg">{cat.title}</span>
        </div>
        <div className="p-6">
          {item.image && <div className="text-7xl text-center mb-4">{item.image}</div>}
          {item.englishTitle && (
            <div className="text-center mb-4">
              <h3 className="text-3xl font-bold text-gray-800">{item.englishTitle}</h3>
              <p className="text-xl text-gray-600 mt-1">{item.title}</p>
            </div>
          )}
          {!item.englishTitle && <h3 className="text-2xl font-bold text-gray-800 text-center mb-4">{item.title}</h3>}
          {item.pronunciation && <p className="text-center text-blue-500 font-mono text-lg mb-4">🔊 {item.pronunciation}</p>}
          {item.description && <p className="text-center text-gray-500 mb-4">{item.description}</p>}
          <div className="flex flex-col gap-3 items-center">
            {(item.audio || item.englishTitle) && (
              <AnimatedButton onClick={() => { if (item.audio) playAudio(item.audio); else if (item.englishTitle) { stopCurrentAudio(); speak(item.englishTitle) } }}
                className="w-full py-4 px-6 bg-gradient-to-r from-blue-400 to-blue-500 text-white rounded-xl font-bold text-lg">🗣️ 跟我读</AnimatedButton>
            )}
            {item.video && (
              <div className="w-full"><video controls className="w-full rounded-xl" src={item.video}>您的浏览器不支持视频播放</video></div>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (cat) {
    return (
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="p-4 flex items-center gap-3" style={{ backgroundColor: cat.color + '15' }}>
          <button onClick={closeCategory} className="text-2xl">←</button>
          <span className="text-2xl">{cat.icon}</span>
          <span className="font-bold text-lg">{cat.title}</span>
          <span className="text-sm text-gray-500 ml-auto">{cat.items.length}项</span>
        </div>
        <div className="p-4">
          <p className="text-gray-600 mb-4">{cat.description}</p>
          {cat.type === 'video' && (
            <div className="space-y-4">{cat.items.map(i => (
              <button key={i.id} onClick={() => openItem(i.id)} className="w-full p-4 rounded-xl border-2 border-gray-200 hover:border-blue-400 transition text-left flex items-center gap-3">
                <span className="text-3xl">🎬</span><span className="font-semibold">{i.title}</span>
              </button>
            ))}</div>
          )}
          {cat.type === 'textbook' && (
            <div className="grid grid-cols-2 gap-3">{cat.items.map(i => (
              <button key={i.id} onClick={() => { if (i.audio) playAudio(i.audio) }}
                className={`p-4 rounded-xl border-2 transition text-center ${playingAudio === i.audio ? 'border-purple-400 bg-purple-50' : 'border-gray-200 hover:border-purple-400'}`}>
                <div className="text-3xl mb-1">{i.image}</div>
                <div className="font-semibold text-sm">{i.title}</div>
                {i.englishTitle && <div className="text-xs text-blue-500">{i.englishTitle}</div>}
              </button>
            ))}</div>
          )}
          {cat.type === 'vocab' && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">{cat.items.map(i => (
              <button key={i.id} onClick={() => openItem(i.id)} className="p-3 rounded-xl border-2 border-gray-200 hover:border-blue-400 transition text-center transform hover:scale-105">
                {i.image && <div className="text-3xl mb-1">{i.image}</div>}
                <div className="font-semibold text-sm">{i.title}</div>
                {i.englishTitle && <div className="text-xs text-blue-500 truncate">{i.englishTitle}</div>}
              </button>
            ))}</div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-white">📚 学习中心</h2>
      <div className="grid grid-cols-2 gap-3">
        {learningCategories.map(c => (
          <AnimatedButton key={c.id} onClick={() => { setSelectedCat(c.id); setSelectedItem(null); addCategoryVisit(c.id) }}
            className="bg-white p-4 rounded-xl shadow-md text-left">
            <div className="text-4xl mb-2">{c.icon}</div>
            <h3 className="font-bold text-gray-800">{c.title}</h3>
            <p className="text-xs text-gray-500 mt-1">{c.items.length}项 · 点击学习</p>
          </AnimatedButton>
        ))}
      </div>
    </div>
  )
}
