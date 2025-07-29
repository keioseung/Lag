-- LingoMaster 백엔드 호환 데이터베이스 스키마
-- PostgreSQL에서 실행하세요

-- 기존 테이블이 있다면 삭제 (주의: 데이터가 모두 삭제됩니다)
DROP TABLE IF EXISTS session_answers CASCADE;
DROP TABLE IF EXISTS study_sessions CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS study_stats CASCADE;
DROP TABLE IF EXISTS words CASCADE;

-- 1. 단어 테이블 생성
CREATE TABLE IF NOT EXISTS words (
    id SERIAL PRIMARY KEY,
    original VARCHAR(255) NOT NULL,
    pronunciation VARCHAR(255) NOT NULL,
    meaning VARCHAR(500) NOT NULL,
    category VARCHAR(100) DEFAULT '중국어',
    priority INTEGER DEFAULT 0,
    mastery_level FLOAT DEFAULT 0.0,
    times_studied INTEGER DEFAULT 0,
    correct_attempts INTEGER DEFAULT 0,
    total_attempts INTEGER DEFAULT 0,
    added_date DATE DEFAULT CURRENT_DATE,
    study_date DATE, -- 날짜별 학습을 위한 필드 추가
    difficulty_level INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    tags JSONB DEFAULT '[]',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. study_stats 테이블 (백엔드 StudyStats 모델과 정확히 일치)
CREATE TABLE IF NOT EXISTS study_stats (
    id SERIAL PRIMARY KEY,
    total_words INTEGER DEFAULT 0,
    studied_words JSONB DEFAULT '[]'::jsonb, -- PostgreSQL JSONB 타입
    weak_words JSONB DEFAULT '[]'::jsonb, -- PostgreSQL JSONB 타입
    total_study_time INTEGER DEFAULT 0, -- 분 단위
    average_accuracy DECIMAL(5,2) DEFAULT 0.00,
    last_study_date VARCHAR(10), -- YYYY-MM-DD 형식
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. study_sessions 테이블 (백엔드 StudySession 모델과 정확히 일치)
CREATE TABLE IF NOT EXISTS study_sessions (
    id SERIAL PRIMARY KEY,
    session_id UUID DEFAULT gen_random_uuid() UNIQUE,
    user_id UUID,
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_time TIMESTAMP WITH TIME ZONE,
    total_questions INTEGER DEFAULT 0,
    correct_answers INTEGER DEFAULT 0,
    study_mode VARCHAR(50) DEFAULT 'flashcard',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. session_answers 테이블 (백엔드 SessionAnswer 모델과 정확히 일치)
CREATE TABLE IF NOT EXISTS session_answers (
    id SERIAL PRIMARY KEY,
    session_id UUID NOT NULL,
    word_id INTEGER NOT NULL,
    user_answer TEXT,
    correct_answer TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    response_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (session_id) REFERENCES study_sessions(session_id) ON DELETE CASCADE,
    FOREIGN KEY (word_id) REFERENCES words(id) ON DELETE CASCADE
);

-- 5. user_profiles 테이블 (백엔드 UserProfile 모델과 정확히 일치)
CREATE TABLE IF NOT EXISTS user_profiles (
    id SERIAL PRIMARY KEY,
    user_id UUID UNIQUE,
    username VARCHAR(100),
    email VARCHAR(255),
    target_language VARCHAR(10) DEFAULT 'zh',
    native_language VARCHAR(10) DEFAULT 'ko',
    daily_goal INTEGER DEFAULT 20,
    study_reminder_time TIME DEFAULT '09:00:00',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_words_category ON words(category);
CREATE INDEX IF NOT EXISTS idx_words_difficulty ON words(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_words_mastery ON words(mastery_level);
CREATE INDEX IF NOT EXISTS idx_words_active ON words(is_active);
CREATE INDEX IF NOT EXISTS idx_words_added_date ON words(added_date);
CREATE INDEX IF NOT EXISTS idx_session_answers_session_id ON session_answers(session_id);
CREATE INDEX IF NOT EXISTS idx_session_answers_word_id ON session_answers(word_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_id ON study_sessions(user_id);

-- Row Level Security (RLS) 활성화
ALTER TABLE words ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 기본 정책 설정 (모든 사용자가 읽기/쓰기 가능)
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

-- updated_at 컬럼 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 트리거 생성
CREATE TRIGGER update_words_updated_at BEFORE UPDATE ON words FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_study_stats_updated_at BEFORE UPDATE ON study_stats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_study_sessions_updated_at BEFORE UPDATE ON study_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 샘플 데이터 삽입
INSERT INTO words (original, pronunciation, meaning, category, priority, mastery_level, times_studied, correct_attempts, total_attempts, added_date, difficulty_level, is_active, tags, notes) VALUES
('你好', 'nǐ hǎo', '안녕하세요', '인사', 1, 0, 0, 0, 0, '2024-01-01', 1, true, '["기초", "인사"]', '가장 기본적인 인사말'),
('谢谢', 'xiè xie', '감사합니다', '인사', 1, 0, 0, 0, 0, '2024-01-01', 1, true, '["기초", "인사"]', '고마움을 표현하는 말'),
('再见', 'zài jiàn', '안녕히 가세요', '인사', 1, 0, 0, 0, 0, '2024-01-01', 1, true, '["기초", "인사"]', '작별 인사'),
('对不起', 'duì bù qǐ', '죄송합니다', '인사', 2, 0, 0, 0, 0, '2024-01-01', 2, true, '["인사", "사과"]', '사과할 때 사용'),
('没关系', 'méi guān xi', '괜찮습니다', '인사', 2, 0, 0, 0, 0, '2024-01-01', 2, true, '["인사", "위로"]', '상대방을 위로할 때'),
('水', 'shuǐ', '물', '명사', 1, 0, 0, 0, 0, '2024-01-01', 1, true, '["기초", "명사"]', '기본적인 명사'),
('茶', 'chá', '차', '명사', 1, 0, 0, 0, 0, '2024-01-01', 1, true, '["기초", "명사"]', '중국 차 문화'),
('饭', 'fàn', '밥', '명사', 1, 0, 0, 0, 0, '2024-01-01', 1, true, '["기초", "명사"]', '음식 관련'),
('大', 'dà', '크다', '형용사', 1, 0, 0, 0, 0, '2024-01-01', 1, true, '["기초", "형용사"]', '기본 형용사'),
('小', 'xiǎo', '작다', '형용사', 1, 0, 0, 0, 0, '2024-01-01', 1, true, '["기초", "형용사"]', '기본 형용사');

-- 기본 학습 통계 생성
INSERT INTO study_stats (total_words, studied_words, weak_words, total_study_time, average_accuracy, last_study_date) VALUES
(10, '[]', '[]', 0, 0.00, NULL);

-- 기본 사용자 프로필 생성 (선택사항)
INSERT INTO user_profiles (user_id, username, email, target_language, native_language, daily_goal, study_reminder_time) VALUES
(gen_random_uuid(), 'default_user', 'user@example.com', 'zh', 'ko', 20, '09:00:00');

-- 성공 메시지
SELECT '데이터베이스 스키마가 성공적으로 생성되었습니다!' as message; 