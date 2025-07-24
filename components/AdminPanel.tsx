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
  const [stats, setStats] = useState({
    total: 0,
    categories: {} as Record<string, number>
  })
  const [showUserLogs, setShowUserLogs] = useState(false)
  const [userLogs, setUserLogs] = useState<any[]>([])
  const [logsLoading, setLogsLoading] = useState(false)

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
    
    // 헤더 행과 구분선 제거
    const filteredLines = lines.filter(line => {
      // 구분선 제거
      if (line.includes('---')) return false
      
      // 헤더 행 제거 (한자, 중국어, 단어, 한국어 등이 포함된 행)
      if (line.includes('|') && (
        line.includes('한자') || 
        line.includes('중국어') || 
        line.includes('단어') ||
        line.includes('한국어') ||
        line.includes('발음') ||
        line.includes('의미')
      )) return false
      
      return true
    })
    
    for (const line of filteredLines) {
      // 파이프(|)로 구분된 테이블 행 처리
      if (line.includes('|')) {
        const parts = line.split('|').map(part => part.trim()).filter(part => part)
        
        if (parts.length >= 3) {
          // 첫 번째 열이 한자/단어, 두 번째 열이 발음, 세 번째 열이 의미
          const original = parts[0]
          const pronunciation = parts[1]
          const meaning = parts[2]
          const category = parts[3] || '중국어'
          
          // 의미가 있는 데이터만 추가 (빈 문자열이나 구두점만 있는 경우 제외)
          if (original && pronunciation && meaning && 
              !original.match(/^[，。！？；：""''（）【】\s]+$/) &&
              !pronunciation.match(/^[，。！？；：""''（）【】\s]+$/) &&
              !meaning.match(/^[，。！？；：""''（）【】\s]+$/)) {
            
            // 구두점이나 특수문자만 있는 경우 제외
            const cleanOriginal = original.replace(/[，。！？；：""''（）【】\s]/g, '')
            const cleanPronunciation = pronunciation.replace(/[，。！？；：""''（）【】\s]/g, '')
            
            if (cleanOriginal.length > 0 && cleanPronunciation.length > 0) {
              parsed.push({
                original: original.trim(),
                pronunciation: pronunciation.trim(),
                meaning: meaning.trim(),
                category: category.trim()
              })
            }
          }
        }
      } else {
        // 탭으로 구분된 기존 형식도 지원
        const parts = line.split('\t')
        if (parts.length >= 3) {
          const [original, pronunciation, meaning, category = '중국어'] = parts
          parsed.push({
            original: original.trim(),
            pronunciation: pronunciation.trim(),
            meaning: meaning.trim(),
            category: category.trim()
          })
        }
      }
    }

    return parsed
  }

  const handleParse = () => {
    if (!bulkInput.trim()) {
      showNotification('입력된 텍스트가 없습니다', 'error')
      return
    }
    
    setIsParsing(true)
    setTimeout(() => {
      const parsed = parseChineseInput(bulkInput)
      console.log('파싱 결과:', parsed) // 디버깅용
      setParsedWords(parsed)
      setShowPreview(true)
      setIsParsing(false)
      
      if (parsed.length === 0) {
        showNotification('파싱할 수 있는 단어가 없습니다. 형식을 확인해주세요.', 'error')
      } else {
        showNotification(`${parsed.length}개의 단어가 파싱되었습니다`, 'success')
      }
    }, 500)
  }

  const handleSaveAll = async () => {
    if (parsedWords.length === 0) {
      showNotification('저장할 단어가 없습니다', 'error')
      return
    }

    setIsSaving(true)
    let successCount = 0
    let errorCount = 0

    console.log('저장 시작 - 파싱된 단어 수:', parsedWords.length)

    for (const word of parsedWords) {
      try {
        console.log('저장 중인 단어:', word)
        
        const wordData = {
          ...word,
          priority: 0,
          mastery_level: 0,
          times_studied: 0,
          correct_attempts: 0,
          total_attempts: 0,
          added_date: new Date().toISOString().split('T')[0],
          difficulty_level: 1,
          is_active: true,
          is_favorite: false,
          tags: [],
          notes: null
        }

        console.log('전송할 데이터:', wordData)

        // 먼저 Supabase로 시도
        if (supabase) {
          try {
            console.log('Supabase 저장 시도 중...')
            const { data, error } = await supabase
              .from('words')
              .insert([wordData])
              .select()
              .single()
            
            if (error) {
              console.error('Supabase 저장 오류:', error)
              throw error
            }
            
            console.log('Supabase 저장 성공:', data)
            successCount++
            continue // 성공하면 다음 단어로
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
      loadWords()
    }

    // 결과 알림
    const message = `저장 완료: ${successCount}개 성공${errorCount > 0 ? `, ${errorCount}개 실패` : ''}`
    showNotification(message, successCount > 0 ? 'success' : 'error')
  }

  const showNotification = (message: string, type: 'success' | 'error') => {
    const notification = document.createElement('div')
    notification.className = `fixed top-4 right-4 z-50 px-6 py-4 rounded-2xl text-white font-semibold shadow-2xl transform transition-all duration-500 ${
      type === 'success' ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-red-500 to-pink-500'
    }`
    notification.textContent = message
    
    document.body.appendChild(notification)
    
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)'
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
            .limit(100)
          
          if (error) {
            console.error('Supabase 로그 로드 오류:', error)
            setUserLogs([])
            return
          }
          setUserLogs(data || [])
        } else {
          setUserLogs([])
        }
      } else {
        setUserLogs(response.data || [])
      }
    } catch (error) {
      console.error('사용자 로그 로드 오류:', error)
      showNotification('로그를 불러오는 중 오류가 발생했습니다', 'error')
      setUserLogs([])
    } finally {
      setLogsLoading(false)
    }
  }

  useEffect(() => {
    const categories = words.reduce((acc, word) => {
      acc[word.category] = (acc[word.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    setStats({
      total: words.length,
      categories
    })
  }, [words])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-500 to-yellow-500 rounded-3xl mb-6 shadow-2xl animate-pulse">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent mb-4">
            관리자 패널
          </h1>
          <p className="text-gray-300 text-lg mb-6">중국어 단어 관리 및 일괄 입력</p>
          
          {onBackToLearning && (
            <button
              onClick={onBackToLearning}
              className="group relative bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-300 hover:from-purple-600 hover:to-blue-600 hover:scale-105 flex items-center mx-auto"
            >
              <svg className="w-5 h-5 mr-2 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              학습 모드로 돌아가기
            </button>
          )}
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12 animate-slide-in-up">
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 일괄 입력 섹션 */}
          <div className="space-y-6">
            {/* 사용자 로그 섹션 */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  사용자 활동 로그
                </h3>
                <button
                  onClick={() => {
                    setShowUserLogs(!showUserLogs)
                    if (!showUserLogs) loadUserLogs()
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold transition-all duration-300 hover:from-blue-600 hover:to-purple-600 hover:scale-105"
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
                        <div className="flex items-center justify-between">
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
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <svg className="w-6 h-6 mr-3 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                일괄 단어 입력
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    입력 형식: 중국어글자 탭 발음 탭 의미 탭 카테고리
                  </label>
                  <textarea
                    value={bulkInput}
                    onChange={(e) => setBulkInput(e.target.value)}
                    placeholder={`你好\tnǐ hǎo\t안녕하세요\t인사말\n谢谢\txiè xie\t감사합니다\t인사말\n再见\tzài jiàn\t안녕히 가세요\t인사말`}
                    className="w-full h-48 bg-white/5 border border-white/20 rounded-xl p-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  />
                </div>
                
                <div className="flex space-x-4">
                  <button
                    onClick={handleParse}
                    disabled={!bulkInput.trim() || isParsing}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:from-purple-600 hover:to-blue-600 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isParsing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        파싱 중...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        미리보기
                      </>
                    )}
                  </button>
                  
                  {showPreview && (
                    <button
                      onClick={handleSaveAll}
                      disabled={parsedWords.length === 0 || isSaving}
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:from-green-600 hover:to-emerald-600 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {isSaving ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          저장 중...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
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
                  <svg className="w-5 h-5 mr-2 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  미리보기 ({parsedWords.length}개)
                </h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {parsedWords.map((word, index) => (
                    <div key={index} className="bg-white/5 rounded-lg p-3 border border-white/10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl font-bold text-purple-300">{word.original}</span>
                          <span className="text-sm text-gray-300">{word.pronunciation}</span>
                          <span className="text-sm text-white">{word.meaning}</span>
                        </div>
                        <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full">
                          {word.category}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 단어 목록 섹션 */}
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <svg className="w-6 h-6 mr-3 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                단어 목록
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
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <span className="text-2xl font-bold text-purple-300">{word.original}</span>
                          <div className="text-sm text-gray-300">
                            <div>{word.pronunciation}</div>
                            <div className="text-white">{word.meaning}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full">
                            {word.category}
                          </span>
                          <button
                            onClick={() => deleteWord(word.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          </div>
        </div>
      </div>
    </div>
  )
} 