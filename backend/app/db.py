import os
from sqlmodel import SQLModel, create_engine

_DB_URL = os.getenv("DATABASE_URL", "sqlite:///./nomad_ai.db")
_engine = create_engine(_DB_URL, echo=False)


def get_engine():
	return _engine


def create_db_and_tables():
	SQLModel.metadata.create_all(_engine)