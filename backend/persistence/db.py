"""Database engine and session configuration for SQLAlchemy.

This module centralizes the engine creation, the session factory
(`SessionLocal`) and the declarative `Base` used by ORM models.
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from pathlib import Path

# default DB file placed in project root to avoid cwd-related permission issues
project_root = Path(__file__).resolve().parents[2]
default_db = project_root / 'data.db'
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{default_db}")

# echo=True for debugging if needed
engine = create_engine(DATABASE_URL, echo=False, future=True)
SessionLocal = sessionmaker(
    bind=engine, autoflush=False, autocommit=False, future=True)
Base = declarative_base()

# Ensure SQLite file exists and is writable when using a file-based DB
try:
    if engine.url.drivername == 'sqlite':
        db_file = Path(engine.url.database)
        db_file.parent.mkdir(parents=True, exist_ok=True)
        if not db_file.exists():
            # create an empty file with user-write permissions
            db_file.touch()
            try:
                db_file.chmod(0o644)
            except Exception:
                pass
except Exception:
    # best-effort; if this fails, SQLAlchemy will report errors later
    pass
