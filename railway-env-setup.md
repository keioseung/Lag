# Railway 배포 환경변수 설정 가이드

## 🚀 Railway 환경변수 설정

Railway 대시보드에서 다음 환경변수들을 설정하세요:

### 필수 환경변수

| 변수명 | 값 | 설명 |
|--------|-----|------|
| `DATABASE_URL` | `postgresql://postgres.pwwuaxjzasfxrdgvnlvp:rhdqngo123@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres` | Supabase PostgreSQL 연결 문자열 |
| `SUPABASE_URL` | `https://pwwuaxjzasfxrdgvnlvp.supabase.co` | Supabase 프로젝트 URL |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3d3VheGp6YXNmeHJkZ3ZubHZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzQyNzE1NSwiZXhwIjoyMDY5MDAzMTU1fQ.x75cMmgfavTUtdNvokKag2xuQOnpKGoyICVl-n53p_4` | Supabase 서비스 롤 키 |
| `PORT` | `8080` | 서버 포트 |
| `HOST` | `0.0.0.0` | 서버 호스트 |

### 선택적 환경변수

| 변수명 | 값 | 설명 |
|--------|-----|------|
| `SECRET_KEY` | `your-secret-key-here` | JWT 시크릿 키 (랜덤 문자열로 변경 권장) |
| `ALLOWED_ORIGINS` | `http://localhost:3000,https://your-frontend-domain.com` | CORS 허용 도메인 |
| `LOG_LEVEL` | `info` | 로그 레벨 |
| `DEBUG` | `false` | 개발 모드 (프로덕션에서는 false) |
| `API_VERSION` | `v1` | API 버전 |
| `REQUEST_TIMEOUT` | `30` | 요청 타임아웃 (초) |

## 📋 설정 방법

### 1. Railway 대시보드 접속
1. [Railway](https://railway.app)에 로그인
2. 프로젝트 선택 또는 새 프로젝트 생성

### 2. 환경변수 설정
1. 프로젝트 대시보드에서 **Variables** 탭 클릭
2. **New Variable** 버튼 클릭
3. 위의 변수명과 값을 입력
4. **Add** 버튼 클릭

### 3. 배포 확인
1. **Deployments** 탭에서 배포 상태 확인
2. 배포 완료 후 제공된 URL로 접속 테스트

## 🔧 로컬 개발 환경 설정

### 프론트엔드 (.env.local)
```bash
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=https://pwwuaxjzasfxrdgvnlvp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3d3VheGp6YXNmeHJkZ3ZubHZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0MjcxNTUsImV4cCI6MjA2OTAwMzE1NX0.q7hDrjtAalgsz8UCFJibRgPaCQ2vy6mdXxIap-MKIuc

# 백엔드 API URL
NEXT_PUBLIC_API_URL=https://lag-production-f11f.up.railway.app
```

### 백엔드 (backend/.env)
```bash
# 데이터베이스 설정
DATABASE_URL=postgresql://postgres.pwwuaxjzasfxrdgvnlvp:rhdqngo123@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres

# Supabase 설정
SUPABASE_URL=https://pwwuaxjzasfxrdgvnlvp.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3d3VheGp6YXNmeHJkZ3ZubHZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzQyNzE1NSwiZXhwIjoyMDY5MDAzMTU1fQ.x75cMmgfavTUtdNvokKag2xuQOnpKGoyICVl-n53p_4

# 서버 설정
PORT=8080
HOST=0.0.0.0
```

## 🔍 문제 해결

### 일반적인 문제들

1. **데이터베이스 연결 실패**
   - `DATABASE_URL` 형식 확인
   - Supabase 프로젝트 상태 확인

2. **CORS 오류**
   - `ALLOWED_ORIGINS`에 프론트엔드 도메인 추가
   - 와일드카드 `*` 사용 가능 (개발용)

3. **인증 오류**
   - `SUPABASE_SERVICE_ROLE_KEY` 확인
   - Supabase 프로젝트 설정 확인

4. **포트 충돌**
   - Railway에서 자동으로 포트 할당
   - `PORT` 환경변수는 Railway에서 자동 설정됨

## 📞 지원

문제가 발생하면 다음을 확인하세요:
1. Railway 로그 확인
2. 환경변수 값 재확인
3. Supabase 프로젝트 상태 확인 