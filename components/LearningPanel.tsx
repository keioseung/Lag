'use client'

import { useState, useEffect } from 'react'
import type { Word, StudyStats } from '@/lib/supabase'
import { apiClient } from '@/lib/api'
import { ChevronLeft, ChevronRight, Shuffle, Target, Clock, Volume2 } from 'lucide-react'

interface LearningPanelProps {
  words: Word[]
  studyStats: StudyStats | null
  onUpdateStats: (updates: Partial<StudyStats>) => Promise<{ success: boolean; error?: any }>
}

type StudyMode = 'flashcard' | 'quiz' | 'typing' | 'listening'
type Difficulty = 'easy' | 'normal' | 'hard'

export default function LearningPanel({ words, studyStats, onUpdateStats }: LearningPanelProps) {
  const [studyMode, setStudyMode] = useState<StudyMode>('flashcard')
  const [difficulty, setDifficulty] = useState<Difficulty>('normal')
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [timer, setTimer] = useState<number | null>(null)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [sessionActive, setSessionActive] = useState(false)

  const currentWord = words[currentCardIndex]

  useEffect(() => {
    if (studyMode === 'quiz' && difficulty === 'hard') {
      startTimer(15)
    } else if (studyMode === 'typing' && difficulty !== 'easy') {
      startTimer(30)
    }
  }, [studyMode, difficulty])

  const startTimer = (seconds: number) => {
    setTimer(seconds)
    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(interval)
          return null
        }
        return prev - 1
      })
    }, 1000)
  }

  const startStudySession = async () => {
    try {
      const response = await apiClient.startStudySession()
      if (response.data) {
        setSessionId(response.data.session_id)
        setSessionActive(true)
        setStartTime(Date.now())
      }
    } catch (error) {
      console.error('학습 세션 시작 오류:', error)
    }
  }

  const endStudySession = async () => {
    if (sessionId) {
      try {
        await apiClient.endStudySession(sessionId)
        setSessionId(null)
        setSessionActive(false)
        setStartTime(null)
      } catch (error) {
        console.error('학습 세션 종료 오류:', error)
      }
    }
  }

  const handleModeChange = async (mode: StudyMode) => {
    setStudyMode(mode)
    setCurrentCardIndex(0)
    setIsFlipped(false)
    
    // 새로운 모드로 변경할 때 학습 세션 시작
    if (!sessionActive) {
      await startStudySession()
    }
  }

  const handleDifficultyChange = (level: Difficulty) => {
    setDifficulty(level)
  }

  const nextCard = () => {
    if (currentCardIndex < words.length - 1) {
      setCurrentCardIndex(prev => prev + 1)
      setIsFlipped(false)
      setTimer(null)
    }
  }

  const previousCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(prev => prev - 1)
      setIsFlipped(false)
      setTimer(null)
    }
  }

  const shuffleWords = () => {
    const shuffled = [...words].sort(() => Math.random() - 0.5)
    // In a real app, you'd update the words array
    setCurrentCardIndex(0)
    setIsFlipped(false)
  }

  const flipCard = () => {
    setIsFlipped(!isFlipped)
    if (!isFlipped) {
      updateStudyProgress(true)
    }
  }

  const updateStudyProgress = async (correct: boolean) => {
    if (!studyStats || !currentWord) return

    // 백엔드 API를 통해 답변 제출
    if (sessionId) {
      try {
        await apiClient.submitAnswer(sessionId, currentWord.id, correct)
      } catch (error) {
        console.error('답변 제출 오류:', error)
      }
    }

    // 로컬 통계 업데이트
    const updates = {
      total_answered: studyStats.total_answered + 1,
      correct_answers: studyStats.correct_answers + (correct ? 1 : 0),
      studied_words: [...new Set([...studyStats.studied_words, currentWord.id.toString()])],
      daily_progress: studyStats.daily_progress + 1
    }

    await onUpdateStats(updates)
  }

  const speakWord = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'en-US'
      utterance.rate = 0.8
      speechSynthesis.speak(utterance)
    }
  }

  if (words.length === 0) {
    return (
      <div className="card">
        <div className="text-center py-12 text-gray-500">
          <h3 className="text-xl font-semibold mb-2">학습할 단어가 없습니다</h3>
          <p>관리자 모드에서 단어를 추가해주세요.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Bar */}
      <div className="card">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600">{words.length}</div>
            <div className="text-sm text-gray-600">총 단어</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600">
              {studyStats?.studied_words.length || 0}
            </div>
            <div className="text-sm text-gray-600">학습한 단어</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600">
              {studyStats?.total_answered ? 
                Math.round((studyStats.correct_answers / studyStats.total_answered) * 100) : 0}%
            </div>
            <div className="text-sm text-gray-600">정확도</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600">
              {studyStats?.daily_progress || 0}/20
            </div>
            <div className="text-sm text-gray-600">일일 목표</div>
          </div>
        </div>
      </div>

      {/* Study Controls */}
      <div className="card">
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={() => handleModeChange('flashcard')}
            className={`px-4 py-2 rounded-full font-semibold transition-colors ${
              studyMode === 'flashcard'
                ? 'bg-primary-500 text-white'
                : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
            }`}
          >
            플래시카드
          </button>
          <button
            onClick={() => handleModeChange('quiz')}
            className={`px-4 py-2 rounded-full font-semibold transition-colors ${
              studyMode === 'quiz'
                ? 'bg-primary-500 text-white'
                : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
            }`}
          >
            퀴즈
          </button>
          <button
            onClick={() => handleModeChange('typing')}
            className={`px-4 py-2 rounded-full font-semibold transition-colors ${
              studyMode === 'typing'
                ? 'bg-primary-500 text-white'
                : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
            }`}
          >
            타이핑 연습
          </button>
          <button
            onClick={() => handleModeChange('listening')}
            className={`px-4 py-2 rounded-full font-semibold transition-colors ${
              studyMode === 'listening'
                ? 'bg-primary-500 text-white'
                : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
            }`}
          >
            듣기 연습
          </button>
          <button
            onClick={shuffleWords}
            className="px-4 py-2 rounded-full font-semibold bg-primary-100 text-primary-700 hover:bg-primary-200 transition-colors"
          >
            <Shuffle size={16} className="inline mr-1" />
            섞기
          </button>
        </div>

        {/* Difficulty Selector */}
        <div className="flex justify-center gap-3 mb-6">
          <button
            onClick={() => handleDifficultyChange('easy')}
            className={`px-4 py-2 rounded-full font-semibold transition-colors ${
              difficulty === 'easy'
                ? 'bg-green-500 text-white'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            쉬움
          </button>
          <button
            onClick={() => handleDifficultyChange('normal')}
            className={`px-4 py-2 rounded-full font-semibold transition-colors ${
              difficulty === 'normal'
                ? 'bg-yellow-500 text-white'
                : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
            }`}
          >
            보통
          </button>
          <button
            onClick={() => handleDifficultyChange('hard')}
            className={`px-4 py-2 rounded-full font-semibold transition-colors ${
              difficulty === 'hard'
                ? 'bg-red-500 text-white'
                : 'bg-red-100 text-red-700 hover:bg-red-200'
            }`}
          >
            어려움
          </button>
        </div>

        {/* Timer */}
        {timer !== null && (
          <div className="text-center mb-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-full">
              <Clock size={16} />
              <span className="font-bold">{timer}초</span>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div
            className="bg-primary-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentCardIndex + 1) / words.length) * 100}%` }}
          />
        </div>

        {/* Study Area */}
        <div className="min-h-[400px] flex items-center justify-center">
          {studyMode === 'flashcard' && (
            <div
              className={`flashcard ${isFlipped ? 'flipped' : ''}`}
              onClick={flipCard}
            >
              <div className="text-4xl font-bold mb-4">
                {isFlipped ? currentWord.meaning : currentWord.original}
              </div>
              <div className="text-xl opacity-70 mb-4">
                {isFlipped ? currentWord.category : currentWord.pronunciation}
              </div>
              <div className="text-sm opacity-60">
                {isFlipped ? '클릭해서 앞면 보기' : '클릭해서 뜻 보기'}
              </div>
              {!isFlipped && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    speakWord(currentWord.original)
                  }}
                  className="mt-4 p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                >
                  <Volume2 size={20} />
                </button>
              )}
            </div>
          )}

          {studyMode === 'quiz' && (
            <div className="flashcard">
              <div className="text-4xl font-bold mb-4">{currentWord.original}</div>
              <div className="text-xl opacity-70 mb-6">{currentWord.pronunciation}</div>
              <div className="grid grid-cols-2 gap-4">
                {[currentWord.meaning, '잘못된 답 1', '잘못된 답 2', '잘못된 답 3']
                  .sort(() => Math.random() - 0.5)
                  .map((option, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        const correct = option === currentWord.meaning
                        updateStudyProgress(correct)
                        setTimeout(nextCard, 1000)
                      }}
                      className="p-4 bg-primary-100 text-primary-700 rounded-xl hover:bg-primary-200 transition-colors font-semibold"
                    >
                      {option}
                    </button>
                  ))}
              </div>
            </div>
          )}

          {studyMode === 'typing' && (
            <div className="flashcard">
              <div className="text-4xl font-bold mb-4">{currentWord.meaning}</div>
              <div className="text-xl opacity-70 mb-6">{currentWord.pronunciation}</div>
              <input
                type="text"
                placeholder="여기에 입력하세요"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none text-center text-lg"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const input = e.currentTarget.value.trim().toLowerCase()
                    const correct = input === currentWord.original.toLowerCase()
                    updateStudyProgress(correct)
                    e.currentTarget.value = ''
                    setTimeout(nextCard, 1000)
                  }
                }}
              />
            </div>
          )}

          {studyMode === 'listening' && (
            <div className="flashcard">
              <div className="text-4xl font-bold mb-4">{currentWord.meaning}</div>
              <div className="text-xl opacity-70 mb-4">듣고 맞는 단어를 선택하세요</div>
              <button
                onClick={() => speakWord(currentWord.original)}
                className="mb-6 p-3 bg-primary-100 text-primary-700 rounded-full hover:bg-primary-200 transition-colors"
              >
                <Volume2 size={24} />
              </button>
              <div className="grid grid-cols-2 gap-4">
                {[currentWord.original, '잘못된 답 1', '잘못된 답 2', '잘못된 답 3']
                  .sort(() => Math.random() - 0.5)
                  .map((option, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        const correct = option === currentWord.original
                        updateStudyProgress(correct)
                        setTimeout(nextCard, 1000)
                      }}
                      className="p-4 bg-primary-100 text-primary-700 rounded-xl hover:bg-primary-200 transition-colors font-semibold"
                    >
                      {option}
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={previousCard}
            disabled={currentCardIndex === 0}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={20} className="inline mr-2" />
            이전
          </button>
          <button
            onClick={nextCard}
            disabled={currentCardIndex === words.length - 1}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            다음
            <ChevronRight size={20} className="inline ml-2" />
          </button>
        </div>
      </div>
    </div>
  )
} 