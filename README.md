# LingoMaster - 중국어 학습 플랫폼

중국어 단어 학습을 위한 플래시카드 기반 웹 애플리케이션입니다.

## 주요 기능

### 📚 학습 기능
- **플래시카드 학습**: 중국어 단어를 카드 형태로 학습
- **날짜별 학습**: 특정 날짜에 등록된 단어들만 선택적으로 학습 가능
- **즐겨찾기**: 중요한 단어를 즐겨찾기로 관리
- **자동재생**: 3초마다 자동으로 다음 카드로 넘어가는 기능
- **키보드 단축키**: 스페이스바(카드 뒤집기), 화살표키(이전/다음)

### 🔧 관리자 기능
- **일괄 단어 입력**: 탭으로 구분된 텍스트를 일괄로 파싱하여 등록
- **날짜별 단어 관리**: 특정 날짜에 단어를 등록하여 체계적인 학습 계획 수립
- **단어 목록 관리**: 등록된 단어들의 조회, 수정, 삭제
- **통계 대시보드**: 카테고리별, 날짜별 단어 통계 확인
- **사용자 활동 로그**: 학습 활동 기록 확인

### 📊 통계 및 분석
- **학습 진행률**: 현재 학습 중인 단어의 진행 상황
- **정답률**: 전체 학습 정답률 표시
- **연속 학습일**: 매일 학습한 연속 일수
- **날짜별 통계**: 각 날짜별로 등록된 단어 수 확인

## 기술 스택

### Frontend
- **Next.js 14**: React 기반 풀스택 프레임워크
- **TypeScript**: 타입 안전성 보장
- **Tailwind CSS**: 모던한 UI 디자인
- **Supabase**: 실시간 데이터베이스 및 인증

### Backend
- **FastAPI**: Python 기반 고성능 API
- **SQLAlchemy**: ORM을 통한 데이터베이스 관리
- **PostgreSQL**: 관계형 데이터베이스

## 설치 및 실행

### 1. 저장소 클론
```bash
git clone <repository-url>
cd Lag
```

### 2. 프론트엔드 설정
```bash
npm install
npm run dev
```

### 3. 백엔드 설정
```bash
cd backend
pip install -r requirements.txt
python main.py
```

### 4. 환경 변수 설정
`.env.local` 파일을 생성하고 다음 내용을 추가:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=your_backend_api_url
```

## 사용법

### 학습 모드
1. 메인 페이지에서 날짜를 선택하여 해당 날짜의 단어들을 학습
2. "모든 날짜" 버튼을 클릭하면 전체 단어를 학습
3. 즐겨찾기 버튼으로 중요한 단어만 필터링 가능
4. 카드를 클릭하거나 스페이스바를 눌러 답안 확인
5. 화살표키로 이전/다음 카드 이동

### 관리자 모드
1. 하단의 "관리자 모드" 버튼 클릭
2. 비밀번호 입력 (기본값: 123321)
3. **입력 탭**: 날짜를 선택하고 단어를 일괄 입력
4. **목록 탭**: 등록된 단어들의 관리
5. **통계 탭**: 카테고리별, 날짜별 통계 확인
6. **로그 탭**: 사용자 활동 로그 확인

### 단어 입력 형식
```
중국어글자	발음	의미	카테고리
你好	nǐ hǎo	안녕하세요	인사말
谢谢	xiè xie	감사합니다	인사말
```

## 데이터베이스 스키마

### words 테이블
- `id`: 고유 식별자
- `original`: 중국어 단어
- `pronunciation`: 발음
- `meaning`: 한국어 의미
- `category`: 카테고리
- `study_date`: 학습 날짜 (새로 추가)
- `priority`: 우선순위
- `mastery_level`: 숙련도 레벨
- `is_favorite`: 즐겨찾기 여부

## 배포

### Railway 배포
1. Railway 계정 생성
2. GitHub 저장소 연결
3. 환경 변수 설정
4. 자동 배포 완료

### Supabase 설정
1. Supabase 프로젝트 생성
2. 데이터베이스 스키마 적용 (`database/schema.sql`)
3. 환경 변수에 Supabase URL과 API 키 추가

## 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 연락처

프로젝트 링크: [https://github.com/yourusername/Lag](https://github.com/yourusername/Lag) 