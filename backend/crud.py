from sqlalchemy.orm import Session
from typing import List, Optional
from models import Word, StudyStats
from schemas import WordCreate, WordUpdate, StudyStatsCreate, StudyStatsUpdate

# Word CRUD operations
class WordCRUD:
    def get_words(self, db: Session, skip: int = 0, limit: int = 100) -> List[Word]:
        return db.query(Word).offset(skip).limit(limit).all()

    def get_word(self, db: Session, word_id: int) -> Optional[Word]:
        return db.query(Word).filter(Word.id == word_id).first()

    def create_word(self, db: Session, word: WordCreate) -> Word:
        db_word = Word(**word.dict())
        db.add(db_word)
        db.commit()
        db.refresh(db_word)
        return db_word

    def update_word(self, db: Session, word_id: int, word: WordUpdate) -> Optional[Word]:
        db_word = db.query(Word).filter(Word.id == word_id).first()
        if db_word:
            update_data = word.dict(exclude_unset=True)
            for field, value in update_data.items():
                setattr(db_word, field, value)
            db.commit()
            db.refresh(db_word)
        return db_word

    def delete_word(self, db: Session, word_id: int) -> bool:
        db_word = db.query(Word).filter(Word.id == word_id).first()
        if db_word:
            db.delete(db_word)
            db.commit()
            return True
        return False

    def get_words_by_category(self, db: Session, category: str) -> List[Word]:
        return db.query(Word).filter(Word.category == category).all()

    def get_words_by_date(self, db: Session, study_date: str) -> List[Word]:
        """특정 날짜의 단어들 조회"""
        return db.query(Word).filter(Word.study_date == study_date).all()

    def get_available_dates(self, db: Session) -> List[str]:
        """사용 가능한 학습 날짜 목록 조회"""
        from sqlalchemy import distinct
        dates = db.query(distinct(Word.study_date)).filter(Word.study_date.isnot(None)).all()
        return [date[0] for date in dates if date[0]]

    def get_weak_words(self, db: Session) -> List[Word]:
        """정확도 70% 미만인 단어들 조회"""
        return db.query(Word).filter(
            Word.total_attempts > 0,
            (Word.correct_attempts / Word.total_attempts) < 0.7
        ).all()

    def record_study_session(self, db: Session, word_id: int, correct: bool) -> Optional[Word]:
        db_word = db.query(Word).filter(Word.id == word_id).first()
        if db_word:
            db_word.times_studied += 1
            db_word.total_attempts += 1
            if correct:
                db_word.correct_attempts += 1
                db_word.mastery_level = min(5.0, db_word.mastery_level + 0.5)
            else:
                db_word.mastery_level = max(0.0, db_word.mastery_level - 0.25)
            
            # Round to nearest 0.5
            db_word.mastery_level = round(db_word.mastery_level * 2) / 2
            
            db.commit()
            db.refresh(db_word)
        return db_word

# StudyStats CRUD operations
class StudyStatsCRUD:
    def get_study_stats(self, db: Session) -> Optional[StudyStats]:
        return db.query(StudyStats).first()

    def create_study_stats(self, db: Session, stats: StudyStatsCreate) -> StudyStats:
        db_stats = StudyStats(**stats.dict())
        db.add(db_stats)
        db.commit()
        db.refresh(db_stats)
        return db_stats

    def update_study_stats(self, db: Session, stats: StudyStatsUpdate) -> Optional[StudyStats]:
        db_stats = db.query(StudyStats).first()
        if db_stats:
            update_data = stats.dict(exclude_unset=True)
            for field, value in update_data.items():
                setattr(db_stats, field, value)
            db.commit()
            db.refresh(db_stats)
        return db_stats

    def add_studied_word(self, db: Session, word_id: int) -> Optional[StudyStats]:
        db_stats = db.query(StudyStats).first()
        if db_stats:
            if str(word_id) not in db_stats.studied_words:
                db_stats.studied_words.append(str(word_id))
                db.commit()
                db.refresh(db_stats)
        return db_stats

    def add_weak_word(self, db: Session, word_id: int) -> Optional[StudyStats]:
        db_stats = db.query(StudyStats).first()
        if db_stats:
            if str(word_id) not in db_stats.weak_words:
                db_stats.weak_words.append(str(word_id))
                db.commit()
                db.refresh(db_stats)
        return db_stats

# Create instances
word_crud = WordCRUD()
study_stats_crud = StudyStatsCRUD() 