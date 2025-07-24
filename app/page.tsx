'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Word, StudyStats } from '@/lib/supabase'
import AdminPanel from '@/components/AdminPanel'
import LearningPanel from '@/components/LearningPanel'
import Header from '@/components/Header'

export default function Home() {
  const [currentMode, setCurrentMode] = useState<'admin' | 'learning'>('admin')
  const [words, setWords] = useState<Word[]>([])
  const [studyStats, setStudyStats] = useState<StudyStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadWords()
    loadStudyStats()
  }, [])

  const loadWords = async () => {
    try {
      // 환경 변수가 설정되지 않은 경우 샘플 데이터 사용
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://your-project.supabase.co') {
        setWords([
          {
            id: 1,
            original: 'Hello',
            pronunciation: '헬로우',
            meaning: '안녕하세요',
            category: '인사말',
            priority: 1,
            mastery_level: 2.0,
            times_studied: 5,
            correct_attempts: 4,
            total_attempts: 5,
            added_date: '2024-01-01',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 2,
            original: 'Thank you',
            pronunciation: '땡큐',
            meaning: '감사합니다',
            category: '인사말',
            priority: 0,
            mastery_level: 3.0,
            times_studied: 8,
            correct_attempts: 7,
            total_attempts: 8,
            added_date: '2024-01-01',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        setLoading(false)
        return
      }

      if (!supabase) {
        throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.')
      }

      const { data, error } = await supabase
        .from('words')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setWords(data || [])
    } catch (error) {
      console.error('단어 로드 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadStudyStats = async () => {
    try {
      // 환경 변수가 설정되지 않은 경우 기본 통계 사용
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://your-project.supabase.co') {
        setStudyStats({
          id: 1,
          total_answered: 0,
          correct_answers: 0,
          studied_words: [],
          weak_words: [],
          daily_streak: 0,
          daily_goal: 20,
          daily_progress: 0,
          words_per_minute: 0.0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        return
      }

      if (!supabase) {
        throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.')
      }

      const { data, error } = await supabase
        .from('study_stats')
        .select('*')
        .single()

      if (error && error.code !== 'PGRST116') throw error
      setStudyStats(data)
    } catch (error) {
      console.error('학습 통계 로드 오류:', error)
    }
  }

  const addWord = async (wordData: Omit<Word, 'id' | 'created_at' | 'updated_at'>) => {
    if (!supabase) {
      console.warn('Supabase 클라이언트가 초기화되지 않았습니다.')
      return { success: false, error: 'Supabase not initialized' }
    }

    try {
      const { data, error } = await supabase
        .from('words')
        .insert([wordData])
        .select()
        .single()

      if (error) throw error
      setWords(prev => [data, ...prev])
      return { success: true }
    } catch (error) {
      console.error('단어 추가 오류:', error)
      return { success: false, error }
    }
  }

  const deleteWord = async (id: number) => {
    if (!supabase) {
      console.warn('Supabase 클라이언트가 초기화되지 않았습니다.')
      return { success: false, error: 'Supabase not initialized' }
    }

    try {
      const { error } = await supabase
        .from('words')
        .delete()
        .eq('id', id)

      if (error) throw error
      setWords(prev => prev.filter(word => word.id !== id))
      return { success: true }
    } catch (error) {
      console.error('단어 삭제 오류:', error)
      return { success: false, error }
    }
  }

  const updateWord = async (id: number, updates: Partial<Word>) => {
    if (!supabase) {
      console.warn('Supabase 클라이언트가 초기화되지 않았습니다.')
      return { success: false, error: 'Supabase not initialized' }
    }

    try {
      const { data, error } = await supabase
        .from('words')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setWords(prev => prev.map(word => word.id === id ? data : word))
      return { success: true }
    } catch (error) {
      console.error('단어 업데이트 오류:', error)
      return { success: false, error }
    }
  }

  const updateStudyStats = async (updates: Partial<StudyStats>) => {
    if (!supabase) {
      console.warn('Supabase 클라이언트가 초기화되지 않았습니다.')
      return { success: false, error: 'Supabase not initialized' }
    }

    try {
      if (studyStats) {
        const { data, error } = await supabase
          .from('study_stats')
          .update(updates)
          .eq('id', studyStats.id)
          .select()
          .single()

        if (error) throw error
        setStudyStats(data)
      } else {
        const { data, error } = await supabase
          .from('study_stats')
          .insert([updates])
          .select()
          .single()

        if (error) throw error
        setStudyStats(data)
      }
      return { success: true }
    } catch (error) {
      console.error('학습 통계 업데이트 오류:', error)
      return { success: false, error }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-2xl">로딩 중...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Header />
      
      <div className="flex justify-center gap-6 mb-8">
        <button
          onClick={() => setCurrentMode('admin')}
          className={`btn-secondary ${currentMode === 'admin' ? 'bg-white/30 border-white/60' : ''}`}
        >
          관리자 모드
        </button>
        <button
          onClick={() => setCurrentMode('learning')}
          className={`btn-secondary ${currentMode === 'learning' ? 'bg-white/30 border-white/60' : ''}`}
        >
          학습 모드
        </button>
      </div>

      {currentMode === 'admin' ? (
        <AdminPanel
          words={words}
          onAddWord={addWord}
          onDeleteWord={deleteWord}
          onUpdateWord={updateWord}
        />
      ) : (
        <LearningPanel
          words={words}
          studyStats={studyStats}
          onUpdateStats={updateStudyStats}
        />
      )}
    </div>
  )
} 