import asyncio
import sys
import os
sys.path.append(os.path.dirname(__file__))

from sqlalchemy.ext.asyncio import create_async_engine
from core.config import settings
from db.models import Base

async def reset_db():
    engine = create_async_engine(settings.DATABASE_URL, connect_args={"statement_cache_size": 0})
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.execute(org_sqlalchemy_text("DROP TABLE IF EXISTS alembic_version;"))
    await engine.dispose()

if __name__ == "__main__":
    from sqlalchemy import text as org_sqlalchemy_text
    asyncio.run(reset_db())
    print("Database reset complete.")
