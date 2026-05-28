from fastapi import APIRouter
from .chat import router as chat_router
from .subjects import router as subjects_router
from .materials import router as materials_router
from .evaluations import router as evaluations_router
from .quiz import router as quiz_router

api_router = APIRouter()
api_router.include_router(chat_router, tags=["chat"])
api_router.include_router(subjects_router, prefix="/subjects", tags=["subjects"])
api_router.include_router(materials_router, prefix="/materials", tags=["materials"])
api_router.include_router(evaluations_router, prefix="/evaluations", tags=["evaluations"])
api_router.include_router(quiz_router, prefix="/quiz", tags=["quiz"])
