# Portfolio-MDE Dashboard

## Description (280 caractères max)

Tableau de bord de gestion pour la Maison de l'Entreprise (pépinière). Il centralise utilisateurs, entreprises hébergées, formations et ateliers, veille économique, agenda, notifications et une messagerie en temps réel, avec une gestion fine des rôles et permissions.

## Technologies utilisées

**Backend**
- Python 3
- Flask (API REST) + Flask-RESTful
- Flask-SocketIO / Socket.IO (messagerie temps réel)
- SQLAlchemy (ORM) + Alembic (migrations)
- Flask-JWT-Extended (authentification JWT)
- APScheduler (tâches planifiées) + feedparser (flux RSS de veille économique)
- SQLite (dev) / PostgreSQL (prod)
- Swagger / OpenAPI (documentation API)

**Frontend**
- React
- Vite
- Tailwind CSS
- socket.io-client
- lucide-react (icônes)

**Outils**
- pytest (tests)
- Git / GitHub
