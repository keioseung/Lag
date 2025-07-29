from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import os
from dotenv import load_dotenv

from database import get_db, engine
from models import Base
from schemas import WordCreate, WordUpdate, WordResponse, StudyStatsCreate, StudyStatsUpdate, StudyStatsResponse
from crud import word_crud, study_stats_crud

load_dotenv()

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="LingoMaster API",
    description="언어 학습 플랫폼 API",
    version="1.0.0"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Next.js 프론트엔드 주소 (개발)
        "https://lag-production.up.railway.app",  # 현재 프로덕션 프론트엔드
        "https://mmo-production-34bc.up.railway.app",  # 기존 프로덕션 프론트엔드
        "https://product2-production.up.railway.app",  # 기존 프로덕션 백엔드
        "*",  # 모든 도메인 허용 (개발용, 프로덕션에서는 제거 권장)
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "LingoMaster API에 오신 것을 환영합니다!"}

@app.get("/health")
async def health_check():
    """API 상태 확인"""
    return {"status": "healthy", "message": "LingoMaster API is running"}

# 단어 관련 엔드포인트
@app.get("/words/", response_model=List[WordResponse])
async def get_words(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """모든 단어 조회"""
    words = word_crud.get_words(db, skip=skip, limit=limit)
    return words

@app.get("/words/{word_id}", response_model=WordResponse)
async def get_word(word_id: int, db: Session = Depends(get_db)):
    """특정 단어 조회"""
    word = word_crud.get_word(db, word_id=word_id)
    if word is None:
        raise HTTPException(status_code=404, detail="단어를 찾을 수 없습니다")
    return word

@app.post("/words/", response_model=WordResponse)
async def create_word(word: WordCreate, db: Session = Depends(get_db)):
    """새 단어 생성"""
    return word_crud.create_word(db=db, word=word)

@app.put("/words/{word_id}", response_model=WordResponse)
async def update_word(word_id: int, word: WordUpdate, db: Session = Depends(get_db)):
    """단어 수정"""
    updated_word = word_crud.update_word(db=db, word_id=word_id, word=word)
    if updated_word is None:
        raise HTTPException(status_code=404, detail="단어를 찾을 수 없습니다")
    return updated_word

@app.delete("/words/{word_id}")
async def delete_word(word_id: int, db: Session = Depends(get_db)):
    """단어 삭제"""
    success = word_crud.delete_word(db=db, word_id=word_id)
    if not success:
        raise HTTPException(status_code=404, detail="단어를 찾을 수 없습니다")
    return {"message": "단어가 삭제되었습니다"}

@app.get("/words/category/{category}")
async def get_words_by_category(category: str, db: Session = Depends(get_db)):
    """카테고리별 단어 조회"""
    words = word_crud.get_words_by_category(db, category=category)
    return words

@app.get("/words/date/{study_date}")
async def get_words_by_date(study_date: str, db: Session = Depends(get_db)):
    """날짜별 단어 조회"""
    words = word_crud.get_words_by_date(db, study_date=study_date)
    return words

@app.get("/words/dates/available")
async def get_available_dates(db: Session = Depends(get_db)):
    """사용 가능한 학습 날짜 목록 조회"""
    dates = word_crud.get_available_dates(db)
    return {"dates": dates}

# 학습 통계 관련 엔드포인트
@app.get("/study-stats/", response_model=StudyStatsResponse)
async def get_study_stats(db: Session = Depends(get_db)):
    """학습 통계 조회"""
    stats = study_stats_crud.get_study_stats(db)
    if stats is None:
        # 기본 통계 생성
        stats = study_stats_crud.create_study_stats(db, StudyStatsCreate())
    return stats

@app.post("/study-stats/", response_model=StudyStatsResponse)
async def create_study_stats(stats: StudyStatsCreate, db: Session = Depends(get_db)):
    """학습 통계 생성"""
    return study_stats_crud.create_study_stats(db=db, stats=stats)

@app.put("/study-stats/", response_model=StudyStatsResponse)
async def update_study_stats(stats: StudyStatsUpdate, db: Session = Depends(get_db)):
    """학습 통계 수정"""
    updated_stats = study_stats_crud.update_study_stats(db=db, stats=stats)
    if updated_stats is None:
        raise HTTPException(status_code=404, detail="학습 통계를 찾을 수 없습니다")
    return updated_stats

# 학습 관련 엔드포인트
@app.get("/words/weak/")
async def get_weak_words(db: Session = Depends(get_db)):
    """약점 단어 조회 (정확도 70% 미만)"""
    words = word_crud.get_weak_words(db)
    return words

@app.post("/words/{word_id}/study")
async def record_study_session(word_id: int, correct: bool, db: Session = Depends(get_db)):
    """학습 세션 기록"""
    word = word_crud.record_study_session(db, word_id=word_id, correct=correct)
    if word is None:
        raise HTTPException(status_code=404, detail="단어를 찾을 수 없습니다")
    return word

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 