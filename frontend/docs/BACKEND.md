# 📦 BACKLOG PRODUIT — BACKEND FLASK / SQLALCHEMY (PÉPINIÈRE D’ENTREPRISE)

## 🎯 CONTEXTE PRODUIT

Backend Flask REST API + SQLAlchemy pour une pépinière d’entreprises.

### Fonctionnalités :

- Gestion utilisateurs (employés)
- Gestion entreprises
- Gestion formations
- Chat temps réel inter-entreprises
- Documentation technique + utilisateur

---

# 👥 RÉPARTITION ÉQUIPE (1.5 DÉVELOPPEURS)

## 🧑‍💻 DÉVELOPPEUR A — CORE BACKEND (FULL OWNERSHIP)

Responsabilité : fondation technique + sécurité

### Domaines :

- Architecture Flask
- Authentification
- Users
- Companies
- Permissions
- Sécurité globale API
- Intégration globale

👉 Mission : garantir un backend stable, sécurisé, extensible

---

## 🧑‍💻 DÉVELOPPEUR B — FEATURES PRODUIT (0.5 CAPACITY)

Responsabilité : fonctionnalités métier

### Domaines :

- Formations
- Chat REST
- Chat WebSocket
- UX API

👉 Mission : construire les features uniquement sur fondation stable

---

# 🧱 EPIC 0 — INITIALISATION & CADRE PROJET

## US0.1 — Création environnement projet

### Micro-tâches

- Créer dépôt GitHub (nommage standard backend-pepiniere)
- Initialiser README.md avec description projet
- Initialiser licence (MIT ou propriétaire)
- Créer environnement virtuel Python (python -m venv venv)
- Activer environnement virtuel
- Installer Flask (pip install flask)
- Installer Flask-RESTful (pip install flask-restful)
- Installer Flask-JWT-Extended (pip install flask-jwt-extended)
- Installer SQLAlchemy (pip install sqlalchemy)
- Générer requirements.txt figé

---

## US0.2 — Structure projet Flask

### Micro-tâches

- créer backend Flask avec app factory
- créer modules : models, persistence, api, services
- config variables d’environnement (.env)
- structurer la configuration par environnement (dev/test/prod)
- créer dossier /shared pour utils communs

---

## US0.3 — Standards de développement

### Micro-tâches

- définir naming models (snake_case fields)
- définir naming endpoints REST
- définir conventions serializers
- définir conventions permissions
- définir structure branches Git (main/dev/feature)
- créer CONTRIBUTING.md
- définir rules PR review

---

## US0.4 — Documentation initiale

### Micro-tâches

- créer dossier /docs
- créer architecture_overview.md
- décrire modules backend
- décrire flux utilisateur global
- créer api_overview.md (vide structuré)

---

# 🧑‍💻 DEV A — CORE BACKEND

# 👤 EPIC A1 — AUTHENTIFICATION & USERS

## A1.1 — Modèle utilisateur custom

### Micro-tâches

- créer app users
- créer classe User SQLAlchemy
- ajouter champ role (employee, admin, superadmin)
- ajouter company_id nullable
- utiliser email comme identifiant métier
- configurer la validation email et le hash du mot de passe
- créer migration initiale
- vérifier intégrité migration

---

## A1.2 — Serializers utilisateurs

### Micro-tâches

- créer UserSerializer (lecture)
- créer UserCreateSerializer (écriture)
- valider password strength
- hash password automatiquement
- exclure champs sensibles (password)

---

## A1.3 — Auth JWT

### Micro-tâches

- installer SimpleJWT
- config REST_FRAMEWORK authentication
- config token lifetime (access/refresh)
- créer endpoint /auth/register
- créer endpoint /auth/login
- créer endpoint /auth/refresh
- créer endpoint /auth/logout (blacklist)

---

## A1.4 — User API

### Micro-tâches

- créer endpoint GET /users/me
- créer endpoint PATCH /users/me
- créer endpoint GET /users/{id}
- créer endpoint GET /users
- ajouter pagination users
- ajouter filtre company_id

---

## A1.5 — Permissions système

### Micro-tâches

- créer BasePermission custom
- créer IsAuthenticated strict
- créer IsAdminPépi (super admin système)
- créer IsCompanyMember
- bloquer accès cross-company

---

# 🏢 EPIC A2 — ENTREPRISES

## A2.1 — Modèle Company

### Micro-tâches

- créer app companies
- créer model Company
- ajouter champ name (unique)
- ajouter champ description (text)
- ajouter created_at
- ajouter updated_at
- générer migration

---

## A2.2 — Serializers Company

### Micro-tâches

- créer CompanySerializer (read)
- créer CompanyWriteSerializer
- validation name unique
- validation description length

---

## A2.3 — CRUD Companies

### Micro-tâches

- endpoint POST /companies
- endpoint GET /companies
- endpoint GET /companies/{id}
- endpoint PATCH /companies/{id}
- endpoint DELETE /companies/{id}
- pagination liste companies

---

## A2.4 — Liaison User ↔ Company

### Micro-tâches

- ajouter FK user.company nullable
- endpoint assign user to company
- endpoint remove user from company
- validation 1 user = 1 company
- protection changement entreprise

---

# 🔐 EPIC A3 — SÉCURITÉ GLOBALE

## A3.1 — Isolation données

### Micro-tâches

- filtrer users par company
- filtrer trainings par access scope
- filtrer chat rooms par membership

---

## A3.2 — Logging sécurité

### Micro-tâches

- log login success
- log login failure
- log permission denied
- log suspicious access

---

# 🧑‍💻 DEV B — FEATURES PRODUIT

# 🎓 EPIC B1 — FORMATIONS

## B1.1 — Modèle Training

### Micro-tâches

- créer app trainings
- créer model Training
- champ title (string)
- champ description (text)
- champ date (datetime)
- champ capacity (int)
- champ created_by FK user
- migration DB

---

## B1.2 — Enrollment

### Micro-tâches

- créer model Enrollment
- FK user
- FK training
- champ created_at
- empêcher double inscription
- vérifier capacity avant insert

---

## B1.3 — API formations

### Micro-tâches

- POST /trainings
- GET /trainings
- GET /trainings/{id}
- PATCH /trainings/{id}
- DELETE /trainings/{id}
- POST /trainings/{id}/join
- GET /me/trainings

---

# 💬 EPIC B2 — CHAT REST

## B2.1 — Modèles chat

### Micro-tâches

- créer app chat
- model Room
- champ type (GLOBAL/COMPANY/PRIVATE)
- champ name nullable
- model Message
- FK sender
- FK room
- content text
- timestamp auto

---

## B2.2 — API chat

### Micro-tâches

- POST /rooms
- GET /rooms
- GET /rooms/{id}
- POST /rooms/{id}/messages
- GET /rooms/{id}/messages
- pagination messages

---

## B2.3 — Logique chat

### Micro-tâches

- créer room globale automatique
- créer room entreprise automatique
- créer room privée dynamique
- validation accès room

---

# ⚡ EPIC B3 — CHAT WEBSOCKET

## B3.1 — Infrastructure WebSockets

### Micro-tâches

- config ASGI.py
- config routing websocket
- config channel layers Redis
- test connection websocket brut

---

## B3.2 — Consumer chat

### Micro-tâches

- connect websocket
- disconnect websocket
- join group room
- leave group room
- receive message
- broadcast message

---

## B3.3 — Sécurité WebSocket

### Micro-tâches

- vérifier auth token websocket
- vérifier accès room
- bloquer user externe

---

# 📚 EPIC FINAL — DOCUMENTATION

## DOC1 — Documentation technique

### Micro-tâches

- architecture backend globale
- diagramme entités (users/companies/chat/trainings)
- flux authentication JWT
- flux chat websocket
- flux formations

---

## DOC2 — Documentation API

### Micro-tâches

- document auth endpoints
- document users endpoints
- document companies endpoints
- document trainings endpoints
- document chat endpoints
- ajouter exemples JSON

---

## DOC3 — Documentation utilisateur

### Micro-tâches

- comment se connecter
- comment rejoindre entreprise
- comment accéder formations
- comment utiliser chat

---

## DOC4 — Documentation déploiement

### Micro-tâches

- setup serveur prod
- variables environnement
- migration production
- run server prod

---

# 🚀 RÈGLES DE TRAVAIL

- 1 micro-tâche = 15 à 120 min max
- 5 à 12 tâches/jour/dev
- PR obligatoire par micro-feature
- backend stable avant features
- REST avant WebSocket

---

# 🔥 OBJECTIF FINAL

Backend modulaire, sécurisé, scalable avec chat temps réel multi-entreprises + API documentée + architecture propre production-ready

# JSON TRELO

{
"board": "Backend Pépinière Flask",
"lists": [
{
"name": "🧱 BACKLOG",
"cards": [
"Setup repo Git + README",
"Installer Flask + Flask-RESTful + SQLAlchemy",
"Créer structure apps (users, companies, trainings, chat)",
"Configurer settings dev/prod",
"Configurer JWT auth",
"Configurer les WebSockets"
]
},
{
"name": "👤 DEV A - CORE BACKEND",
"cards": [
"Créer Custom User model",
"Ajouter roles utilisateurs",
"Configurer le modèle User SQLAlchemy",
"Créer endpoints auth (login/register/refresh/logout)",
"Créer API /me (profil user)",
"Créer model Company",
"CRUD Companies API",
"Liaison User ↔ Company",
"Créer système permissions globales",
"Isolation données par entreprise"
]
},
{
"name": "🎓 DEV B - FORMATIONS",
"cards": [
"Créer model Training",
"Créer model Enrollment",
"API CRUD Trainings",
"API inscription formation",
"Validation capacity training",
"Lister formations user"
]
},
{
"name": "💬 DEV B - CHAT REST",
"cards": [
"Créer model Room",
"Créer model Message",
"API create/list rooms",
"API send message",
"API list messages",
"Room GLOBAL + COMPANY + PRIVATE"
]
},
{
"name": "⚡ DEV B - CHAT WEBSOCKET",
"cards": [
"Configurer ASGI",
"Configurer la couche temps réel",
"Configurer Redis layer",
"Créer ChatConsumer",
"Join/Leave room websocket",
"Broadcast messages",
"Sécuriser websocket auth"
]
},
{
"name": "📚 DOCUMENTATION",
"cards": [
"Architecture backend",
"Diagramme entités",
"Documentation API",
"Documentation utilisateur",
"Documentation déploiement"
]
},
{
"name": "🧪 TESTS & STABILISATION",
"cards": [
"Tests auth",
"Tests companies",
"Tests trainings",
"Tests chat REST",
"Tests websocket"
]
}
]
}

# Architecture FLASK

backend/
│
├── api/ # ressources Flask
├── persistence/ # SQLAlchemy + services
│ ├── settings/
│ │ ├── base.py
│ │ ├── dev.py
│ │ ├── prod.py
│ ├── urls.py
│ ├── asgi.py
│ ├── wsgi.py
│
├── apps/
│ ├── users/
│ │ ├── models.py
│ │ ├── serializers.py
│ │ ├── views.py
│ │ ├── services.py # logique métier
│ │ ├── permissions.py
│ │
│ ├── companies/
│ │ ├── models.py
│ │ ├── serializers.py
│ │ ├── views.py
│ │ ├── services.py
│ │
│ ├── trainings/
│ │ ├── models.py
│ │ ├── serializers.py
│ │ ├── views.py
│ │ ├── services.py
│ │
│ ├── chat/
│ │ ├── models.py
│ │ ├── consumers.py # websocket
│ │ ├── routing.py
│ │ ├── services.py
│
├── core/
│ ├── permissions.py
│ ├── exceptions.py
│ ├── utils.py
│
├── shared/
│ ├── base_model.py
│ ├── timestamps.py
│
└── manage.py

Idée clé :

views = API
services = logique métier (IMPORTANT)
models = données uniquement
core = règles globales

# SCHÉMA BASE DE DONNÉES (ERD LOGIQUE)

## USER

id (PK)
username
email
password
role
company_id (FK → COMPANY)

        │
        │ many-to-one
        ▼

## COMPANY

id (PK)
name
description
created_at

        │
        ├───────────────┐
        ▼               ▼

TRAINING CHAT ROOM

---

id id
title name
description type (GLOBAL / COMPANY / PRIVATE)
date company_id (nullable)
capacity

        │
        ▼

## ENROLLMENT

id
user_id (FK)
training_id (FK)
created_at

## CHAT MESSAGE

id
room_id (FK)
sender_id (FK → USER)
content
timestamp

# PLAN EXACT JOUR PAR JOUR (15 JOURS)

## JOUR 1

setup repo
Flask install
SQLAlchemy install
structure modules

## JOUR 2

settings clean (dev/prod)
JWT setup
SQLite setup

## JOUR 3

custom User model
roles
migrations

## JOUR 4

auth API (login/register)
/me endpoint

## JOUR 5

Company model
Company CRUD

## JOUR 6

user ↔ company
permissions base

## JOUR 7

Training model
Training CRUD

## JOUR 8

Enrollment system
join training

## JOUR 9

Chat models (Room + Message)
REST API chat

## JOUR 10

chat logique (rooms types)
pagination messages

## JOUR 11

Channels setup
ASGI config
Redis layer

## JOUR 12

WebSocket consumer
join room + broadcast

## JOUR 13

sécurisation websocket
auth websocket

## JOUR 14

tests API (auth, company, training)

## JOUR 15

documentation complète
API docs
user docs
clean finalisation
