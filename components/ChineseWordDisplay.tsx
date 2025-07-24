'use client'

import { useState } from 'react'
import type { Word } from '@/lib/supabase'
import { Volume2, Eye, EyeOff } from 'lucide-react'

interface ChineseWordDisplayProps {
  word: Word
  isFlipped: boolean
  onFlip: () => void
  showPinyin?: boolean
  showMeaning?: boolean
}

export default function ChineseWordDisplay({ 
  word, 
  isFlipped, 
  onFlip, 
  showPinyin = true, 
  showMeaning = true 
}: ChineseWordDisplayProps) {
  const [showDetails, setShowDetails] = useState(false)

  const speakWord = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'zh-CN'
      utterance.rate = 0.8
      speechSynthesis.speak(utterance)
    }
  }

  const isChinese = /[\u4e00-\u9fff]/.test(word.original)
  const isPunctuation = word.category === '문장부호'

  return (
    <div className="max-w-2xl mx-auto">
      {/* Main Word Display */}
      <div 
        className={`flashcard ${isFlipped ? 'flipped' : ''} cursor-pointer`}
        onClick={onFlip}
      >
        {/* Chinese Character */}
        <div className="text-center mb-6">
          <div className="chinese-character mb-4 text-gray-800">
            {word.original}
          </div>
          
          {/* Pinyin */}
          {showPinyin && !isPunctuation && (
            <div className="pinyin-text mb-2">
              {word.pronunciation}
            </div>
          )}
          
          {/* Korean Meaning */}
          {showMeaning && isFlipped && (
            <div className="meaning-text text-primary-600 mb-4">
              {word.meaning}
            </div>
          )}
        </div>

        {/* Category Badge */}
        <div className="flex justify-center mb-4">
          <span className={`category-badge ${
            word.category === '문장부호' ? 'punctuation' :
            word.category === '인명' ? 'person' :
            word.category === '동사' ? 'verb' :
            word.category === '명사' ? 'noun' :
            word.category === '형용사' ? 'adjective' :
            'default'
          }`}>
            {word.category}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mt-8">
          {/* Pronunciation Button */}
          {isChinese && !isPunctuation && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                speakWord(word.original)
              }}
              className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-sm rounded-2xl hover:from-orange-500/30 hover:to-red-500/30 transition-all duration-300 border border-orange-200/30 hover:border-orange-200/50 hover:scale-105"
            >
              <Volume2 size={24} className="text-orange-600" />
              <span className="font-semibold text-gray-700">발음 듣기</span>
            </button>
          )}
          
          {/* Details Toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowDetails(!showDetails)
            }}
            className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm rounded-2xl hover:from-blue-500/30 hover:to-purple-500/30 transition-all duration-300 border border-blue-200/30 hover:border-blue-200/50 hover:scale-105"
          >
            {showDetails ? <EyeOff size={24} className="text-blue-600" /> : <Eye size={24} className="text-blue-600" />}
            <span className="font-semibold text-gray-700">상세정보</span>
          </button>
        </div>

        {/* Instruction Text */}
        <div className="text-center mt-4 text-sm opacity-60">
          {isFlipped ? '클릭해서 앞면 보기' : '클릭해서 뜻 보기'}
        </div>
      </div>

      {/* Detailed Information */}
      {showDetails && (
        <div className="mt-8 p-8 bg-gradient-to-br from-white/20 to-white/10 rounded-3xl backdrop-blur-xl border border-white/20 shadow-2xl">
          <h4 className="text-2xl font-bold mb-6 text-gray-800 text-center">📊 단어 상세정보</h4>
          <div className="grid grid-cols-2 gap-6 text-base">
            <div className="bg-white/30 p-4 rounded-2xl">
              <span className="font-bold text-gray-700">원어:</span>
              <span className="ml-3 text-gray-800 font-semibold">{word.original}</span>
            </div>
            <div className="bg-white/30 p-4 rounded-2xl">
              <span className="font-bold text-gray-700">발음:</span>
              <span className="ml-3 text-gray-800 font-semibold">{word.pronunciation}</span>
            </div>
            <div className="bg-white/30 p-4 rounded-2xl">
              <span className="font-bold text-gray-700">의미:</span>
              <span className="ml-3 text-gray-800 font-semibold">{word.meaning}</span>
            </div>
            <div className="bg-white/30 p-4 rounded-2xl">
              <span className="font-bold text-gray-700">카테고리:</span>
              <span className="ml-3 text-gray-800 font-semibold">{word.category}</span>
            </div>
            <div className="bg-white/30 p-4 rounded-2xl">
              <span className="font-bold text-gray-700">숙련도:</span>
              <span className="ml-3 text-gray-800 font-semibold">{word.mastery_level.toFixed(1)}/5.0</span>
            </div>
            <div className="bg-white/30 p-4 rounded-2xl">
              <span className="font-bold text-gray-700">학습 횟수:</span>
              <span className="ml-3 text-gray-800 font-semibold">{word.times_studied}회</span>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-sm font-bold text-gray-700 mb-2">
              <span>정답률</span>
              <span>{word.total_attempts > 0 ? Math.round((word.correct_attempts / word.total_attempts) * 100) : 0}%</span>
            </div>
            <div className="w-full bg-gray-200/50 rounded-full h-3 backdrop-blur-sm">
              <div 
                className="bg-gradient-to-r from-orange-500 to-red-500 h-3 rounded-full transition-all duration-500 shadow-lg"
                style={{ 
                  width: `${word.total_attempts > 0 ? (word.correct_attempts / word.total_attempts) * 100 : 0}%` 
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 