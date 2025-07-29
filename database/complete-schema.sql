-- LingoMaster 완전한 데이터베이스 스키마
-- Supabase SQL Editor에서 실행하세요
-- 기존 테이블을 모두 삭제하고 새로운 스키마로 재구성합니다

-- 기존 테이블 및 관련 객체 삭제
DROP TABLE IF EXISTS session_answers CASCADE;
DROP TABLE IF EXISTS study_sessions CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS study_stats CASCADE;
DROP TABLE IF EXISTS words CASCADE;
DROP TABLE IF EXISTS user_logs CASCADE;

-- 1. 단어 테이블 생성
CREATE TABLE words (
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
    added_date VARCHAR(10),
    study_date DATE, -- 날짜별 학습을 위한 필드
    difficulty_level INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    is_favorite BOOLEAN DEFAULT FALSE,
    review_count INTEGER DEFAULT 0,
    last_reviewed DATE,
    tags TEXT[] DEFAULT '{}',
    notes TEXT,
    total_study_time INTEGER DEFAULT 0,
    average_accuracy FLOAT DEFAULT 0.0,
    last_study_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 학습 통계 테이블 생성
CREATE TABLE study_stats (
    id SERIAL PRIMARY KEY,
    total_answered INTEGER DEFAULT 0,
    correct_answers INTEGER DEFAULT 0,
    studied_words TEXT[] DEFAULT '{}',
    weak_words TEXT[] DEFAULT '{}',
    daily_streak INTEGER DEFAULT 0,
    daily_goal INTEGER DEFAULT 20,
    daily_progress INTEGER DEFAULT 0,
    words_per_minute FLOAT DEFAULT 0.0,
    total_study_time INTEGER DEFAULT 0,
    average_accuracy FLOAT DEFAULT 0.0,
    last_study_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 학습 세션 테이블 생성
CREATE TABLE study_sessions (
    id SERIAL PRIMARY KEY,
    session_id UUID DEFAULT gen_random_uuid(),
    user_id UUID,
    session_type VARCHAR(50) DEFAULT 'flashcard',
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_time TIMESTAMP WITH TIME ZONE,
    total_words INTEGER DEFAULT 0,
    correct_words INTEGER DEFAULT 0,
    session_duration INTEGER DEFAULT 0,
    difficulty_level INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 학습 세션 답변 테이블 생성
CREATE TABLE session_answers (
    id SERIAL PRIMARY KEY,
    session_id UUID NOT NULL,
    word_id INTEGER NOT NULL,
    is_correct BOOLEAN NOT NULL,
    answer_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    response_time_ms INTEGER,
    user_answer TEXT,
    correct_answer TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. 사용자 프로필 테이블 생성
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100),
    native_language VARCHAR(50) DEFAULT 'ko',
    target_language VARCHAR(50) DEFAULT 'zh',
    daily_goal INTEGER DEFAULT 20,
    notification_enabled BOOLEAN DEFAULT TRUE,
    study_reminder_time TIME DEFAULT '09:00',
    preferred_difficulty INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. 사용자 로그 테이블 생성
CREATE TABLE user_logs (
    id SERIAL PRIMARY KEY,
    user_id UUID,
    action VARCHAR(100) NOT NULL,
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. 인덱스 생성 (성능 최적화)
CREATE INDEX idx_words_category ON words(category);
CREATE INDEX idx_words_priority ON words(priority);
CREATE INDEX idx_words_mastery_level ON words(mastery_level);
CREATE INDEX idx_words_study_date ON words(study_date);
CREATE INDEX idx_words_is_active ON words(is_active);
CREATE INDEX idx_words_is_favorite ON words(is_favorite);
CREATE INDEX idx_session_answers_session_id ON session_answers(session_id);
CREATE INDEX idx_session_answers_word_id ON session_answers(word_id);
CREATE INDEX idx_study_sessions_user_id ON study_sessions(user_id);
CREATE INDEX idx_user_logs_user_id ON user_logs(user_id);
CREATE INDEX idx_user_logs_created_at ON user_logs(created_at);

-- 8. RLS (Row Level Security) 활성화
ALTER TABLE words ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_logs ENABLE ROW LEVEL SECURITY;

-- 9. 기본 정책 설정 (모든 사용자가 읽기/쓰기 가능)
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

CREATE POLICY "Enable read access for all users" ON user_logs FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON user_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON user_logs FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON user_logs FOR DELETE USING (true);

-- 10. 함수 생성 (updated_at 자동 업데이트)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 11. 트리거 생성
CREATE TRIGGER update_words_updated_at BEFORE UPDATE ON words FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_study_stats_updated_at BEFORE UPDATE ON study_stats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 12. 기본 데이터 삽입 (샘플 단어들)
INSERT INTO words (original, pronunciation, meaning, category, priority, mastery_level, times_studied, correct_attempts, total_attempts, added_date, study_date, difficulty_level, is_active, is_favorite, tags, notes) VALUES
('你好', 'nǐ hǎo', '안녕하세요', '인사말', 1, 2.0, 5, 4, 5, '2024-01-01', '2024-01-01', 1, TRUE, FALSE, ARRAY['기초', '인사'], '가장 기본적인 인사말'),
('谢谢', 'xiè xie', '감사합니다', '인사말', 1, 1.5, 3, 2, 3, '2024-01-01', '2024-01-01', 1, TRUE, TRUE, ARRAY['기초', '인사'], '감사 표현'),
('再见', 'zài jiàn', '안녕히 가세요', '인사말', 1, 1.0, 2, 1, 2, '2024-01-01', '2024-01-01', 1, TRUE, FALSE, ARRAY['기초', '인사'], '작별 인사'),
('请', 'qǐng', '부탁합니다', '예의', 2, 1.0, 2, 1, 2, '2024-01-02', '2024-01-02', 1, TRUE, FALSE, ARRAY['예의'], '정중한 요청'),
('对不起', 'duì bù qǐ', '미안합니다', '예의', 1, 2.5, 6, 5, 6, '2024-01-02', '2024-01-02', 1, TRUE, FALSE, ARRAY['예의'], '사과 표현'),
('水', 'shuǐ', '물', '일상용어', 0, 4.0, 10, 9, 10, '2024-01-03', '2024-01-03', 1, TRUE, FALSE, ARRAY['일상'], '기본 명사'),
('食物', 'shí wù', '음식', '일상용어', 0, 3.5, 7, 6, 7, '2024-01-03', '2024-01-03', 1, TRUE, FALSE, ARRAY['일상'], '음식 관련'),
('时间', 'shí jiān', '시간', '일상용어', 1, 2.8, 4, 3, 4, '2024-01-03', '2024-01-03', 1, TRUE, FALSE, ARRAY['일상'], '시간 표현'),
('工作', 'gōng zuò', '일하다', '직업', 2, 1.8, 3, 2, 3, '2024-01-04', '2024-01-04', 2, TRUE, FALSE, ARRAY['직업'], '직업 관련'),
('学习', 'xué xí', '공부하다', '교육', 1, 2.2, 5, 4, 5, '2024-01-04', '2024-01-04', 2, TRUE, FALSE, ARRAY['교육'], '학습 관련')
ON CONFLICT DO NOTHING;

-- 13. 기본 학습 통계 생성
INSERT INTO study_stats (total_answered, correct_answers, studied_words, weak_words, daily_streak, daily_goal, daily_progress, words_per_minute, total_study_time, average_accuracy) VALUES
(0, 0, '{}', '{}', 0, 20, 0, 0.0, 0, 0.0)
ON CONFLICT DO NOTHING;

-- 14. 기본 사용자 프로필 생성 (선택사항)
INSERT INTO user_profiles (email, username, native_language, target_language, daily_goal, notification_enabled, preferred_difficulty) VALUES
('demo@example.com', '데모 사용자', 'ko', 'zh', 20, TRUE, 1)
ON CONFLICT DO NOTHING;

-- 완료 메시지
SELECT 'LingoMaster 데이터베이스 스키마가 성공적으로 생성되었습니다!' as message;

-- 생성된 테이블 확인
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('words', 'study_stats', 'study_sessions', 'session_answers', 'user_profiles', 'user_logs')
ORDER BY table_name, ordinal_position; 