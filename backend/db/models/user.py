import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime
from db.session import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=True) # Optional if using Supabase Auth
    full_name = Column(String, nullable=True)
    role = Column(String, default="student")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc).replace(tzinfo=None))
