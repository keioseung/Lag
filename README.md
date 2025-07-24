# LingoMaster - 언어 학습 플랫폼

Next.js, FastAPI, Supabase를 사용한 풀스택 언어 학습 애플리케이션입니다.

## 🚀 기술 스택

### 프론트엔드
- **Next.js 14** - React 기반 풀스택 프레임워크
- **TypeScript** - 타입 안전성
- **Tailwind CSS** - 스타일링
- **Lucide React** - 아이콘
- **Supabase Client** - 데이터베이스 클라이언트

### 백엔드
- **FastAPI** - 고성능 Python 웹 프레임워크
- **SQLAlchemy** - ORM
- **Pydantic** - 데이터 검증
- **Uvicorn** - ASGI 서버

### 데이터베이스
- **Supabase PostgreSQL** - 클라우드 데이터베이스

## 📁 프로젝트 구조

```
lingomaster/
├── app/                    # Next.js 앱 디렉토리
│   ├── globals.css        # 전역 스타일
│   ├── layout.tsx         # 루트 레이아웃
│   └── page.tsx           # 메인 페이지
├── components/            # React 컴포넌트
│   ├── Header.tsx         # 헤더 컴포넌트
│   ├── AdminPanel.tsx     # 관리자 패널
│   └── LearningPanel.tsx  # 학습 패널
├── lib/                   # 유틸리티
│   └── supabase.ts        # Supabase 클라이언트
├── backend/               # FastAPI 백엔드
│   ├── main.py           # FastAPI 앱
│   ├── database.py       # 데이터베이스 설정
│   ├── models.py         # SQLAlchemy 모델
│   ├── schemas.py        # Pydantic 스키마
│   ├── crud.py           # CRUD 작업
│   └── requirements.txt  # Python 의존성
├── package.json          # Node.js 의존성
├── tailwind.config.js    # Tailwind 설정
├── tsconfig.json         # TypeScript 설정
└── README.md            # 프로젝트 문서
```

## 🛠️ 설치 및 실행

### 1. Supabase 설정

1. [Supabase](https://supabase.com)에서 새 프로젝트 생성
2. SQL Editor에서 다음 테이블 생성:

```sql
-- 단어 테이블
CREATE TABLE words (
    id SERIAL PRIMARY KEY,
    original VARCHAR NOT NULL,
    pronunciation VARCHAR NOT NULL,
    meaning VARCHAR NOT NULL,
    category VARCHAR DEFAULT '기본',
    priority INTEGER DEFAULT 0,
    mastery_level FLOAT DEFAULT 0.0,
    times_studied INTEGER DEFAULT 0,
    correct_attempts INTEGER DEFAULT 0,
    total_attempts INTEGER DEFAULT 0,
    added_date VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 학습 통계 테이블
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. 환경 변수 설정

1. `env.example`을 `.env.local`로 복사하고 Supabase 정보 입력
2. `backend/.env.example`을 `backend/.env`로 복사하고 데이터베이스 정보 입력

### 3. 프론트엔드 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

### 4. 백엔드 실행

```bash
# 백엔드 디렉토리로 이동
cd backend

# Python 가상환경 생성 (선택사항)
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 의존성 설치
pip install -r requirements.txt

# 개발 서버 실행
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## 🎯 주요 기능

### 관리자 모드
- ✅ 단어 추가/삭제/수정
- ✅ 카테고리별 필터링
- ✅ 검색 기능
- ✅ CSV 내보내기/가져오기
- ✅ 숙련도 표시

### 학습 모드
- ✅ 플래시카드 학습
- ✅ 퀴즈 모드
- ✅ 타이핑 연습
- ✅ 듣기 연습
- ✅ 난이도 설정
- ✅ 학습 통계 추적
- ✅ 일일 목표 설정
- ✅ 연속 학습 기록

### 고급 기능
- ✅ 음성 합성 (TTS)
- ✅ 실시간 타이머
- ✅ 진행률 표시
- ✅ 약점 단어 보강
- ✅ 단어 섞기
- ✅ 마스터리 레벨 시스템

## 🔧 API 엔드포인트

### 단어 관리
- `GET /words/` - 모든 단어 조회
- `GET /words/{word_id}` - 특정 단어 조회
- `POST /words/` - 새 단어 생성
- `PUT /words/{word_id}` - 단어 수정
- `DELETE /words/{word_id}` - 단어 삭제
- `GET /words/category/{category}` - 카테고리별 단어 조회
- `GET /words/weak/` - 약점 단어 조회

### 학습 통계
- `GET /study-stats/` - 학습 통계 조회
- `POST /study-stats/` - 학습 통계 생성
- `PUT /study-stats/` - 학습 통계 수정

### 학습 세션
- `POST /words/{word_id}/study` - 학습 세션 기록

## 🎨 UI/UX 특징

- **Duolingo 스타일** - 게임화된 학습 경험
- **반응형 디자인** - 모바일/데스크톱 지원
- **그라데이션 배경** - 시각적 매력
- **애니메이션 효과** - 부드러운 전환
- **직관적 인터페이스** - 사용자 친화적

## 🚀 배포

### Vercel (프론트엔드)
1. GitHub에 코드 푸시
2. Vercel에서 프로젝트 연결
3. 환경 변수 설정
4. 자동 배포

### Railway/Heroku (백엔드)
1. 백엔드 코드를 별도 저장소에 푸시
2. Railway/Heroku에서 앱 생성
3. 환경 변수 설정
4. 배포

## 📝 라이선스

MIT License

## 🤝 기여

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 문의

프로젝트에 대한 질문이나 제안사항이 있으시면 이슈를 생성해주세요. 