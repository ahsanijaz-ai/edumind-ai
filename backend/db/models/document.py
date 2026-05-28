from sqlalchemy import Column, String, Boolean, DateTime
from datetime import datetime, timezone
from db.session import Base
from db.models.user import generate_uuid

class UploadedDocument(Base):
    __tablename__ = "uploaded_documents"

    id = Column(String, primary_key=True, default=generate_uuid)
    filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    content_type = Column(String, nullable=True)
    subject_id = Column(String, nullable=False)
    student_id = Column(String, nullable=False)
    processed = Column(Boolean, default=False)
    uploaded_at = Column(DateTime, default=lambda: datetime.now(timezone.utc).replace(tzinfo=None))
