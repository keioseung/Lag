from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, date, time

# Word schemas
class WordBase(BaseModel):
    original: str
    pronunciation: str
    meaning: str
    category: str = "중국어"
    priority: int = 0
    mastery_level: float = 0.0
    times_studied: int = 0
    correct_attempts: int = 0
    total_attempts: int = 0
    added_date: str
    difficulty_level: int = 1
    is_active: bool = True
    tags: List[str] = []
    notes: Optional[str] = None

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
    difficulty_level: Optional[int] = None
    is_active: Optional[bool] = None
    tags: Optional[List[str]] = None
    notes: Optional[str] = None

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
    total_study_time: int = 0
    average_accuracy: float = 0.0
    last_study_date: Optional[date] = None

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
    total_study_time: Optional[int] = None
    average_accuracy: Optional[float] = None
    last_study_date: Optional[date] = None

class StudyStatsResponse(StudyStatsBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# StudySession schemas
class StudySessionBase(BaseModel):
    session_id: str
    user_id: Optional[str] = None
    session_type: str = "flashcard"
    total_words: int = 0
    correct_words: int = 0
    session_duration: int = 0
    difficulty_level: int = 1

class StudySessionCreate(StudySessionBase):
    pass

class StudySessionUpdate(BaseModel):
    end_time: Optional[datetime] = None
    total_words: Optional[int] = None
    correct_words: Optional[int] = None
    session_duration: Optional[int] = None

class StudySessionResponse(StudySessionBase):
    id: int
    start_time: datetime
    end_time: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True

# SessionAnswer schemas
class SessionAnswerBase(BaseModel):
    session_id: str
    word_id: int
    is_correct: bool
    response_time_ms: Optional[int] = None
    user_answer: Optional[str] = None
    correct_answer: Optional[str] = None

class SessionAnswerCreate(SessionAnswerBase):
    pass

class SessionAnswerResponse(SessionAnswerBase):
    id: int
    answer_time: datetime
    created_at: datetime

    class Config:
        from_attributes = True

# UserProfile schemas
class UserProfileBase(BaseModel):
    email: str
    username: Optional[str] = None
    native_language: str = "ko"
    target_language: str = "zh"
    daily_goal: int = 20
    notification_enabled: bool = True
    study_reminder_time: time = time(9, 0)
    preferred_difficulty: int = 1

class UserProfileCreate(UserProfileBase):
    pass

class UserProfileUpdate(BaseModel):
    username: Optional[str] = None
    native_language: Optional[str] = None
    target_language: Optional[str] = None
    daily_goal: Optional[int] = None
    notification_enabled: Optional[bool] = None
    study_reminder_time: Optional[time] = None
    preferred_difficulty: Optional[int] = None

class UserProfileResponse(UserProfileBase):
    id: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True 