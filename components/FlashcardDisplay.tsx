'use client'

import { useState, useEffect } from 'react'
import type { Word } from '@/lib/supabase'

interface FlashcardDisplayProps {
  word: Word
  showAnswer: boolean
  isFlipping: boolean
  onFlip: () => void
}

export default function FlashcardDisplay({ word, showAnswer, isFlipping, onFlip }: FlashcardDisplayProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isPressed, setIsPressed] = useState(false)

  const speakWord = (text: string, lang: string = 'zh-CN') => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = lang
      utterance.rate = 0.8
      utterance.pitch = 1.0
      speechSynthesis.speak(utterance)
    }
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      '인사말': 'from-green-400 to-emerald-500',
      '숫자': 'from-blue-400 to-cyan-500',
      '색깔': 'from-purple-400 to-pink-500',
      '음식': 'from-orange-400 to-red-500',
      '가족': 'from-indigo-400 to-purple-500',
      '동물': 'from-yellow-400 to-orange-500',
      '기본': 'from-gray-400 to-slate-500',
      '중국어': 'from-red-400 to-pink-500'
    }
    return colors[category as keyof typeof colors] || 'from-gray-400 to-slate-500'
  }

  return (
    <div className="relative perspective-1000">
      {/* 플래시카드 컨테이너 */}
      <div
        className={`relative w-full max-w-2xl mx-auto transition-all duration-500 ease-out ${
          isFlipping ? 'animate-pulse' : ''
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        onTouchStart={() => setIsPressed(true)}
        onTouchEnd={() => setIsPressed(false)}
      >
        {/* 메인 플래시카드 */}
        <div
          className={`relative bg-gradient-to-br from-white via-gray-50 to-white rounded-3xl p-12 shadow-2xl min-h-[500px] flex flex-col justify-center cursor-pointer transition-all duration-500 border border-gray-100 overflow-hidden ${
            isHovered ? 'shadow-3xl scale-105' : 'shadow-2xl'
          } ${isPressed ? 'scale-95' : ''} ${
            showAnswer ? 'rotate-y-180' : ''
          }`}
          onClick={onFlip}
        >
          {/* 배경 장식 */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-4 right-4 w-32 h-32 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full blur-3xl"></div>
            <div className="absolute bottom-4 left-4 w-24 h-24 bg-gradient-to-br from-pink-400 to-red-400 rounded-full blur-2xl"></div>
          </div>

          {/* 카테고리 배지 */}
          <div className="absolute top-6 left-6">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getCategoryColor(word.category)} text-white shadow-lg`}>
              {word.category}
            </span>
          </div>

          {/* 난이도 표시 */}
          <div className="absolute top-6 right-6 flex space-x-1">
            {[1, 2, 3, 4, 5].map((level) => (
              <div
                key={level}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  level <= word.difficulty_level
                    ? 'bg-gradient-to-r from-yellow-400 to-orange-500'
                    : 'bg-gray-200'
                }`}
              ></div>
            ))}
          </div>

          {/* 카드 내용 */}
          <div className="text-center relative z-10">
            {!showAnswer ? (
              // 앞면: 중국어 글자
              <div className="space-y-8">
                <div className="group">
                  <div 
                    className="text-8xl font-bold text-gray-800 mb-4 transition-all duration-300 group-hover:scale-110 cursor-pointer"
                    onClick={() => speakWord(word.original)}
                  >
                    {word.original}
                  </div>
                  <div className="text-sm text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    클릭하여 발음 듣기
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="text-2xl font-medium text-gray-600">
                    {word.pronunciation}
                  </div>
                  
                  <div className="flex justify-center space-x-2">
                    {word.tags?.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-8">
                  <div className="text-sm text-gray-400 mb-2">정답을 보려면 카드를 클릭하세요</div>
                  <div className="flex justify-center">
                    <div className="animate-bounce">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // 뒷면: 한국어 의미
              <div className="space-y-8">
                <div className="text-6xl font-bold text-gray-800 mb-6">
                  {word.meaning}
                </div>
                
                <div className="space-y-4">
                  <div className="text-xl text-gray-600">
                    {word.original} - {word.pronunciation}
                  </div>
                  
                  <div className="flex justify-center space-x-4 text-sm text-gray-500">
                    <span>학습 횟수: {word.times_studied}</span>
                    <span>정답률: {word.total_attempts > 0 ? Math.round((word.correct_attempts / word.total_attempts) * 100) : 0}%</span>
                  </div>
                </div>

                {word.notes && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <div className="text-sm text-blue-800">
                      <strong>메모:</strong> {word.notes}
                    </div>
                  </div>
                )}

                <div className="mt-8">
                  <div className="text-sm text-gray-400 mb-2">다시 보려면 카드를 클릭하세요</div>
                  <div className="flex justify-center">
                    <div className="animate-bounce">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 플립 애니메이션 오버레이 */}
          {isFlipping && (
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-3xl animate-pulse"></div>
          )}
        </div>

        {/* 그림자 효과 */}
        <div className={`absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-4/5 h-4 bg-black/10 rounded-full blur-xl transition-all duration-500 ${
          isHovered ? 'scale-110 opacity-20' : 'scale-100 opacity-10'
        }`}></div>
      </div>

      {/* 키보드 단축키 안내 */}
      <div className="text-center mt-8 text-sm text-white/60">
        <div className="flex justify-center space-x-4">
          <span className="flex items-center">
            <kbd className="px-2 py-1 bg-white/20 rounded text-xs mr-2">←</kbd>
            이전
          </span>
          <span className="flex items-center">
            <kbd className="px-2 py-1 bg-white/20 rounded text-xs mr-2">Space</kbd>
            뒤집기
          </span>
          <span className="flex items-center">
            <kbd className="px-2 py-1 bg-white/20 rounded text-xs mr-2">→</kbd>
            다음
          </span>
          <span className="flex items-center">
            <kbd className="px-2 py-1 bg-white/20 rounded text-xs mr-2">Ctrl+A</kbd>
            관리자
          </span>
        </div>
      </div>
    </div>
  )
} 