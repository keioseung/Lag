'use client'

import { useState, useEffect } from 'react'
// 4개 언어 학습을 위한 타입 정의
interface MultiLanguageWord {
  id: string
  korean: string
  english: string
  japanese: string
  chinese: string
  category: string
  difficulty: 'easy' | 'medium' | 'hard'
  createdDate: string
  isFavorite: boolean
}

interface FlashcardDisplayProps {
  word: MultiLanguageWord
  showAnswer: boolean
  isFlipping: boolean
  onFlip: () => void
  onNext?: () => void
  onPrev?: () => void
  onToggleFavorite?: (wordId: string) => void
  currentIndex?: number
  totalCount?: number
}

export default function FlashcardDisplay({ word, showAnswer, isFlipping, onFlip, onNext, onPrev, onToggleFavorite, currentIndex, totalCount }: FlashcardDisplayProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isPressed, setIsPressed] = useState(false)

  // word가 없으면 빈 div 반환
  if (!word) {
    return (
      <div className="relative perspective-1000">
        <div className="relative w-full max-w-2xl mx-auto">
          <div className="relative bg-gradient-to-br from-white via-gray-50 to-white rounded-3xl p-12 shadow-2xl min-h-[500px] flex flex-col justify-center items-center">
            <div className="text-center">
              <div className="text-6xl mb-4">📚</div>
              <div className="text-xl text-gray-600">단어를 불러오는 중...</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

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

          {/* 즐겨찾기 버튼 */}
          {onToggleFavorite && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onToggleFavorite(word.id)
              }}
              className={`absolute top-6 right-6 z-20 p-2 rounded-full transition-all duration-300 hover:scale-110 ${
                word.is_favorite 
                  ? 'text-yellow-400 bg-yellow-400/20' 
                  : 'text-gray-400 bg-white/10 hover:text-yellow-300 hover:bg-yellow-400/10'
              }`}
            >
              <svg className="w-5 h-5" fill={word.is_favorite ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </button>
          )}

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
              // 앞면: 4개 언어 모두 표시
              <div className="space-y-6">
                {/* 한국어 */}
                <div className="group">
                  <div className="text-sm text-gray-500 mb-2">🇰🇷 한국어</div>
                  <div 
                    className="text-4xl font-bold text-gray-800 mb-4 transition-all duration-300 group-hover:scale-110 cursor-pointer"
                    onClick={() => speakWord(word.korean, 'ko-KR')}
                  >
                    {word.korean}
                  </div>
                </div>

                {/* 영어 */}
                <div className="group">
                  <div className="text-sm text-gray-500 mb-2">🇺🇸 English</div>
                  <div 
                    className="text-3xl font-medium text-gray-700 mb-4 transition-all duration-300 group-hover:scale-110 cursor-pointer"
                    onClick={() => speakWord(word.english, 'en-US')}
                  >
                    {word.english}
                  </div>
                </div>

                {/* 일본어 */}
                <div className="group">
                  <div className="text-sm text-gray-500 mb-2">🇯🇵 日本語</div>
                  <div 
                    className="text-3xl font-medium text-gray-700 mb-4 transition-all duration-300 group-hover:scale-110 cursor-pointer"
                    onClick={() => speakWord(word.japanese, 'ja-JP')}
                  >
                    {word.japanese}
                  </div>
                </div>

                {/* 중국어 */}
                <div className="group">
                  <div className="text-sm text-gray-500 mb-2">🇨🇳 中文</div>
                  <div 
                    className="text-3xl font-medium text-gray-700 mb-4 transition-all duration-300 group-hover:scale-110 cursor-pointer"
                    onClick={() => speakWord(word.chinese, 'zh-CN')}
                  >
                    {word.chinese}
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
              // 뒷면: 4개 언어 비교 및 상세 정보
              <div className="space-y-6">
                <div className="text-2xl font-bold text-gray-800 mb-6">
                  4개 언어 비교
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="font-medium text-gray-700">🇰🇷 한국어</div>
                    <div className="text-gray-600">{word.korean}</div>
                  </div>
                  <div className="space-y-2">
                    <div className="font-medium text-gray-700">🇺🇸 English</div>
                    <div className="text-gray-600">{word.english}</div>
                  </div>
                  <div className="space-y-2">
                    <div className="font-medium text-gray-700">🇯🇵 日本語</div>
                    <div className="text-gray-600">{word.japanese}</div>
                  </div>
                  <div className="space-y-2">
                    <div className="font-medium text-gray-700">🇨🇳 中文</div>
                    <div className="text-gray-600">{word.chinese}</div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex justify-center space-x-4 text-sm text-gray-500">
                    <span>카테고리: {word.category}</span>
                    <span>난이도: {word.difficulty === 'easy' ? '쉬움' : word.difficulty === 'medium' ? '보통' : '어려움'}</span>
                  </div>
                </div>

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

        {/* 네비게이션 버튼 */}
        {onNext && onPrev && (
          <div className="flex justify-center items-center gap-4 mt-6">
            <button
              onClick={onPrev}
              disabled={currentIndex === 0}
              className="group relative px-6 py-3 bg-white/10 backdrop-blur-sm rounded-xl text-white font-semibold transition-all duration-300 hover:bg-white/20 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
            >
              <span className="relative z-10 flex items-center">
                <svg className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                이전
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>

            <div className="text-white text-sm bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
              {currentIndex !== undefined && totalCount !== undefined ? `${currentIndex + 1} / ${totalCount}` : ''}
            </div>

            <button
              onClick={onNext}
              disabled={currentIndex !== undefined && totalCount !== undefined && currentIndex >= totalCount - 1}
              className="group relative px-6 py-3 bg-white/10 backdrop-blur-sm rounded-xl text-white font-semibold transition-all duration-300 hover:bg-white/20 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
            >
              <span className="relative z-10 flex items-center">
                다음
                <svg className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>
        )}

        {/* 그림자 효과 */}
        <div className={`absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-4/5 h-4 bg-black/10 rounded-full blur-xl transition-all duration-500 ${
          isHovered ? 'scale-110 opacity-20' : 'scale-100 opacity-10'
        }`}></div>
      </div>


    </div>
  )
} 