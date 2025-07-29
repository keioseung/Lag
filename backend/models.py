from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean, Date, Time, JSON
from sqlalchemy.sql import func
from database import Base

class Word(Base):
    __tablename__ = "words"

    id = Column(Integer, primary_key=True, index=True)
    original = Column(String, nullable=False, index=True)
    pronunciation = Column(String, nullable=False)
    meaning = Column(String, nullable=False)
    category = Column(String, default="중국어")
    priority = Column(Integer, default=0)
    mastery_level = Column(Float, default=0.0)
    times_studied = Column(Integer, default=0)
    correct_attempts = Column(Integer, default=0)
    total_attempts = Column(Integer, default=0)
    added_date = Column(Date, default=func.current_date())
    study_date = Column(Date) # 날짜별 학습을 위한 필드 추가
    difficulty_level = Column(Integer, default=1)
    is_active = Column(Boolean, default=True)
    tags = Column(JSON, default=list)
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class StudyStats(Base):
    __tablename__ = "study_stats"

    id = Column(Integer, primary_key=True, index=True)
    total_answered = Column(Integer, default=0)
    correct_answers = Column(Integer, default=0)
    studied_words = Column(JSON, default=list)
    weak_words = Column(JSON, default=list)
    daily_streak = Column(Integer, default=0)
    daily_goal = Column(Integer, default=20)
    daily_progress = Column(Integer, default=0)
    words_per_minute = Column(Float, default=0.0)
    total_study_time = Column(Integer, default=0)
    average_accuracy = Column(Float, default=0.0)
    last_study_date = Column(Date)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class StudySession(Base):
    __tablename__ = "study_sessions"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, unique=True, index=True)
    user_id = Column(String)
    session_type = Column(String, default="flashcard")
    start_time = Column(DateTime(timezone=True), server_default=func.now())
    end_time = Column(DateTime(timezone=True))
    total_words = Column(Integer, default=0)
    correct_words = Column(Integer, default=0)
    session_duration = Column(Integer, default=0)
    difficulty_level = Column(Integer, default=1)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class SessionAnswer(Base):
    __tablename__ = "session_answers"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, nullable=False, index=True)
    word_id = Column(Integer, nullable=False, index=True)
    is_correct = Column(Boolean, nullable=False)
    answer_time = Column(DateTime(timezone=True), server_default=func.now())
    response_time_ms = Column(Integer)
    user_answer = Column(Text)
    correct_answer = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(String, primary_key=True)
    email = Column(String, unique=True, nullable=False)
    username = Column(String)
    native_language = Column(String, default="ko")
    target_language = Column(String, default="zh")
    daily_goal = Column(Integer, default=20)
    notification_enabled = Column(Boolean, default=True)
    study_reminder_time = Column(Time, default="09:00")
    preferred_difficulty = Column(Integer, default=1)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now()) 