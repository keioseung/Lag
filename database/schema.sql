-- LingoMaster 데이터베이스 스키마
-- Supabase SQL Editor에서 실행하세요

-- 1. 단어 테이블 생성
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
    study_date DATE, -- 날짜별 학습을 위한 필드 추가
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 학습 통계 테이블 생성
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

-- 3. 학습 세션 테이블 생성
CREATE TABLE IF NOT EXISTS study_sessions (
    id SERIAL PRIMARY KEY,
    session_id UUID DEFAULT gen_random_uuid(),
    user_id UUID,
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_time TIMESTAMP WITH TIME ZONE,
    total_words INTEGER DEFAULT 0,
    correct_words INTEGER DEFAULT 0,
    session_duration INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 학습 세션 답변 테이블 생성
CREATE TABLE IF NOT EXISTS session_answers (
    id SERIAL PRIMARY KEY,
    session_id UUID NOT NULL,
    word_id INTEGER NOT NULL REFERENCES words(id),
    is_correct BOOLEAN NOT NULL,
    answer_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    response_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. 사용자 프로필 테이블 생성
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100),
    native_language VARCHAR(50) DEFAULT 'ko',
    target_language VARCHAR(50) DEFAULT 'en',
    daily_goal INTEGER DEFAULT 20,
    notification_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_words_category ON words(category);
CREATE INDEX IF NOT EXISTS idx_words_priority ON words(priority);
CREATE INDEX IF NOT EXISTS idx_words_mastery_level ON words(mastery_level);
CREATE INDEX IF NOT EXISTS idx_session_answers_session_id ON session_answers(session_id);
CREATE INDEX IF NOT EXISTS idx_session_answers_word_id ON session_answers(word_id);

-- 7. RLS (Row Level Security) 활성화
ALTER TABLE words ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 8. 기본 정책 설정 (모든 사용자가 읽기/쓰기 가능)
CREATE POLICY "Enable read access for all users" ON words FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON words FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON words FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON words FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON study_stats FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON study_stats FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON study_stats FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON study_stats FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON study_sessions FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON study_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON study_sessions FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON study_sessions FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON session_answers FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON session_answers FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON session_answers FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON session_answers FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON user_profiles FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON user_profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON user_profiles FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON user_profiles FOR DELETE USING (true);

-- 9. 기본 데이터 삽입
INSERT INTO words (original, pronunciation, meaning, category, priority, mastery_level, times_studied, correct_attempts, total_attempts, added_date) VALUES
('Hello', '헬로우', '안녕하세요', '인사말', 1, 2.0, 5, 4, 5, '2024-01-01'),
('Thank you', '땡큐', '감사합니다', '인사말', 0, 3.0, 8, 7, 8, '2024-01-01'),
('Goodbye', '굿바이', '안녕히 가세요', '인사말', 1, 1.5, 3, 2, 3, '2024-01-01'),
('Please', '플리즈', '부탁합니다', '예의', 2, 1.0, 2, 1, 2, '2024-01-01'),
('Sorry', '쏘리', '미안합니다', '예의', 1, 2.5, 6, 5, 6, '2024-01-01'),
('Water', '워터', '물', '일상용어', 0, 4.0, 10, 9, 10, '2024-01-01'),
('Food', '푸드', '음식', '일상용어', 0, 3.5, 7, 6, 7, '2024-01-01'),
('Time', '타임', '시간', '일상용어', 1, 2.8, 4, 3, 4, '2024-01-01'),
('Work', '워크', '일하다', '직업', 2, 1.8, 3, 2, 3, '2024-01-01'),
('Study', '스터디', '공부하다', '교육', 1, 2.2, 5, 4, 5, '2024-01-01')
ON CONFLICT DO NOTHING;

-- 10. 기본 학습 통계 생성
INSERT INTO study_stats (total_answered, correct_answers, studied_words, weak_words, daily_streak, daily_goal, daily_progress, words_per_minute) VALUES
(0, 0, '{}', '{}', 0, 20, 0, 0.0)
ON CONFLICT DO NOTHING;

-- 11. 함수 생성 (updated_at 자동 업데이트)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 12. 트리거 생성
CREATE TRIGGER update_words_updated_at BEFORE UPDATE ON words FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_study_stats_updated_at BEFORE UPDATE ON study_stats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 완료 메시지
SELECT 'LingoMaster 데이터베이스 스키마가 성공적으로 생성되었습니다!' as message; 