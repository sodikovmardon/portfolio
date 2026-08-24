from fastapi import APIRouter

from app.api.contact import router as contact_router

api_router = APIRouter()
api_router.include_router(contact_router)
