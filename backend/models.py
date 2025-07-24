from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ARRAY
from sqlalchemy.sql import func
from database import Base

class Word(Base):
    __tablename__ = "words"

    id = Column(Integer, primary_key=True, index=True)
    original = Column(String, nullable=False, index=True)
    pronunciation = Column(String, nullable=False)
    meaning = Column(String, nullable=False)
    category = Column(String, default="기본")
    priority = Column(Integer, default=0)
    mastery_level = Column(Float, default=0.0)
    times_studied = Column(Integer, default=0)
    correct_attempts = Column(Integer, default=0)
    total_attempts = Column(Integer, default=0)
    added_date = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class StudyStats(Base):
    __tablename__ = "study_stats"

    id = Column(Integer, primary_key=True, index=True)
    total_answered = Column(Integer, default=0)
    correct_answers = Column(Integer, default=0)
    studied_words = Column(ARRAY(String), default=[])
    weak_words = Column(ARRAY(String), default=[])
    daily_streak = Column(Integer, default=0)
    daily_goal = Column(Integer, default=20)
    daily_progress = Column(Integer, default=0)
    words_per_minute = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now()) 