from sqlalchemy import Column, String, Integer, ForeignKey, JSON, DateTime, Boolean, Text
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from db.session import Base
from db.models.user import generate_uuid

class Quiz(Base):
    __tablename__ = "quizzes"

    id = Column(String, primary_key=True, default=generate_uuid)
    session_id = Column(String, ForeignKey("learning_sessions.id"))
    topic_id = Column(String, ForeignKey("topics.id"))
    generated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    difficulty = Column(String, default="beginner")

    questions = relationship("QuizQuestion", back_populates="quiz")

class QuizQuestion(Base):
    __tablename__ = "quiz_questions"

    id = Column(String, primary_key=True, default=generate_uuid)
    quiz_id = Column(String, ForeignKey("quizzes.id"))
    question_text = Column(Text, nullable=False)
    question_type = Column(String, default="mcq") # mcq, short, scenario
    options = Column(JSON, nullable=True) # Used for MCQ
    correct_answer = Column(Text, nullable=False)

    quiz = relationship("Quiz", back_populates="questions")

class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String) # Removed ForeignKey("users.id") due to Supabase auth
    quiz_id = Column(String, nullable=True) # Added to track overall quiz attempts
    question_id = Column(String, ForeignKey("quiz_questions.id"), nullable=True)
    user_answer = Column(Text, nullable=True)
    is_correct = Column(Boolean, default=False)
    score = Column(Integer, default=0) # e.g. out of 100
    ai_feedback = Column(Text, nullable=True)
    attempted_at = Column(DateTime, default=lambda: datetime.now(timezone.utc).replace(tzinfo=None))

class AIFeedbackLog(Base):
    __tablename__ = "ai_feedback_logs"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String) # Removed ForeignKey("users.id")
    session_id = Column(String, ForeignKey("learning_sessions.id"), nullable=True)
    action = Column(String, nullable=False) # e.g., "difficulty_change", "concept_reteach"
    details = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc).replace(tzinfo=None))
