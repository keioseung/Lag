# Railway 배포 가이드

## 🚀 Railway에 LingoMaster 배포하기

### 1. Railway 계정 설정
1. [Railway](https://railway.app)에 가입/로그인
2. GitHub 계정 연결

### 2. 프로젝트 배포
1. **새 프로젝트 생성**
   - Railway 대시보드에서 "New Project" 클릭
   - "Deploy from GitHub repo" 선택
   - LingoMaster 저장소 선택

2. **환경 변수 설정**
   Railway 대시보드 → Variables 탭에서 다음 변수들을 추가:

   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_API_URL=https://your-app-name.railway.app
   ```

3. **도메인 설정**
   - Railway 대시보드 → Settings → Domains
   - 커스텀 도메인 설정 (선택사항)

### 3. 배포 확인
- 배포가 완료되면 자동으로 URL이 생성됩니다
- 헬스체크: `https://your-app.railway.app/api/health`

### 4. 백엔드 배포 (선택사항)
FastAPI 백엔드도 별도로 배포하려면:

1. **새 프로젝트 생성**
   - backend 폴더를 별도 저장소로 분리
   - Railway에서 새 프로젝트 생성

2. **환경 변수 설정**
   ```
   DATABASE_URL=your_supabase_database_url
   HOST=0.0.0.0
   PORT=8000
   ```

3. **빌드 설정**
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### 5. 문제 해결

#### 빌드 실패
- Node.js 버전 확인 (18+ 필요)
- 환경 변수 누락 확인
- 의존성 설치 오류 확인

#### 런타임 오류
- Supabase 연결 확인
- 환경 변수 값 확인
- 로그 확인: Railway 대시보드 → Deployments → Logs

#### 헬스체크 실패
- `/api/health` 엔드포인트 확인
- 포트 설정 확인

### 6. 자동 배포
- GitHub에 푸시하면 자동으로 재배포됩니다
- 브랜치별 배포 설정 가능

### 7. 모니터링
- Railway 대시보드에서 실시간 로그 확인
- 성능 메트릭 모니터링
- 오류 알림 설정

## 🔧 추가 설정

### 커스텀 도메인
1. Railway 대시보드 → Settings → Domains
2. "Add Domain" 클릭
3. DNS 설정 업데이트

### SSL 인증서
- Railway에서 자동으로 SSL 인증서 제공
- 커스텀 도메인 사용 시 자동 적용

### 환경별 배포
- Production: main 브랜치
- Staging: develop 브랜치
- 각 환경별 환경 변수 설정

## 📊 배포 후 확인사항

- [ ] 앱이 정상적으로 로드되는지 확인
- [ ] Supabase 연결이 정상인지 확인
- [ ] 모든 기능이 작동하는지 테스트
- [ ] 모바일 반응형 확인
- [ ] 성능 최적화 확인 