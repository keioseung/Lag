#!/bin/bash

echo "🚀 LingoMaster 애플리케이션을 시작합니다..."

# 백그라운드에서 백엔드 실행
echo "🔧 백엔드 서버 시작 중..."
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
cd ..

# 잠시 대기
sleep 3

# 프론트엔드 실행
echo "🎨 프론트엔드 서버 시작 중..."
npm run dev &
FRONTEND_PID=$!

echo "✅ 서버가 시작되었습니다!"
echo "🌐 프론트엔드: http://localhost:3000"
echo "🔧 백엔드 API: http://localhost:8000"
echo "📚 API 문서: http://localhost:8000/docs"
echo ""
echo "서버를 중지하려면 Ctrl+C를 누르세요."

# 종료 시그널 처리
trap "echo '🛑 서버를 중지합니다...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT

# 대기
wait 