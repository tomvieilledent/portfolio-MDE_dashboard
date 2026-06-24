"""Database engine and session configuration for SQLAlchemy.

This module centralizes the engine creation, the session factory
(`SessionLocal`) and the declarative `Base` used by ORM models.
"""

import os
from sqlalchemy import create_engine, text
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
# Try to create tables if models are available. This helps single-file test runs
# where the global `data.db` may be missing or outdated. Use best-effort only.
try:
    # import here to avoid circular import when models import Base
    from backend.persistence import models as _models
    # If the sqlite file exists but was created with an older schema (missing
    # recently added columns), attempt a best-effort migration by recreating
    # the schema. We check a representative table for the new column.
    try:
        if engine.url.drivername == 'sqlite' and engine.url.database:
            with engine.connect() as conn:
                try:
                    res = conn.execute(
                        "PRAGMA table_info('conversation_participants')")
                    cols = [row[1] for row in res]
                    if 'uploaded_at' not in cols:
                        _models.Base.metadata.drop_all(bind=engine)
                        _models.Base.metadata.create_all(bind=engine)
                    else:
                        _models.Base.metadata.create_all(bind=engine)
                except Exception:
                    # If PRAGMA fails, fall back to create_all
                    _models.Base.metadata.create_all(bind=engine)
        else:
            _models.Base.metadata.create_all(bind=engine)
    except Exception:
        # best-effort, do not fail import
        try:
            _models.Base.metadata.create_all(bind=engine)
        except Exception:
            pass
except Exception:
    pass

# Add missing columns to existing tables (safe ALTER TABLE migrations)
try:
    with engine.connect() as conn:
        res = conn.execute(text("PRAGMA table_info('news')"))
        news_cols = [row[1] for row in res]
        if 'category' not in news_cols:
            conn.execute(text("ALTER TABLE news ADD COLUMN category VARCHAR(100)"))
            conn.commit()
except Exception:
    pass

try:
    with engine.connect() as conn:
        res = conn.execute(text("PRAGMA table_info('messages')"))
        message_cols = [row[1] for row in res]
        if 'is_read' not in message_cols:
            conn.execute(text(
                "ALTER TABLE messages ADD COLUMN is_read BOOLEAN DEFAULT 0"))
            conn.commit()
        if 'is_active' not in message_cols:
            conn.execute(text(
                "ALTER TABLE messages ADD COLUMN is_active BOOLEAN DEFAULT 1"))
            conn.commit()
except Exception:
    pass

try:
    with engine.connect() as conn:
        res = conn.execute(text("PRAGMA table_info('formation_users')"))
        fu_cols = [row[1] for row in res]
        if 'saved' not in fu_cols:
            conn.execute(text(
                "ALTER TABLE formation_users ADD COLUMN saved BOOLEAN DEFAULT 0"))
            conn.commit()
except Exception:
    pass

try:
    with engine.connect() as conn:
        res = conn.execute(text("PRAGMA table_info('companies')"))
        company_cols = [row[1] for row in res]
        if 'location' not in company_cols:
            conn.execute(text("ALTER TABLE companies ADD COLUMN location VARCHAR(200)"))
            conn.commit()
except Exception:
    pass
