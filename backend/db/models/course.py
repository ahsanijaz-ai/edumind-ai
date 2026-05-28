import uuid
from sqlalchemy import Column, String, Integer, ForeignKey, Text
from sqlalchemy.orm import relationship
from db.session import Base
from db.models.user import generate_uuid

class Subject(Base):
    __tablename__ = "subjects"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    student_id = Column(String, nullable=False)

    topics = relationship("Topic", back_populates="subject")

class Topic(Base):
    __tablename__ = "topics"

    id = Column(String, primary_key=True, default=generate_uuid)
    subject_id = Column(String, ForeignKey("subjects.id"))
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    order_index = Column(Integer, default=0)

    subject = relationship("Subject", back_populates="topics")
    lessons = relationship("Lesson", back_populates="topic")

class Lesson(Base):
    __tablename__ = "lessons"

    id = Column(String, primary_key=True, default=generate_uuid)
    topic_id = Column(String, ForeignKey("topics.id"))
    title = Column(String, nullable=False)
    content = Column(Text, nullable=True) # Markdown or HTML
    order_index = Column(Integer, default=0)

    topic = relationship("Topic", back_populates="lessons")
