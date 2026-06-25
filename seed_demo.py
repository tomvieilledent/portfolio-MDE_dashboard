#!/usr/bin/env python3
"""Réinitialise la base et crée 3 comptes de démonstration.

- superuser@mde.com / superuser  -> super admin
- admin@mde.com     / admin       -> admin d'entreprise (patron) de "MDE Démo"
- user@mde.com      / user        -> utilisateur simple (salarié)

Usage: PYTHONPATH=. python seed_demo.py
"""

import uuid
from datetime import datetime, timezone

from werkzeug.security import generate_password_hash

from backend.persistence.db import Base, engine, SessionLocal
from backend.persistence.models import User as ORMUser, Company as ORMCompany


def _now():
    return datetime.now(timezone.utc)


def main() -> int:
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        superuser = ORMUser(
            id=str(uuid.uuid4()),
            email="superuser@mde.com",
            password_hash=generate_password_hash("superuser"),
            first_name="Super", last_name="User",
            is_super_admin=True, is_active=True, created_at=_now(),
        )
        admin = ORMUser(
            id=str(uuid.uuid4()),
            email="admin@mde.com",
            password_hash=generate_password_hash("admin"),
            first_name="Admin", last_name="Entreprise",
            is_super_admin=False, is_active=True, created_at=_now(),
        )
        user = ORMUser(
            id=str(uuid.uuid4()),
            email="user@mde.com",
            password_hash=generate_password_hash("user"),
            first_name="Simple", last_name="Utilisateur",
            is_super_admin=False, is_active=True, created_at=_now(),
        )
        db.add_all([superuser, admin, user])
        db.flush()

        company = ORMCompany(
            id=str(uuid.uuid4()),
            name="MDE Démo",
            description="Entreprise de démonstration hébergée par la Maison De l'Entreprise.",
            admin_email=admin.email,
            admin_id=admin.id,
            is_active=True, created_at=_now(),
        )
        db.add(company)
        db.flush()

        admin.company_id = company.id
        db.add(admin)

        db.commit()
        print("Base réinitialisée. Comptes créés :")
        print("  superuser@mde.com / superuser  (super admin)")
        print("  admin@mde.com     / admin       (patron - MDE Démo)")
        print("  user@mde.com      / user        (utilisateur)")
        return 0
    except Exception as exc:
        db.rollback()
        print(f"Erreur: {exc}")
        return 1
    finally:
        db.close()


if __name__ == "__main__":
    raise SystemExit(main())
