-- LingoMaster 데이터베이스 스키마
-- Supabase PostgreSQL에서 실행

-- 단어 테이블
CREATE TABLE IF NOT EXISTS words (
    id SERIAL PRIMARY KEY,
    original VARCHAR(255) NOT NULL,
    pronunciation VARCHAR(255) NOT NULL,
    meaning VARCHAR(255) NOT NULL,
    category VARCHAR(100) DEFAULT '기본',
    priority INTEGER DEFAULT 0,
    mastery_level FLOAT DEFAULT 0.0,
    times_studied INTEGER DEFAULT 0,
    correct_attempts INTEGER DEFAULT 0,
    total_attempts INTEGER DEFAULT 0,
    added_date VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 학습 통계 테이블
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

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_words_original ON words(original);
CREATE INDEX IF NOT EXISTS idx_words_category ON words(category);
CREATE INDEX IF NOT EXISTS idx_words_mastery_level ON words(mastery_level);
CREATE INDEX IF NOT EXISTS idx_words_created_at ON words(created_at);

-- 업데이트 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 트리거 생성
CREATE TRIGGER update_words_updated_at 
    BEFORE UPDATE ON words 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_study_stats_updated_at 
    BEFORE UPDATE ON study_stats 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 샘플 데이터 삽입
INSERT INTO words (original, pronunciation, meaning, category, priority, mastery_level, added_date) VALUES
('Hello', '헬로우', '안녕하세요', '인사말', 1, 2.0, '2024-01-01'),
('Thank you', '땡큐', '감사합니다', '인사말', 0, 3.0, '2024-01-01'),
('Good morning', '굿 모닝', '좋은 아침입니다', '인사말', 2, 1.0, '2024-01-01'),
('Apple', '애플', '사과', '음식', 0, 4.0, '2024-01-01'),
('Beautiful', '뷰티풀', '아름다운', '형용사', 3, 1.0, '2024-01-01'),
('Computer', '컴퓨터', '컴퓨터', '기술', 1, 2.5, '2024-01-01'),
('Travel', '트래블', '여행', '여행', 2, 1.5, '2024-01-01'),
('Music', '뮤직', '음악', '문화', 0, 3.5, '2024-01-01'),
('Friend', '프렌드', '친구', '관계', 1, 2.0, '2024-01-01'),
('Learning', '러닝', '학습', '교육', 2, 1.0, '2024-01-01');

-- 기본 학습 통계 생성
INSERT INTO study_stats (total_answered, correct_answers, daily_streak, daily_progress) VALUES
(0, 0, 0, 0);

-- RLS (Row Level Security) 설정 (선택사항)
-- ALTER TABLE words ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE study_stats ENABLE ROW LEVEL SECURITY;

-- 정책 생성 (선택사항)
-- CREATE POLICY "Public read access" ON words FOR SELECT USING (true);
-- CREATE POLICY "Public insert access" ON words FOR INSERT WITH CHECK (true);
-- CREATE POLICY "Public update access" ON words FOR UPDATE USING (true);
-- CREATE POLICY "Public delete access" ON words FOR DELETE USING (true);

-- CREATE POLICY "Public read access" ON study_stats FOR SELECT USING (true);
-- CREATE POLICY "Public insert access" ON study_stats FOR INSERT WITH CHECK (true);
-- CREATE POLICY "Public update access" ON study_stats FOR UPDATE USING (true);
-- CREATE POLICY "Public delete access" ON study_stats FOR DELETE USING (true); 