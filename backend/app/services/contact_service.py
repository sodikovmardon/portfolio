"""
Contact xizmati — API qatlamidan biznes-logikani ajratib turadi.
"""
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.contact import ContactMessage
from app.schemas.contact import ContactCreate


class ContactService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_message(self, payload: ContactCreate) -> ContactMessage:
        message = ContactMessage(
            name=payload.name,
            email=payload.email,
            message=payload.message,
        )
        self.db.add(message)
        await self.db.commit()
        await self.db.refresh(message)
        return message

    async def list_messages(self, limit: int = 50) -> list[ContactMessage]:
        result = await self.db.execute(
            select(ContactMessage).order_by(ContactMessage.created_at.desc()).limit(limit)
        )
        return list(result.scalars().all())
