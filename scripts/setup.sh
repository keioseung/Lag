#!/bin/bash

echo "🚀 LingoMaster 프로젝트 설정을 시작합니다..."

# 프론트엔드 의존성 설치
echo "📦 프론트엔드 의존성 설치 중..."
npm install

# 백엔드 의존성 설치
echo "🐍 백엔드 의존성 설치 중..."
cd backend
pip install -r requirements.txt
cd ..

# 환경 변수 파일 생성
echo "⚙️ 환경 변수 파일 생성 중..."
if [ ! -f .env.local ]; then
    cp env.example .env.local
    echo "✅ .env.local 파일이 생성되었습니다. Supabase 정보를 입력해주세요."
fi

if [ ! -f backend/.env ]; then
    cp backend/.env.example backend/.env
    echo "✅ backend/.env 파일이 생성되었습니다. 데이터베이스 정보를 입력해주세요."
fi

echo "🎉 설정이 완료되었습니다!"
echo ""
echo "다음 단계:"
echo "1. .env.local 파일에 Supabase 정보 입력"
echo "2. backend/.env 파일에 데이터베이스 정보 입력"
echo "3. npm run dev로 프론트엔드 실행"
echo "4. cd backend && uvicorn main:app --reload로 백엔드 실행" 