"""
/api/contact — portfolio saytidagi Bog'lanish formasi uchun endpoint.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.contact import ContactCreate, ContactRead, ContactResponse
from app.services.contact_service import ContactService

router = APIRouter(prefix="/api/contact", tags=["Contact"])


@router.post("", response_model=ContactResponse, status_code=status.HTTP_201_CREATED)
async def send_contact_message(
    payload: ContactCreate,
    db: AsyncSession = Depends(get_db),
) -> ContactResponse:
    """Yangi xabarni qabul qiladi va bazaga saqlaydi."""
    try:
        service = ContactService(db)
        message = await service.create_message(payload)
        return ContactResponse(
            success=True,
            detail="Xabaringiz muvaffaqiyatli yuborildi.",
            data=ContactRead.model_validate(message),
        )
    except Exception as exc:  # noqa: BLE001 — foydalanuvchiga umumiy xabar qaytariladi
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Xabarni saqlashda xatolik yuz berdi. Birozdan so'ng qayta urinib ko'ring.",
        ) from exc


@router.get("", response_model=list[ContactRead])
async def list_contact_messages(
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
) -> list[ContactRead]:
    """Admin/shaxsiy foydalanish uchun: oxirgi xabarlar ro'yxati."""
    service = ContactService(db)
    messages = await service.list_messages(limit=limit)
    return [ContactRead.model_validate(m) for m in messages]
