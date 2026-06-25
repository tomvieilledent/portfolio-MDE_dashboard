#!/root/Holberton/portfolio-MDE_dashboard/.venv/bin/python
"""Crée 3 comptes de démo (user / admin / superuser) idempotents."""

from werkzeug.security import generate_password_hash

from backend.persistence.db import SessionLocal
from backend.persistence.models import User as ORMUser, Company as ORMCompany

COMPANY_NAME = "MDE Démo"


def upsert_user(session, email, password, first, last, **flags):
    user = session.query(ORMUser).filter(ORMUser.email == email).first()
    if user is None:
        user = ORMUser(email=email)
        session.add(user)
    user.password_hash = generate_password_hash(password)
    user.first_name = first
    user.last_name = last
    user.is_active = True
    for k, v in flags.items():
        setattr(user, k, v)
    session.flush()
    return user


def main() -> int:
    session = SessionLocal()
    try:
        # Entreprise démo (pour donner un rôle "patron" réel à l'admin)
        company = session.query(ORMCompany).filter(
            ORMCompany.name == COMPANY_NAME).first()
        if company is None:
            company = ORMCompany(name=COMPANY_NAME, is_active=True)
            session.add(company)
            session.flush()

        superuser = upsert_user(
            session, "superuser@mde.com", "superuser", "Super", "User",
            is_super_admin=True)

        admin = upsert_user(
            session, "admin@mde.com", "admin", "Admin", "MDE",
            is_super_admin=False, is_company_admin=True, company_id=company.id)

        upsert_user(
            session, "user@mde.com", "user", "Simple", "User",
            is_super_admin=False, company_id=company.id)

        # admin = patron de l'entreprise démo
        company.admin_id = admin.id
        company.admin_email = admin.email

        session.commit()
        print("Comptes créés/à jour :")
        print("  superuser@mde.com / superuser   (super admin)")
        print(f"  admin@mde.com     / admin       (patron de '{COMPANY_NAME}')")
        print(f"  user@mde.com      / user        (membre de '{COMPANY_NAME}')")
        return 0
    except Exception as exc:
        session.rollback()
        print(f"Error: {exc}")
        return 1
    finally:
        session.close()


if __name__ == "__main__":
    raise SystemExit(main())
