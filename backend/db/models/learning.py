from sqlalchemy import Column, String, Integer, ForeignKey, JSON, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from db.session import Base
from db.models.user import generate_uuid

class LearningSession(Base):
    __tablename__ = "learning_sessions"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String) # Removed ForeignKey("users.id")
    topic_id = Column(String, ForeignKey("topics.id"))
    start_time = Column(DateTime, default=lambda: datetime.now(timezone.utc).replace(tzinfo=None))
    end_time = Column(DateTime, nullable=True)
    current_difficulty = Column(String, default="beginner") # beginner, intermediate, advanced

class MasteryTracking(Base):
    __tablename__ = "mastery_tracking"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String) # Removed ForeignKey("users.id")
    topic_id = Column(String, ForeignKey("topics.id"))
    mastery_level = Column(Integer, default=0) # 0 to 100
    weak_concepts = Column(JSON, default=list) # List of strings
    last_reviewed = Column(DateTime, default=lambda: datetime.now(timezone.utc).replace(tzinfo=None))

class Weakness(Base):
    __tablename__ = "weaknesses"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String) # Removed ForeignKey("users.id")
    topic_id = Column(String, ForeignKey("topics.id"))
    concept = Column(String, nullable=False)
    mistake_count = Column(Integer, default=1)
    last_detected = Column(DateTime, default=lambda: datetime.now(timezone.utc))
