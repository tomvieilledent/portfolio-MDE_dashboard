## Présentation technique — Stage 3 (Maison de l'Economie)

Ce document est une fiche de présentation à lire/présenter à l'équipe pour exposer la documentation technique (Stage 3). Il résume les points clés, propose un plan de slides, des notes à lire, et des actions concrètes par rôle (Frontend, Backend, QA, DevOps, Design, Product).

---

## 1) Pitch d'ouverture (30–45s)

Objectif : présenter l'ambition et le périmètre de l'MVP.

Texte à lire :

"La Maison de l'Economie Dashboard est une plateforme interne pour centraliser l'information, la communication et la formation des collaborateurs. Le MVP couvre : l'authentification sécurisée, l'annuaire des entreprises et employés, la consultation des formations, la messagerie en temps réel et un flux d'actualités économiques. Nous avons conçu une architecture web classique (React frontend, Flask API, PostgreSQL + WebSockets) avec sécurité par JWT et contrôle d'accès par rôle."

---

## 2) Plan de la présentation (slides suggérées)

1. Contexte & objectifs (1 slide)
2. User stories prioritaires (1 slide)
3. Mockups & UX (2 slides)
4. Architecture globale (1 slide — diagramme)
5. Modèle de données & règles (1–2 slides)
6. APIs clés (endpoints importants) (2 slides)
7. Sécurité & contraintes (1 slide)
8. QA, CI/CD et observabilité (1 slide)
9. Roadmap initiale & livrables (1 slide)
10. Appels à l'équipe & prochaines actions (1 slide)

---

## 3) Notes par section (à lire si besoin)

- Contexte & objectifs : rappeler les bénéfices pour les utilisateurs (gain de temps, centralisation, montée en compétences).
- User stories : lister les Must/Should/Could/Won't et insister sur priorités pour la première itération.
- Mockups & UX : montrer les images (dossier `docs/Mockup FIGMA/`) et expliquer brièvement les parcours principaux : connexion → dashboard → annuaire → conversation → formation.
- Architecture : expliquer la séparation des responsabilités (UI / API / DB / WS), pourquoi PostgreSQL et pourquoi WS pour la messagerie.
- Modèle de données : survol des entités principales (User, Company, Training, Enrollment, Message, Notification) et des règles métier (tenant company scoping, unicité enrollment, soft-delete).
- APIs : présenter les endpoints critiques (auth, users, companies, trainings, enrollments, conversations/messages, news, notifications). Donner exemples de payloads et conventions (pagination, filtres, sorting).
- Sécurité : JWT, RBAC, filtrage multi-tenant, validation stricte des inputs, rate-limiting sur auth/messages.
- QA & CI/CD : tests unitaires, e2e, tâches CI (lint, tests, build, security scans), staging + smoke tests.

---

## 4) Appels à l'équipe — actions concrètes

- Frontend (Nabil — tu t'en occupes) :
  - Prioriser les écrans listés dans les mockups (login, dashboard, annuaire, profile, trainings, conversations, news).
  - Contrat API : travailler un petit OpenAPI / Postman collection avec l'équipe backend pour les endpoints listés en Section 6 du Stage 3.
  - Auth flow : implémenter stockage sécurisé du JWT, rafraîchissement de tokens, et redirections côté rôle/compagnie.
  - Real-time : intégrer WS pour la messagerie (reconnect, presence, throttling côté client).

- Backend (Tom) :
  - Implémenter rapidement le modèle de données (BaseClass + entités) et migrer la DB (Postgres).
  - Auth : endpoints /auth/login, /auth/register, /auth/refresh, blacklist des refresh tokens.
  - Conversations/messages : routes REST et websocket events (message.create, message.update).
  - News ingestion : job & endpoint /news/sync (cron ou tâche managée).
  - Documenter l'OpenAPI et les schémas d'entrée/sortie (pydantic / Marshmallow / JSON Schema).

- QA / Tests (Florian) :
  - Écrire tests unitaires pour les services critiques (auth, messages, enrollments).
  - Intégration : tests API (login, user CRUD, training enroll) et un e2e rapide pour le parcours principal.
  - Déployer pipeline CI simple : lint, tests, build image, smoke test en staging.

- DevOps / Infra :
  - Préparer de l'environnement staging : postgres, redis (si nécessaire pour WS), certificat TLS, variable d'env.
  - Déployer un job cron/scheduler pour /news/sync.
  - Observabilité : logs structurés, métriques simples (latence, erreurs 5xx, queue lengths).

- Design :
  - Finaliser les assets Figma et fournir composants (couleurs, boutons, spacing) au frontend.
  - Valider les flux d'inscription et première connexion (empty state, onboarding rapide).

- Product / PO :
  - Valider la liste priorisée des user stories et la roadmap (MVP scope). Confirmer contraintes légales/RGPD sur stockage des données et images.

---

## 5) Risques & points ouverts (à discuter en réunion)

- Auth & sécurité : plan pour gestion des tokens compromis et mot de passe oublié.
- Multi-tenancy : règles d'isolement des données entre companies.
- Performance WS : stratégie montée en charge et limites (sharding, workers).
- Synchronisation des news : sources, quotas API, normalisation du contenu et cache.

---

## 6) Roadmap courte (3 sprints conseillés)

Sprint 1 (2 semaines)
- Auth, modèle de données minimal, CRUD Users & Companies, pages login + annuaire.

Sprint 2 (2 semaines)
- Trainings & enrollments, News basic fetch + display, API docs.

Sprint 3 (2 semaines)
- Conversations/messages (REST + WS), notifications, QA & staging pipeline.

---

## 7) Questions à poser pendant la présentation

1. Y a-t-il des contraintes légales ou outils internes à intégrer dès maintenant (SSO, stockage d'images) ?
2. Quelle granularité de rôles attendons-nous (super_admin / company_admin / user) ?
3. Qui peut fournir les clés/accès pour les sources de news (API) ?
4. Quelle politique de sauvegarde et rétention pour la DB ?

---

## 8) Fichiers & ressources utiles

- Documentation technique complète : `docs/stage-3en.md`
- Mockups : `docs/Mockup FIGMA/` (images PNG)

---

## 9) Conclusion — message à lire en clôture

"Le Stage 3 nous donne une base solide pour démarrer le développement : l'architecture, le modèle de données, les APIs et les priorités sont posés. Aujourd'hui nous avons une feuille de route claire pour les trois premiers sprints. À la fin de cette réunion, nous devons repartir avec : un plan d'actions par rôle, un contrat API minimal, et un premier environnement staging prêt à recevoir nos livrables." 

---

Bonne présentation — si tu veux, je peux aussi générer :
- une version slide-ready (markdown pour reveal.js / Google Slides outline),
- une checklist Jira/Asana à importer (CSV),
- une Postman collection / OpenAPI skeleton pour démarrer l'implémentation backend/frontend.
