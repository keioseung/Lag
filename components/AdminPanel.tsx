'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { apiClient } from '@/lib/api'
import type { Word } from '@/lib/supabase'

interface ParsedWord {
  original: string
  pronunciation: string
  meaning: string
  category: string
}

interface AdminPanelProps {
  onBackToLearning?: () => void
}

export default function AdminPanel({ onBackToLearning }: AdminPanelProps) {
  const [words, setWords] = useState<Word[]>([])
  const [loading, setLoading] = useState(true)
  const [bulkInput, setBulkInput] = useState('')
  const [parsedWords, setParsedWords] = useState<ParsedWord[]>([])
  const [isParsing, setIsParsing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [activeTab, setActiveTab] = useState<'input' | 'list' | 'stats' | 'logs'>('input')
  const [stats, setStats] = useState({
    total: 0,
    categories: {} as Record<string, number>,
    dateStats: {} as Record<string, number>
  })
  const [showUserLogs, setShowUserLogs] = useState(false)
  const [userLogs, setUserLogs] = useState<any[]>([])
  const [logsLoading, setLogsLoading] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]) // 날짜 선택 상태 추가

  useEffect(() => {
    loadWords()
  }, [])

  const loadWords = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getWords()
      
      if (response.error) {
        console.error('백엔드 API 오류:', response.error)
        if (supabase) {
          const { data, error } = await supabase
            .from('words')
            .select('*')
            .order('created_at', { ascending: false })
          
          if (error) throw error
          setWords(data || [])
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

  const parseChineseInput = (input: string): ParsedWord[] => {
    const lines = input.trim().split('\n').filter(line => line.trim())
    const parsed: ParsedWord[] = []
    const seenWords = new Set<string>() // 중복 단어 체크용
    
    // 헤더 행과 구분선 제거
    const filteredLines = lines.filter(line => {
      // 구분선 제거
      if (line.includes('---')) return false
      
      // 헤더 행 제거 (다양한 헤더 패턴)
      if (line.includes('|') && (
        line.includes('한자') || 
        line.includes('중국어') || 
        line.includes('단어') ||
        line.includes('한국어') ||
        line.includes('발음') ||
        line.includes('의미') ||
        line.includes('뜻') ||
        line.includes('표기') ||
        line.includes('---') ||
        line.includes('中国어') ||
        line.includes('단어')
      )) return false
      
      return true
    })
    
    for (const line of filteredLines) {
      // 파이프(|)로 구분된 테이블 행 처리
      if (line.includes('|')) {
        const parts = line.split('|').map(part => part.trim()).filter(part => part)
        
        if (parts.length >= 3) {
          // 첫 번째 열이 한자/단어, 두 번째 열이 발음, 세 번째 열이 의미
          let original = parts[0]
          let pronunciation = parts[1]
          let meaning = parts[2]
          const category = parts[3] || '중국어'
          
          // 특수문자 및 불필요한 문자 제거
          original = original.replace(/["""]/g, '').trim()
          pronunciation = pronunciation.replace(/["""]/g, '').trim()
          meaning = meaning.replace(/["""]/g, '').trim()
          
          // 의미가 있는 데이터만 추가 (빈 문자열이나 구두점만 있는 경우 제외)
          if (original && pronunciation && meaning && 
              original.length > 0 && pronunciation.length > 0 && meaning.length > 0 &&
              !original.match(/^[^\w\s]*$/) && 
              !pronunciation.match(/^[^\w\s]*$/) && 
              !meaning.match(/^[^\w\s]*$/) &&
              !original.match(/^[0-9\s\-\.]+$/) && // 숫자나 구두점만 있는 경우 제외
              !pronunciation.match(/^[0-9\s\-\.]+$/) &&
              !meaning.match(/^[0-9\s\-\.]+$/)) {
            
            // 중복 체크
            const wordKey = `${original}-${pronunciation}`
            if (!seenWords.has(wordKey)) {
              seenWords.add(wordKey)
              parsed.push({ original, pronunciation, meaning, category })
            }
          }
        }
      } else {
        // 탭으로 구분된 행 처리
        const parts = line.split('\t').map(part => part.trim()).filter(part => part)
        
        if (parts.length >= 3) {
          let original = parts[0]
          let pronunciation = parts[1]
          let meaning = parts[2]
          const category = parts[3] || '중국어'
          
          // 특수문자 및 불필요한 문자 제거
          original = original.replace(/["""]/g, '').trim()
          pronunciation = pronunciation.replace(/["""]/g, '').trim()
          meaning = meaning.replace(/["""]/g, '').trim()
          
          // 의미가 있는 데이터만 추가
          if (original && pronunciation && meaning && 
              original.length > 0 && pronunciation.length > 0 && meaning.length > 0 &&
              !original.match(/^[^\w\s]*$/) && 
              !pronunciation.match(/^[^\w\s]*$/) && 
              !meaning.match(/^[^\w\s]*$/) &&
              !original.match(/^[0-9\s\-\.]+$/) &&
              !pronunciation.match(/^[0-9\s\-\.]+$/) &&
              !meaning.match(/^[0-9\s\-\.]+$/)) {
            
            // 중복 체크
            const wordKey = `${original}-${pronunciation}`
            if (!seenWords.has(wordKey)) {
              seenWords.add(wordKey)
              parsed.push({ original, pronunciation, meaning, category })
            }
          }
        }
      }
    }
    
    return parsed
  }

  const handleParse = () => {
    setIsParsing(true)
    setTimeout(() => {
      const parsed = parseChineseInput(bulkInput)
      setParsedWords(parsed)
      setShowPreview(true)
      setIsParsing(false)
    }, 500)
  }

  const handleSaveAll = async () => {
    if (parsedWords.length === 0) return
    
    setIsSaving(true)
    let successCount = 0
    let errorCount = 0
    
    for (const word of parsedWords) {
      try {
        console.log('저장 중인 단어:', word)
        
        const wordData = {
          original: word.original,
          pronunciation: word.pronunciation,
          meaning: word.meaning,
          category: word.category,
          priority: 0,
          mastery_level: 0,
          is_active: true,
          review_count: 0,
          last_reviewed: null,
          study_date: selectedDate, // 선택된 날짜 추가
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        
        console.log('전송할 데이터:', wordData)
        
        // Supabase에 직접 저장 시도
        if (supabase) {
          try {
            console.log('Supabase 저장 시도 중...')
            const { data, error } = await supabase
              .from('words')
              .insert([wordData])
              .select()
            
            if (error) {
              console.log('Supabase 저장 오류:', error)
              console.log('Supabase 저장 실패, 백엔드 API 시도:', error)
              
              // 백엔드 API로 재시도
              console.log('백엔드 API 저장 시도 중...')
              const apiResult = await apiClient.createWord(wordData)
              if (apiResult.error) {
                console.log('백엔드 API 오류:', apiResult.error)
                throw new Error(`저장 실패: ${apiResult.error}`)
              }
            } else {
              console.log('Supabase 저장 성공:', data[0])
              successCount++
              continue // 성공하면 다음 단어로
            }
          } catch (supabaseError) {
            console.error('Supabase 저장 실패, 백엔드 API 시도:', supabaseError)
          }
        } else {
          console.log('Supabase 클라이언트가 없습니다. 백엔드 API만 사용합니다.')
        }

        // Supabase 실패 시 백엔드 API 시도
        console.log('백엔드 API 저장 시도 중...')
        const response = await apiClient.createWord(wordData)
        
        if (response.error) {
          console.error('백엔드 API 오류:', response.error)
          errorCount++
        } else {
          console.log('백엔드 API 저장 성공:', response.data)
          successCount++
        }
      } catch (error) {
        console.error('단어 저장 오류:', error)
        errorCount++
      }
    }

    setIsSaving(false)
    
    console.log(`저장 완료 - 성공: ${successCount}, 실패: ${errorCount}`)
    
    if (successCount > 0) {
      setBulkInput('')
      setParsedWords([])
      setShowPreview(false)
      console.log('단어 목록 새로고침 중...')
      await loadWords()
      console.log('단어 목록 새로고침 완료')
    }

    // 결과 알림
    const message = `저장 완료: ${successCount}개 성공${errorCount > 0 ? `, ${errorCount}개 실패` : ''}`
    showNotification(message, successCount > 0 ? 'success' : 'error')
  }

  const showNotification = (message: string, type: 'success' | 'error') => {
    const notification = document.createElement('div')
    notification.className = `fixed top-4 left-4 right-4 z-50 px-6 py-4 rounded-2xl text-white font-semibold shadow-2xl transform transition-all duration-500 ${
      type === 'success' ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-red-500 to-pink-500'
    }`
    notification.textContent = message
    
    document.body.appendChild(notification)
    
    setTimeout(() => {
      notification.style.transform = 'translateY(-100%)'
      setTimeout(() => document.body.removeChild(notification), 500)
    }, 3000)
  }

  const deleteWord = async (id: number) => {
    try {
      const response = await apiClient.deleteWord(id)
      
      if (response.error) {
        console.error('백엔드 API 오류:', response.error)
        if (supabase) {
          const { error } = await supabase
            .from('words')
            .delete()
            .eq('id', id)
          
          if (error) throw error
        }
      }
      
      setWords(prev => prev.filter(word => word.id !== id))
      showNotification('단어가 삭제되었습니다', 'success')
    } catch (error) {
      console.error('단어 삭제 오류:', error)
      showNotification('삭제 중 오류가 발생했습니다', 'error')
    }
  }

  const loadUserLogs = async () => {
    try {
      setLogsLoading(true)
      
      // 백엔드 API를 통해 사용자 로그 로드
      const response = await apiClient.getUserLogs()
      
      if (response.error) {
        console.error('백엔드 API 오류:', response.error)
        if (supabase) {
          const { data, error } = await supabase
            .from('user_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50)
          
          if (error) throw error
          setUserLogs(data || [])
        }
      } else {
        setUserLogs(response.data || [])
      }
    } catch (error) {
      console.error('사용자 로그 로드 오류:', error)
    } finally {
      setLogsLoading(false)
    }
  }

  // 통계 계산
  useEffect(() => {
    const categories = words.reduce((acc, word) => {
      acc[word.category] = (acc[word.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    // 날짜별 통계 계산
    const dateStats = words.reduce((acc, word) => {
      if (word.study_date) {
        acc[word.study_date] = (acc[word.study_date] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)
    
    setStats({
      total: words.length,
      categories,
      dateStats // 날짜별 통계 추가
    })
  }, [words])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            📚 관리자 패널
          </h1>
          <p className="text-gray-300 text-base md:text-lg mb-6">중국어 단어 관리 및 일괄 입력</p>
          
          {onBackToLearning && (
            <button
              onClick={onBackToLearning}
              className="group relative bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-300 hover:from-purple-600 hover:to-blue-600 hover:scale-105 flex items-center mx-auto shadow-lg"
            >
              <svg className="w-5 h-5 mr-2 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              학습 모드로 돌아가기
            </button>
          )}
        </div>

        {/* 모바일 탭 네비게이션 */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-2 mb-6 border border-white/20 mobile-tab-nav">
          <div className="grid grid-cols-4 gap-2">
            {[
              { id: 'input', label: '입력', icon: '📝' },
              { id: 'list', label: '목록', icon: '📚' },
              { id: 'stats', label: '통계', icon: '📊' },
              { id: 'logs', label: '로그', icon: '📋' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`touch-feedback flex flex-col items-center py-3 px-2 rounded-xl transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg animate-bounce-in'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <span className="text-lg mb-1">{tab.icon}</span>
                <span className="text-xs font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 탭 컨텐츠 */}
        <div className="space-y-6">
          {/* 입력 탭 */}
          {activeTab === 'input' && (
            <div className="space-y-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <h2 className="text-xl md:text-2xl font-bold text-white mb-6 flex items-center">
                  <span className="text-2xl mr-3">📝</span>
                  일괄 단어 입력
                </h2>
                
                <div className="space-y-4">
                  {/* 날짜 선택 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      학습 날짜 선택
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full bg-white/5 border border-white/20 rounded-xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      입력 형식: 중국어글자 탭 발음 탭 의미 탭 카테고리 (또는 테이블 형식)
                    </label>
                    <textarea
                      value={bulkInput}
                      onChange={(e) => setBulkInput(e.target.value)}
                      placeholder={`# 탭으로 구분된 형식:
你好\tnǐ hǎo\t안녕하세요\t인사말
谢谢\txiè xie\t감사합니다\t인사말

# 또는 테이블 형식:
| 중국어 단어 | 한국어 발음 | 의미 |
| --- | --- | --- |
| 在 | 짜이 | ~에 있다, ~에서 |
| 一个 | 이거 | 하나의 |`}
                      className="w-full h-48 md:h-64 bg-white/5 border border-white/20 rounded-xl p-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-sm md:text-base"
                    />
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={handleParse}
                      disabled={!bulkInput.trim() || isParsing}
                      className="touch-feedback flex-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-4 rounded-xl font-semibold transition-all duration-300 hover:from-purple-600 hover:to-blue-600 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg"
                    >
                      {isParsing ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          파싱 중...
                        </>
                      ) : (
                        <>
                          <span className="text-lg mr-2">👁️</span>
                          미리보기
                        </>
                      )}
                    </button>
                    
                    {showPreview && (
                      <button
                        onClick={handleSaveAll}
                        disabled={parsedWords.length === 0 || isSaving}
                        className="touch-feedback flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-4 rounded-xl font-semibold transition-all duration-300 hover:from-green-600 hover:to-emerald-600 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg"
                      >
                        {isSaving ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            저장 중...
                          </>
                        ) : (
                          <>
                            <span className="text-lg mr-2">💾</span>
                            모두 저장 ({parsedWords.length}개)
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* 미리보기 */}
              {showPreview && parsedWords.length > 0 && (
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 animate-scale-in">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                    <span className="text-xl mr-2">👁️</span>
                    미리보기 ({parsedWords.length}개) - {selectedDate}
                  </h3>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {parsedWords.map((word, index) => (
                      <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl font-bold text-purple-300">{word.original}</span>
                            <div className="text-sm text-gray-300">
                              <div>{word.pronunciation}</div>
                              <div className="text-white">{word.meaning}</div>
                            </div>
                          </div>
                          <span className="px-3 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full self-start">
                            {word.category}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 목록 탭 */}
          {activeTab === 'list' && (
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h2 className="text-xl md:text-2xl font-bold text-white mb-6 flex items-center">
                <span className="text-2xl mr-3">📚</span>
                단어 목록 ({words.length}개)
              </h2>
              
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                  <p className="text-gray-300">단어를 불러오는 중...</p>
                </div>
              ) : words.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📚</div>
                  <p className="text-gray-300">등록된 단어가 없습니다</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {words.map((word) => (
                    <div key={word.id} className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-all duration-300 group">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center space-x-4">
                          <span className="text-2xl font-bold text-purple-300">{word.original}</span>
                          <div className="text-sm text-gray-300">
                            <div>{word.pronunciation}</div>
                            <div className="text-white">{word.meaning}</div>
                            {word.study_date && (
                              <div className="text-xs text-blue-300 mt-1">
                                📅 {word.study_date}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="px-3 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full">
                            {word.category}
                          </span>
                          <button
                            onClick={() => deleteWord(word.id)}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-300"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 통계 탭 */}
          {activeTab === 'stats' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center text-white border border-white/20 hover:bg-white/15 transition-all duration-300">
                  <div className="text-3xl font-bold text-purple-300 mb-2">{stats.total}</div>
                  <div className="text-sm text-gray-300">총 단어 수</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center text-white border border-white/20 hover:bg-white/15 transition-all duration-300">
                  <div className="text-3xl font-bold text-blue-300 mb-2">{Object.keys(stats.categories).length}</div>
                  <div className="text-sm text-gray-300">카테고리 수</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center text-white border border-white/20 hover:bg-white/15 transition-all duration-300">
                  <div className="text-3xl font-bold text-green-300 mb-2">
                    {stats.total > 0 ? Math.round((words.filter(w => w.is_active).length / stats.total) * 100) : 0}%
                  </div>
                  <div className="text-sm text-gray-300">활성 단어</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center text-white border border-white/20 hover:bg-white/15 transition-all duration-300">
                  <div className="text-3xl font-bold text-yellow-300 mb-2">
                    {Math.round(words.reduce((sum, w) => sum + w.mastery_level, 0) / Math.max(stats.total, 1))}
                  </div>
                  <div className="text-sm text-gray-300">평균 숙련도</div>
                </div>
              </div>

              {/* 카테고리별 통계 */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <span className="text-xl mr-2">📊</span>
                  카테고리별 통계
                </h3>
                <div className="space-y-3">
                  {Object.entries(stats.categories).map(([category, count]) => (
                    <div key={category} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <span className="text-white font-medium">{category}</span>
                      <span className="text-purple-300 font-bold">{count}개</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 날짜별 통계 */}
              {stats.dateStats && Object.keys(stats.dateStats).length > 0 && (
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                    <span className="text-xl mr-2">📅</span>
                    날짜별 통계
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(stats.dateStats)
                      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
                      .map(([date, count]) => (
                        <div key={date} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                          <span className="text-white font-medium">
                            {new Date(date).toLocaleDateString('ko-KR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                          <span className="text-blue-300 font-bold">{count}개</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 로그 탭 */}
          {activeTab === 'logs' && (
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <span className="text-xl mr-2">📋</span>
                  사용자 활동 로그
                </h3>
                <button
                  onClick={() => {
                    setShowUserLogs(!showUserLogs)
                    if (!showUserLogs) loadUserLogs()
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold transition-all duration-300 hover:from-blue-600 hover:to-purple-600 hover:scale-105 shadow-lg"
                >
                  {showUserLogs ? '숨기기' : '보기'}
                </button>
              </div>
              
              {showUserLogs && (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {logsLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                      <p className="text-gray-300 text-sm">로그를 불러오는 중...</p>
                    </div>
                  ) : userLogs.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-2">📊</div>
                      <p className="text-gray-300 text-sm">사용자 활동 로그가 없습니다</p>
                    </div>
                  ) : (
                    userLogs.map((log, index) => (
                      <div key={index} className="bg-white/5 rounded-lg p-3 border border-white/10">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div className="flex items-center space-x-3">
                            <span className="text-sm text-gray-300">{log.action || '활동'}</span>
                            <span className="text-xs text-gray-400">{log.user_id || '익명'}</span>
                          </div>
                          <span className="text-xs text-gray-400">
                            {new Date(log.created_at).toLocaleString()}
                          </span>
                        </div>
                        {log.details && (
                          <div className="mt-2 text-xs text-gray-300">
                            {log.details}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 