from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# Word schemas
class WordBase(BaseModel):
    original: str
    pronunciation: str
    meaning: str
    category: str = "기본"
    priority: int = 0
    mastery_level: float = 0.0
    times_studied: int = 0
    correct_attempts: int = 0
    total_attempts: int = 0
    added_date: str

class WordCreate(WordBase):
    pass

class WordUpdate(BaseModel):
    original: Optional[str] = None
    pronunciation: Optional[str] = None
    meaning: Optional[str] = None
    category: Optional[str] = None
    priority: Optional[int] = None
    mastery_level: Optional[float] = None
    times_studied: Optional[int] = None
    correct_attempts: Optional[int] = None
    total_attempts: Optional[int] = None

class WordResponse(WordBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# StudyStats schemas
class StudyStatsBase(BaseModel):
    total_answered: int = 0
    correct_answers: int = 0
    studied_words: List[str] = []
    weak_words: List[str] = []
    daily_streak: int = 0
    daily_goal: int = 20
    daily_progress: int = 0
    words_per_minute: float = 0.0

class StudyStatsCreate(StudyStatsBase):
    pass

class StudyStatsUpdate(BaseModel):
    total_answered: Optional[int] = None
    correct_answers: Optional[int] = None
    studied_words: Optional[List[str]] = None
    weak_words: Optional[List[str]] = None
    daily_streak: Optional[int] = None
    daily_goal: Optional[int] = None
    daily_progress: Optional[int] = None
    words_per_minute: Optional[float] = None

class StudyStatsResponse(StudyStatsBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True 