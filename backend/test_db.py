import asyncio
import uuid
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy.future import select
from sqlalchemy.pool import NullPool
from db.models import QuizAttempt, Weakness, User
from core.config import settings

async def main():
    engine = create_async_engine(
        settings.DATABASE_URL,
        poolclass=NullPool,
        connect_args={
            "prepared_statement_cache_size": 0,
            "statement_cache_size": 0
        }
    )
    async_session = sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)
    
    async with async_session() as session:
        result = await session.execute(select(User))
        users = result.scalars().all()
        print(f"Users: {len(users)}")
        if users:
            uid = users[0].id
            print(f"Testing insert for user {uid}")
            try:
                new_attempt = QuizAttempt(
                    id=str(uuid.uuid4()),
                    quiz_id="test-quiz",
                    user_id=uid,
                    score=100,
                    ai_feedback="Test"
                )
                session.add(new_attempt)
                await session.commit()
                print("Insert successful!")
            except Exception as e:
                print(f"Insert failed: {e}")
        else:
            print("No users found!")

asyncio.run(main())
