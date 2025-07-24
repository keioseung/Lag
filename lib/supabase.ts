import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// 환경 변수가 없으면 빌드 시 오류를 방지하기 위해 조건부로 클라이언트 생성
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Database types
export interface Word {
  id: number
  original: string
  pronunciation: string
  meaning: string
  category: string
  priority: number
  mastery_level: number
  times_studied: number
  correct_attempts: number
  total_attempts: number
  added_date: string
  created_at: string
  updated_at: string
}

export interface StudyStats {
  id: number
  total_answered: number
  correct_answers: number
  studied_words: string[]
  weak_words: string[]
  daily_streak: number
  daily_goal: number
  daily_progress: number
  words_per_minute: number
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  email: string
  created_at: string
} 