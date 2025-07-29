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

### 프론트엔드 환경변수 (Railway 프론트엔드 프로젝트)

| 변수명 | 값 | 설명 |
|--------|-----|------|
| `NEXT_PUBLIC_API_URL` | `https://lag-production-f11f.up.railway.app` | 백엔드 API URL (HTTPS 필수) |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://pwwuaxjzasfxrdgvnlvp.supabase.co` | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3d3VheGp6YXNmeHJkZ3ZubHZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0MjcxNTUsImV4cCI6MjA2OTAwMzE1NX0.q7hDrjtAalgsz8UCFJibRgPaCQ2vy6mdXxIap-MKIuc` | Supabase Anon Key |

### 선택적 환경변수

| 변수명 | 값 | 설명 |
|--------|-----|------|
| `SECRET_KEY` | `your-secret-key-here` | JWT 시크릿 키 (랜덤 문자열로 변경 권장) |
| `ALLOWED_ORIGINS` | `https://lag-production.up.railway.app,http://localhost:3000` | CORS 허용 도메인 |
| `LOG_LEVEL` | `info` | 로그 레벨 |
| `DEBUG` | `false` | 개발 모드 (프로덕션에서는 false) |
| `API_VERSION` | `v1` | API 버전 |
| `REQUEST_TIMEOUT` | `30` | 요청 타임아웃 (초) |

## 📋 설정 방법

### 1. Railway 대시보드 접속
1. [Railway](https://railway.app)에 로그인
2. 프로젝트 선택 또는 새 프로젝트 생성

### 2. 백엔드 환경변수 설정
1. 백엔드 프로젝트 대시보드에서 **Variables** 탭 클릭
2. **New Variable** 버튼 클릭
3. 위의 백엔드 변수명과 값을 입력
4. **Add** 버튼 클릭

### 3. 프론트엔드 환경변수 설정
1. 프론트엔드 프로젝트 대시보드에서 **Variables** 탭 클릭
2. **New Variable** 버튼 클릭
3. 위의 프론트엔드 변수명과 값을 입력
4. **Add** 버튼 클릭

### 4. 배포 확인
1. **Deployments** 탭에서 배포 상태 확인
2. 배포 완료 후 제공된 URL로 접속 테스트

## 🔧 로컬 개발 환경 설정

### 프론트엔드 (.env.local)
```bash
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=https://pwwuaxjzasfxrdgvnlvp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3d3VheGp6YXNmeHJkZ3ZubHZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0MjcxNTUsImV4cCI6MjA2OTAwMzE1NX0.q7hDrjtAalgsz8UCFJibRgPaCQ2vy6mdXxIap-MKIuc

# 백엔드 API URL (HTTPS 필수)
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

# CORS 설정
ALLOWED_ORIGINS=https://lag-production.up.railway.app,http://localhost:3000
```

## 🔍 문제 해결

### 일반적인 문제들

1. **Mixed Content 오류**
   - `NEXT_PUBLIC_API_URL`이 HTTPS로 시작하는지 확인
   - 백엔드 URL이 `https://`로 시작해야 함

2. **CORS 오류**
   - `ALLOWED_ORIGINS`에 프론트엔드 도메인 추가
   - Railway 프론트엔드 URL 확인

3. **데이터베이스 연결 실패**
   - `DATABASE_URL` 형식 확인
   - Supabase 프로젝트 상태 확인

4. **포트 충돌**
   - Railway에서 자동으로 포트 할당
   - `PORT` 환경변수는 Railway에서 자동 설정됨

## 📞 지원

문제가 발생하면 다음을 확인하세요:
1. Railway 로그 확인
2. 환경변수 값 재확인
3. Supabase 프로젝트 상태 확인
4. HTTPS URL 사용 확인 