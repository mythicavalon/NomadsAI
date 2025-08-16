from fastapi import APIRouter, HTTPException
from typing import List
from pydantic import BaseModel
from sqlmodel import Session, select

from ..db import get_engine, create_db_and_tables
from ..models import MemoryEntry

router = APIRouter()


class MemoryCreate(BaseModel):
	title: str
	content: str
	destination: str


class MemoryResponse(BaseModel):
	id: int
	title: str
	content: str
	destination: str
	created_at: str


@router.on_event("startup")
async def on_startup():
	create_db_and_tables()


@router.get("/", response_model=List[MemoryResponse])
async def list_memories():
	with Session(get_engine()) as session:
		statement = select(MemoryEntry).order_by(MemoryEntry.created_at.desc())
		items = session.exec(statement).all()
		return [
			MemoryResponse(
				id=item.id,
				title=item.title,
				content=item.content,
				destination=item.destination,
				created_at=item.created_at.isoformat(),
			)
			for item in items
		]


@router.post("/", response_model=MemoryResponse)
async def create_memory(payload: MemoryCreate):
	with Session(get_engine()) as session:
		item = MemoryEntry(title=payload.title, content=payload.content, destination=payload.destination)
		session.add(item)
		session.commit()
		session.refresh(item)
		return MemoryResponse(
			id=item.id,
			title=item.title,
			content=item.content,
			destination=item.destination,
			created_at=item.created_at.isoformat(),
		)


@router.delete("/{memory_id}")
async def delete_memory(memory_id: int):
	with Session(get_engine()) as session:
		obj = session.get(MemoryEntry, memory_id)
		if not obj:
			raise HTTPException(status_code=404, detail="Not found")
		session.delete(obj)
		session.commit()
		return {"deleted": True}