'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import FlashcardDisplay from '@/components/FlashcardDisplay'
import AdminPanel from '@/components/AdminPanel'

// 4개 언어 학습을 위한 새로운 타입 정의
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

export default function Home() {
  const [words, setWords] = useState<MultiLanguageWord[]>([])
  const [loading, setLoading] = useState(true)
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [isFlipping, setIsFlipping] = useState(false)
  const [isAdminMode, setIsAdminMode] = useState(false)
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [filteredWords, setFilteredWords] = useState<MultiLanguageWord[]>([])
  const [showAdminLogin, setShowAdminLogin] = useState(false)
  const [adminPassword, setAdminPassword] = useState('')
  const [adminLoginError, setAdminLoginError] = useState('')
  const [isAutoPlay, setIsAutoPlay] = useState(false)
  const [autoPlayInterval, setAutoPlayInterval] = useState<NodeJS.Timeout | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [availableDates, setAvailableDates] = useState<string[]>([])

  // 로컬 스토리지에서 단어 데이터 로드
  useEffect(() => {
    loadWordsFromLocalStorage()
  }, [])

  // 필터링된 단어 목록 업데이트
  useEffect(() => {
    let filtered = words
    
    // 날짜 필터 적용
    if (selectedDate) {
      filtered = filtered.filter(word => word.createdDate === selectedDate)
    }
    
    // 즐겨찾기 필터 적용
    if (showFavoritesOnly) {
      filtered = filtered.filter(word => word.isFavorite)
    }
    
    setFilteredWords(filtered)
    
    // 필터 변경 시 첫 번째 단어로 리셋
    if (filtered.length > 0) {
      setCurrentWordIndex(0)
    }
  }, [words, showFavoritesOnly, selectedDate])

  // 사용 가능한 날짜 목록 업데이트
  useEffect(() => {
    const dates = [...new Set(words.map(word => word.createdDate).filter(Boolean))].sort()
    setAvailableDates(dates)
  }, [words])

  // 로컬 스토리지에서 단어 로드
  const loadWordsFromLocalStorage = () => {
    try {
      setLoading(true)
      const storedWords = localStorage.getItem('multiLanguageWords')
      if (storedWords) {
        const parsedWords = JSON.parse(storedWords)
        // 하루가 지난 데이터는 제거
        const today = new Date().toISOString().split('T')[0]
        const validWords = parsedWords.filter((word: MultiLanguageWord) => 
          word.createdDate === today
        )
        setWords(validWords)
        
        // 하루가 지난 데이터는 로컬 스토리지에서도 제거
        if (validWords.length !== parsedWords.length) {
          localStorage.setItem('multiLanguageWords', JSON.stringify(validWords))
        }
      } else {
        // 샘플 데이터로 시작
        const sampleWords: MultiLanguageWord[] = [
          {
            id: '1',
            korean: '안녕하세요',
            english: 'Hello',
            japanese: 'こんにちは',
            chinese: '你好',
            category: '인사말',
            difficulty: 'easy',
            createdDate: new Date().toISOString().split('T')[0],
            isFavorite: false
          },
          {
            id: '2',
            korean: '감사합니다',
            english: 'Thank you',
            japanese: 'ありがとうございます',
            chinese: '谢谢',
            category: '인사말',
            difficulty: 'easy',
            createdDate: new Date().toISOString().split('T')[0],
            isFavorite: false
          }
        ]
        setWords(sampleWords)
        localStorage.setItem('multiLanguageWords', JSON.stringify(sampleWords))
      }
    } catch (error) {
      console.error('로컬 스토리지 로드 오류:', error)
      setWords([])
    } finally {
      setLoading(false)
    }
  }

  // 날짜 선택 핸들러
  const handleDateSelect = (date: string | null) => {
    setSelectedDate(date)
  }

  // 자동재생 기능
  useEffect(() => {
    if (isAutoPlay && filteredWords.length > 0) {
      const interval = setInterval(() => {
        nextCard()
      }, 3000) // 3초마다 다음 카드로
      setAutoPlayInterval(interval)
      
      return () => {
        if (interval) clearInterval(interval)
      }
    } else {
      if (autoPlayInterval) {
        clearInterval(autoPlayInterval)
        setAutoPlayInterval(null)
      }
    }
  }, [isAutoPlay, filteredWords.length])

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

  // 즐겨찾기 토글
  const toggleFavorite = (wordId: string) => {
    const updatedWords = words.map(word => 
      word.id === wordId ? { ...word, isFavorite: !word.isFavorite } : word
    )
    setWords(updatedWords)
    localStorage.setItem('multiLanguageWords', JSON.stringify(updatedWords))
  }

  // 카드 뒤집기
  const flipCard = () => {
    if (isFlipping) return
    setIsFlipping(true)
    setShowAnswer(!showAnswer)
    setTimeout(() => setIsFlipping(false), 300)
  }

  // 다음 카드
  const nextCard = () => {
    if (filteredWords.length === 0) return
    setShowAnswer(false)
    setCurrentWordIndex((prev) => 
      prev === filteredWords.length - 1 ? 0 : prev + 1
    )
  }

  // 이전 카드
  const prevCard = () => {
    if (filteredWords.length === 0) return
    setShowAnswer(false)
    setCurrentWordIndex((prev) => 
      prev === 0 ? filteredWords.length - 1 : prev - 1
    )
  }
            },
            {
              id: 2,
              original: '谢谢',
              pronunciation: 'xiè xie',
              meaning: '감사합니다',
              category: '인사말',
              priority: 1,
              mastery_level: 1.5,
              times_studied: 3,
              correct_attempts: 2,
              total_attempts: 3,
              is_active: true,
              review_count: 1,
              last_reviewed: '2024-01-14',
              added_date: '2024-01-01',
              created_at: '2024-01-01T00:00:00Z',
              updated_at: '2024-01-14T00:00:00Z',
              difficulty_level: 1,
              tags: ['기초', '인사'],
              notes: '감사 표현',
              total_study_time: 180,
              average_accuracy: 0.67,
              last_study_date: '2024-01-14',
              is_favorite: true,
              study_date: '2024-01-14'
            }
          ])
        }
      } else {
        setWords(response.data || [])
      }
    } catch (error) {
      console.error('단어 로드 오류:', error)
      // 에러 발생 시 샘플 데이터 사용
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
          is_active: true,
          review_count: 2,
          last_reviewed: '2024-01-15',
          added_date: '2024-01-01',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-15T00:00:00Z',
          difficulty_level: 1,
          tags: ['기초', '인사'],
          notes: '가장 기본적인 인사말',
          total_study_time: 300,
          average_accuracy: 0.8,
          last_study_date: '2024-01-15',
          is_favorite: false,
          study_date: '2024-01-15'
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const loadStudyStats = async () => {
    try {
      const response = await apiClient.getStudyStats()
      
      if (response.error) {
        console.error('백엔드 API 오류:', response.error)
        if (supabase) {
          const { data, error } = await supabase
            .from('study_stats')
            .select('*')
            .single()
          
          if (error && error.code !== 'PGRST116') throw error
          setStudyStats(data || {
            id: 1,
            daily_streak: 0,
            total_answered: 0,
            correct_answers: 0,
            total_study_time: 0,
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
      setStudyStats({
        id: 1,
        daily_streak: 0,
        total_answered: 0,
        correct_answers: 0,
        total_study_time: 0,
        last_study_date: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    }
  }

  const flipCard = () => {
    if (isFlipping || filteredWords.length === 0) return
    setIsFlipping(true)
    setShowAnswer(!showAnswer)
    setTimeout(() => setIsFlipping(false), 300)
  }

  const nextCard = () => {
    if (isFlipping || filteredWords.length === 0) return
    setShowAnswer(false)
    setCurrentWordIndex((prev) => 
      prev === filteredWords.length - 1 ? 0 : prev + 1
    )
  }

  const prevCard = () => {
    if (isFlipping || filteredWords.length === 0) return
    setShowAnswer(false)
    setCurrentWordIndex((prev) => 
      prev === 0 ? filteredWords.length - 1 : prev - 1
    )
  }

  const toggleAutoPlay = () => {
    setIsAutoPlay(!isAutoPlay)
  }

  const toggleFavorite = async (wordId: number) => {
    try {
      const word = words.find(w => w.id === wordId)
      if (!word) return

      const updatedWord = { ...word, is_favorite: !word.is_favorite }
      
      // 백엔드 API를 통해 업데이트
      const response = await apiClient.updateWord(wordId, updatedWord)
      
      if (response.error) {
        console.error('백엔드 API 오류:', response.error)
        // 백엔드 API 실패 시 Supabase 직접 사용
        if (supabase) {
          const { error } = await supabase
            .from('words')
            .update({ is_favorite: updatedWord.is_favorite })
            .eq('id', wordId)
          
          if (error) throw error
        }
      }
      
      setWords(prev => prev.map(w => 
        w.id === wordId ? { ...w, is_favorite: !w.is_favorite } : w
      ))
    } catch (error) {
      console.error('즐겨찾기 토글 오류:', error)
    }
  }

  const handleAdminLogin = () => {
    if (adminPassword === '123321') {
      setIsAdminMode(true)
      setShowAdminLogin(false)
      setAdminPassword('')
      setAdminLoginError('')
    } else {
      setAdminLoginError('비밀번호가 올바르지 않습니다.')
    }
  }

  const handleBackToLearning = () => {
    setIsAdminMode(false)
    setShowAdminLogin(false)
    setAdminPassword('')
    setAdminLoginError('')
  }

  const currentWord = filteredWords[currentWordIndex] || null

  if (isAdminMode) {
    return <AdminPanel onBackToLearning={handleBackToLearning} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <Header debugInfo={debugInfo} />
      
      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-white text-lg">단어를 불러오는 중...</p>
            </div>
          </div>
        ) : filteredWords.length === 0 ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="text-6xl mb-4">📚</div>
              <p className="text-white text-xl mb-4">등록된 단어가 없습니다</p>
              <button
                onClick={() => setShowAdminLogin(true)}
                className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:from-purple-600 hover:to-blue-600 hover:scale-105"
              >
                관리자 모드로 단어 추가하기
              </button>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            {/* 날짜 선택 */}
            <div className="mb-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                  <span className="text-xl mr-2">📅</span>
                  학습 날짜 선택
                </h3>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => handleDateSelect(null)}
                    className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${
                      selectedDate === null
                        ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                        : 'bg-white/10 text-gray-300 hover:text-white hover:bg-white/20'
                    }`}
                  >
                    모든 날짜
                  </button>
                  {availableDates.map((date) => (
                    <button
                      key={date}
                      onClick={() => handleDateSelect(date)}
                      className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${
                        selectedDate === date
                          ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                          : 'bg-white/10 text-gray-300 hover:text-white hover:bg-white/20'
                      }`}
                    >
                      {new Date(date).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 필터 버튼 */}
            <div className="flex justify-center items-center gap-4 mb-8">
              <button
                onClick={() => setShowFavoritesOnly(false)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  !showFavoritesOnly
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                    : 'bg-white/10 text-gray-300 hover:text-white hover:bg-white/20'
                }`}
              >
                모든 단어
              </button>
              <button
                onClick={() => setShowFavoritesOnly(true)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center ${
                  showFavoritesOnly
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                    : 'bg-white/10 text-gray-300 hover:text-white hover:bg-white/20'
                }`}
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                즐겨찾기
              </button>
            </div>

            {/* 진행률 표시 */}
            <div className="flex justify-center mb-8">
              <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 text-white">
                <span className="text-sm font-medium">
                  {currentWordIndex + 1} / {filteredWords.length}
                </span>
                <div className="ml-4 w-32 bg-white/20 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-400 to-blue-400 h-2 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${filteredWords.length > 0 ? ((currentWordIndex + 1) / filteredWords.length) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* 플래시카드 */}
            {currentWord && (
              <FlashcardDisplay
                word={currentWord}
                showAnswer={showAnswer}
                isFlipping={isFlipping}
                onFlip={flipCard}
                onToggleFavorite={toggleFavorite}
              />
            )}

            {/* 컨트롤 버튼 */}
            <div className="flex justify-center items-center gap-4 mt-12">
              <button
                onClick={prevCard}
                disabled={isFlipping || filteredWords.length === 0}
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
                onClick={toggleAutoPlay}
                disabled={filteredWords.length === 0}
                className={`group relative px-8 py-4 rounded-2xl font-semibold transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden ${
                  isAutoPlay 
                    ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg' 
                    : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                }`}
              >
                <span className="relative z-10 flex items-center">
                  {isAutoPlay ? (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      정지
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      자동재생
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
              </button>

              <button
                onClick={nextCard}
                disabled={isFlipping || filteredWords.length === 0}
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

            {/* 관리자 로그인 모달 */}
            {showAdminLogin && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 max-w-md w-full">
                  <h2 className="text-2xl font-bold text-white mb-6 text-center">🔐 관리자 로그인</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        비밀번호
                      </label>
                      <input
                        type="password"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
                        placeholder="비밀번호를 입력하세요"
                        className="w-full bg-white/5 border border-white/20 rounded-xl p-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    
                    {adminLoginError && (
                      <div className="text-red-400 text-sm text-center">
                        {adminLoginError}
                      </div>
                    )}
                    
                    <div className="flex gap-3">
                      <button
                        onClick={handleAdminLogin}
                        className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:from-purple-600 hover:to-blue-600 hover:scale-105"
                      >
                        로그인
                      </button>
                      <button
                        onClick={() => setShowAdminLogin(false)}
                        className="flex-1 bg-white/10 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:bg-white/20"
                      >
                        취소
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 관리자 모드 버튼 */}
            <div className="flex justify-center mt-8">
              <button
                onClick={() => setShowAdminLogin(true)}
                className="bg-white/10 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:bg-white/20 border border-white/20"
              >
                🔧 관리자 모드
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
} 