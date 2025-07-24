-- LingoMaster 기본 스키마 (간단 버전)
-- Supabase SQL Editor에서 실행하세요

-- 1. 단어 테이블
CREATE TABLE IF NOT EXISTS words (
    id SERIAL PRIMARY KEY,
    original VARCHAR(255) NOT NULL,
    pronunciation VARCHAR(255) NOT NULL,
    meaning VARCHAR(500) NOT NULL,
    category VARCHAR(100) DEFAULT '기본',
    priority INTEGER DEFAULT 0,
    mastery_level FLOAT DEFAULT 0.0,
    times_studied INTEGER DEFAULT 0,
    correct_attempts INTEGER DEFAULT 0,
    total_attempts INTEGER DEFAULT 0,
    added_date VARCHAR(10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 학습 통계 테이블
CREATE TABLE IF NOT EXISTS study_stats (
    id SERIAL PRIMARY KEY,
    total_answered INTEGER DEFAULT 0,
    correct_answers INTEGER DEFAULT 0,
    studied_words TEXT[] DEFAULT '{}',
    weak_words TEXT[] DEFAULT '{}',
    daily_streak INTEGER DEFAULT 0,
    daily_goal INTEGER DEFAULT 20,
    daily_progress INTEGER DEFAULT 0,
    words_per_minute FLOAT DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 기본 데이터 삽입
INSERT INTO words (original, pronunciation, meaning, category, priority, mastery_level, times_studied, correct_attempts, total_attempts, added_date) VALUES
('Hello', '헬로우', '안녕하세요', '인사말', 1, 2.0, 5, 4, 5, '2024-01-01'),
('Thank you', '땡큐', '감사합니다', '인사말', 0, 3.0, 8, 7, 8, '2024-01-01'),
('Goodbye', '굿바이', '안녕히 가세요', '인사말', 1, 1.5, 3, 2, 3, '2024-01-01'),
('Please', '플리즈', '부탁합니다', '예의', 2, 1.0, 2, 1, 2, '2024-01-01'),
('Sorry', '쏘리', '미안합니다', '예의', 1, 2.5, 6, 5, 6, '2024-01-01')
ON CONFLICT DO NOTHING;

-- 4. 기본 학습 통계 생성
INSERT INTO study_stats (total_answered, correct_answers, studied_words, weak_words, daily_streak, daily_goal, daily_progress, words_per_minute) VALUES
(0, 0, '{}', '{}', 0, 20, 0, 0.0)
ON CONFLICT DO NOTHING;

-- 완료 메시지
SELECT 'LingoMaster 기본 스키마가 성공적으로 생성되었습니다!' as message; 