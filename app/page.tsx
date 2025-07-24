'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { apiClient } from '@/lib/api'
import type { Word, StudyStats } from '@/lib/supabase'
import Header from '@/components/Header'
import FlashcardDisplay from '@/components/FlashcardDisplay'

export default function Home() {
  const [words, setWords] = useState<Word[]>([])
  const [studyStats, setStudyStats] = useState<StudyStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [isFlipping, setIsFlipping] = useState(false)

  useEffect(() => {
    loadWords()
    loadStudyStats()
  }, [])

  // 키보드 단축키 추가
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (isFlipping) return
      
      switch (event.key) {
        case ' ':
        case 'Enter':
          event.preventDefault()
          flipCard()
          break
        case 'ArrowLeft':
          event.preventDefault()
          prevCard()
          break
        case 'ArrowRight':
          event.preventDefault()
          nextCard()
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [isFlipping])

  const loadWords = async () => {
    try {
      // 백엔드 API를 통해 단어 데이터 로드
      const response = await apiClient.getWords()
      
      if (response.error) {
        console.error('백엔드 API 오류:', response.error)
        // 백엔드 API 실패 시 Supabase 직접 사용 시도
        if (supabase) {
          const { data, error } = await supabase
            .from('words')
            .select('*')
            .order('created_at', { ascending: false })
          
          if (error) throw error
          setWords(data || [])
        } else {
          // 모든 방법 실패 시 샘플 데이터 사용
          setWords([
            {
              id: 1,
              original: '你好',
              pronunciation: 'nǐ hǎo',
              meaning: '안녕하세요',
              category: '인사말',
              priority: 1,
              mastery_level: 2.0,
              times_studied: 5,
              correct_attempts: 4,
              total_attempts: 5,
              added_date: '2024-01-01',
              difficulty_level: 1,
              is_active: true,
              tags: ['기초', '인사'],
              notes: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              id: 2,
              original: '谢谢',
              pronunciation: 'xiè xie',
              meaning: '감사합니다',
              category: '인사말',
              priority: 0,
              mastery_level: 3.0,
              times_studied: 8,
              correct_attempts: 7,
              total_attempts: 8,
              added_date: '2024-01-01',
              difficulty_level: 1,
              is_active: true,
              tags: ['기초', '인사'],
              notes: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              id: 3,
              original: '再见',
              pronunciation: 'zài jiàn',
              meaning: '안녕히 가세요',
              category: '인사말',
              priority: 1,
              mastery_level: 1.5,
              times_studied: 3,
              correct_attempts: 2,
              total_attempts: 3,
              added_date: '2024-01-01',
              difficulty_level: 1,
              is_active: true,
              tags: ['기초', '인사'],
              notes: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ])
        }
      } else {
        setWords(response.data || [])
      }
    } catch (error) {
      console.error('단어 로드 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadStudyStats = async () => {
    try {
      // 백엔드 API를 통해 학습 통계 로드
      const response = await apiClient.getStudyStats()
      
      if (response.error) {
        console.error('백엔드 API 오류:', response.error)
        // 백엔드 API 실패 시 Supabase 직접 사용 시도
        if (supabase) {
          const { data, error } = await supabase
            .from('study_stats')
            .select('*')
            .single()
          
          if (error && error.code !== 'PGRST116') throw error
          setStudyStats(data)
        } else {
          // 모든 방법 실패 시 기본 통계 사용
          setStudyStats({
            id: 1,
            total_answered: 0,
            correct_answers: 0,
            studied_words: [],
            weak_words: [],
            daily_streak: 0,
            daily_goal: 20,
            daily_progress: 0,
            words_per_minute: 0,
            total_study_time: 0,
            average_accuracy: 0,
            last_study_date: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
        }
      } else {
        setStudyStats(response.data)
      }
    } catch (error) {
      console.error('학습 통계 로드 오류:', error)
    }
  }

  const flipCard = () => {
    if (isFlipping) return
    setIsFlipping(true)
    setShowAnswer(!showAnswer)
    setTimeout(() => setIsFlipping(false), 300)
  }

  const nextCard = () => {
    if (isFlipping) return
    setIsFlipping(true)
    setShowAnswer(false)
    setCurrentWordIndex((prev) => (prev + 1) % words.length)
    setTimeout(() => setIsFlipping(false), 300)
  }

  const prevCard = () => {
    if (isFlipping) return
    setIsFlipping(true)
    setShowAnswer(false)
    setCurrentWordIndex((prev) => (prev - 1 + words.length) % words.length)
    setTimeout(() => setIsFlipping(false), 300)
  }

  const currentWord = words[currentWordIndex]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg font-medium">중국어 단어를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {words.length === 0 ? (
          <div className="text-center py-20">
            <div className="animate-bounce mb-8">
              <div className="text-6xl">📚</div>
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">학습할 단어가 없습니다</h2>
            <p className="text-gray-300 text-lg">관리자가 단어를 추가하면 여기서 학습할 수 있습니다.</p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            {/* 진행률 표시 */}
            <div className="mb-8 text-center">
              <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 text-white">
                <span className="text-sm font-medium">
                  {currentWordIndex + 1} / {words.length}
                </span>
                <div className="ml-4 w-32 bg-white/20 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-400 to-blue-400 h-2 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${((currentWordIndex + 1) / words.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* 플래시카드 */}
            <FlashcardDisplay
              word={currentWord}
              showAnswer={showAnswer}
              isFlipping={isFlipping}
              onFlip={flipCard}
            />

            {/* 컨트롤 버튼 */}
            <div className="flex justify-center items-center gap-6 mt-12">
              <button
                onClick={prevCard}
                disabled={isFlipping}
                className="group relative px-8 py-4 bg-white/10 backdrop-blur-sm rounded-2xl text-white font-semibold transition-all duration-300 hover:bg-white/20 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
              >
                <span className="relative z-10 flex items-center">
                  <svg className="w-5 h-5 mr-2 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  이전
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>

              <button
                onClick={flipCard}
                disabled={isFlipping}
                className="group relative px-12 py-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl text-white font-semibold transition-all duration-300 hover:from-purple-600 hover:to-blue-600 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                <span className="relative z-10 flex items-center">
                  <svg className="w-5 h-5 mr-2 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  뒤집기
                </span>
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
              </button>

              <button
                onClick={nextCard}
                disabled={isFlipping}
                className="group relative px-8 py-4 bg-white/10 backdrop-blur-sm rounded-2xl text-white font-semibold transition-all duration-300 hover:bg-white/20 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
              >
                <span className="relative z-10 flex items-center">
                  다음
                  <svg className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>

            {/* 학습 통계 */}
            {studyStats && (
              <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center text-white">
                  <div className="text-3xl font-bold text-purple-300 mb-2">{studyStats.daily_streak}</div>
                  <div className="text-sm text-gray-300">연속 학습일</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center text-white">
                  <div className="text-3xl font-bold text-blue-300 mb-2">{studyStats.total_answered}</div>
                  <div className="text-sm text-gray-300">총 학습 단어</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center text-white">
                  <div className="text-3xl font-bold text-green-300 mb-2">
                    {studyStats.total_answered > 0 ? Math.round((studyStats.correct_answers / studyStats.total_answered) * 100) : 0}%
                  </div>
                  <div className="text-sm text-gray-300">정답률</div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
} 