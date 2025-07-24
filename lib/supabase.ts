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
  difficulty_level: number
  is_active: boolean
  tags: string[]
  notes: string | null
  created_at: string
  updated_at: string | null
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
  total_study_time: number
  average_accuracy: number
  last_study_date: string | null
  created_at: string
  updated_at: string
}

export interface StudySession {
  id: number
  session_id: string
  user_id: string | null
  session_type: string
  start_time: string
  end_time: string | null
  total_words: number
  correct_words: number
  session_duration: number
  difficulty_level: number
  created_at: string
}

export interface SessionAnswer {
  id: number
  session_id: string
  word_id: number
  is_correct: boolean
  answer_time: string
  response_time_ms: number | null
  user_answer: string | null
  correct_answer: string | null
  created_at: string
}

export interface UserProfile {
  id: string
  email: string
  username: string | null
  native_language: string
  target_language: string
  daily_goal: number
  notification_enabled: boolean
  study_reminder_time: string
  preferred_difficulty: number
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  email: string
  created_at: string
} 