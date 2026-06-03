# Backend - Vue d'ensemble

Ce fichier resume le fonctionnement du backend actuel du projet. L'objectif est de te donner une carte simple du code: ou l'application demarre, comment une requete traverse les couches, quels modules font quoi, et a quoi servent les modeles et les facades. L'idee est de te faire suivre le chemin complet d'une requete, depuis la route HTTP jusqu'a la base de donnees.

## 1. Architecture generale

Le backend est construit avec:

- Flask pour l'application web.
- Flask-RESTful pour declarer les routes REST sous forme de ressources.
- Flask-JWT-Extended pour l'authentification par token.
- SQLAlchemy pour la persistance en base de donnees.
- Alembic pour les migrations. (outil qui versionne la base de donnees: chaque changement du schema est decrit dans une migration, ce qui permet de recreer et d'appliquer les modifications de facon propre et reproductible sur tous les environnements. Si on ajoute une table ou une colonne, Alembic garde l'historique de cette evolution)

L'idee generale est simple:

1. Une requete HTTP arrive sur une resource Flask-RESTful.
2. La resource verifie et valide les donnees.
3. Elle appelle un service, qui sert de couche de transition.
4. Le service delegue a une facade de persistance.
5. La facade parle a SQLAlchemy et retourne un dictionnaire propre pour l'API.

En pratique, le backend suit donc un style en couches: API -> service -> facade -> base de donnees.

## 2. Point d'entree de l'application

### `backend/api/app.py`

C'est le coeur du backend. Ce fichier contient `create_app()`, qui:

- cree l'application Flask,
- configure la cle JWT,
- installe `JWTManager`,
- declare les callbacks (fonctions automatiques appelees quand un token manque, est invalide, expire ou a ete revoque; elles servent a transformer un probleme JWT en reponse JSON claire au lieu de laisser Flask remonter une erreur technique brute. En pratique, ce sont les fonctions qui expliquent pourquoi l'acces est refuse) pour les tokens manquants, invalides, expires ou revoques,
- enregistre toutes les routes de l'API,
- expose aussi `/`, `/openapi.json`, `/docs` et `/swagger`.

Ce fichier est aussi celui qui relie toutes les resources de l'API:

- auth,
- users,
- companies,
- trainings,
- conversations,
- messages,
- notifications,
- news,
- formation-users.

### `backend/api/run.py`

C'est le lanceur local. Il importe `create_app()` puis lance Flask en mode debug sur `0.0.0.0:5000`.

## 3. Gestion de l'authentification

### `backend/api/jwt_helpers.py`

Ce fichier centralise les helpers autour de JWT, notamment un wrapper `jwt_required` utilise par les resources. L'objectif est d'unifier l'acces protege et le traitement des erreurs de JWT.

### `backend/api/state.py`

Contient le `BLOCKLIST` en memoire. (liste en RAM des tokens deja revoques, donc des jetons qui ont ete refuses apres un logout et qui ne doivent plus servir pour authentifier l'utilisateur. Un token revoque est un token qui existait encore techniquement, mais que le backend decide de ne plus accepter. C'est comme une petite liste noire temporaire: si le token est dedans, le backend sait qu'il doit le refuser, meme si le token n'a pas encore atteint sa date d'expiration. Quand un utilisateur se deconnecte, on ne supprime pas le token chez lui, on marque juste son identifiant comme interdit cote serveur pour empecher toute reutilisation) Quand un token est logout, son identifiant JWT (`jti`) est ajoute ici. La verif est faite par `jwt.token_in_blocklist_loader` dans `app.py`.

### `backend/api/errors.py`

Centralise les codes d'erreur et la forme des reponses d'erreur. Le backend renvoie ainsi des messages coherents au lieu de faire des `return` differents partout.

### `backend/api/swagger.py`

Expose la spec OpenAPI et une page Swagger UI pour tester l'API.

## 4. Les resources API

Les fichiers dans `backend/api/resources/` definissent les endpoints REST.

### `auth.py`

Gere:

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`

Le register et le login renvoient un `access_token` et un `refresh_token`. (le premier sert pour les requetes normales et expire assez vite, le second sert a regenerer un nouveau token d'acces sans ressaisir le mot de passe, ce qui permet de garder une session fluide tout en limitant les risques. Le front envoie donc souvent l'access token, puis n'utilise le refresh token que quand il faut prolonger la session)

### `user.py`

Gere les utilisateurs:

- `GET /users`
- `POST /users`
- `GET /users/me` et `GET /me`
- `PATCH /users/me`
- `GET /users/<id>`
- `PUT /users/<id>`
- `PATCH /users/<id>`
- `DELETE /users/<id>`
- `PATCH /users/<id>/deactivate`
- `POST /users/<id>/reset-password`

### `company.py`

Gere les entreprises:

- `GET /companies`
- `POST /companies`
- `GET /companies/<id>`
- `PATCH /companies/<id>`
- `DELETE /companies/<id>`
- `GET /companies/<id>/users`
- `POST /companies/<id>/users/<user_id>`
- `DELETE /companies/<id>/users/<user_id>`

### `training.py`

Gere les formations:

- `GET /trainings`
- `POST /trainings`
- `GET /trainings/<id>`
- `PATCH /trainings/<id>`
- `DELETE /trainings/<id>`
- `POST /trainings/<id>/enroll`
- `POST /trainings/<id>/join`
- `GET /trainings/<id>/enrollments`
- `GET /users/<user_id>/trainings`
- `GET /me/trainings`

### `conversation.py`

Gere les conversations:

- `GET /conversations`
- `POST /conversations`
- `GET /conversations/<id>`
- `PATCH /conversations/<id>`
- `DELETE /conversations/<id>`

Il existe aussi des alias sous `/rooms`.

### `message.py`

Gere les messages:

- `GET /messages`
- `DELETE /messages/<id>`
- `GET /conversations/<id>/messages`
- `POST /conversations/<id>/messages`

### `notification.py`

Gere les notifications:

- `GET /notifications`
- `POST /notifications`
- `PATCH /notifications/<id>`
- `DELETE /notifications/<id>`

### `news.py`

Gere les news:

- `GET /news`
- `POST /news`
- `GET /news/<id>`
- `DELETE /news/<id>`
- `POST /news/sync`

`/news/sync` est encore un placeholder: il renvoie `501 Not Implemented`.

### `formation_user.py`

Gere les relations utilisateur/formation:

- `GET /formation-users`
- `POST /formation-users`
- `GET /formation-users/<id>`
- `PATCH /formation-users/<id>`
- `DELETE /formation-users/<id>`

## 5. Les modeles metier

Les fichiers dans `backend/models/` ne sont pas les tables SQLAlchemy. Ce sont des modeles de domaine, utilises surtout pour valider les donnees avant l'ecriture en base.

Ils servent a:

- verifier les champs requis,
- normaliser certaines valeurs,
- lever des erreurs propres avant de toucher a la base,
- garder une logique de validation reutilisable dans plusieurs resources.

### `backend/models/base.py`

`BaseModel` fournit des champs communs:

- `id`,
- `is_active`,
- `created_at`,
- `updated_at`,
- `uploaded_at`,
- `deactivate_by`,
- `delete_by`.

Il fournit aussi `to_dict()`.

### `backend/models/user.py`

Le modele `User` valide:

- `email`:
  - doit etre une chaine,
  - doit etre un email valide,
  - max 254 caracteres,
  - normalise en minuscule.
- `password`:
  - chaine,
  - au moins 8 caracteres,
  - au plus 256 caracteres.
- `first_name` et `last_name`:
  - optionnels,
  - chaines non vides,
  - max 100 caracteres.

Il fournit aussi deux helpers statiques: (petites fonctions reutilisables pour verifier un prenom ou un nom partout dans le backend; elles evitent de dupliquer les memes regles de nettoyage et de longueur dans plusieurs routes. C'est important parce que les memes contraintes doivent rester identiques dans toute l'API)

- `validate_first_name()`
- `validate_last_name()`

### `backend/models/company.py`

Valide:

- `name` obligatoire,
- `description` optionnelle,
- `website_link` optionnel,
- `company_picture` optionnelle,
- `admin_email` optionnel mais valide,
- `admin_id` optionnel mais de type UUID valide.

### `backend/models/training.py`

Valide:

- `title` obligatoire,
- `description` optionnelle,
- `picture` optionnelle,
- `company_id` optionnel.

### Autres modeles de domaine

Le meme principe existe pour:

- `backend/models/conversation.py`,
- `backend/models/message.py`,
- `backend/models/notification.py`,
- `backend/models/news.py`,
- `backend/models/formation_user.py`.

Ils servent a valider les donnees d'entree avant de passer a la persistence.

## 6. Les modeles SQLAlchemy

### `backend/persistence/models.py`

Ce fichier definit les tables ORM.

Les principales entites sont:

- `User` -> table `users`
- `Company` -> table `companies`
- `Training` -> table `trainings`
- `Message` -> table `messages`
- `Conversation` -> table `conversations`
- `ConversationParticipant` -> table `conversation_participants`
- `Notification` -> table `notifications`
- `News` -> table `news`
- `FormationUser` -> table `formation_users`

Les colonnes y sont directement definies avec SQLAlchemy, par exemple:

- `User` contient `email`, `password_hash`, `first_name`, `last_name`, `phone`, `company_id`, `is_super_admin`, `is_active`.
- `Company` contient `name`, `description`, `admin_email`, `admin_id`, `is_active`.
- `Training` contient `title`, `company_id`, `description`, `picture`, `is_active`.
- `Message` contient `author_id`, `recipient_id`, `conversation_id`, `content`.
- `Conversation` stocke `participant_ids` sous forme de chaine CSV.
- `Notification` contient `recipient_id`, `content`, `is_read`.
- `News` contient `title`, `source`, `summary`, `url`, `published_at`.
- `FormationUser` relie `user_id` et `training_id` avec `status` et `progress`.

## 7. La couche persistence / facades

### `backend/persistence/services/layer.py`

Ce fichier declare les services applicatifs. Chaque service contient en general une facade dans `self.facade`.

Exemples:

- `UserService`
- `CompanyService`
- `TrainingService`
- `MessageService`
- `ConversationService`
- `ConversationParticipantService`
- `NotificationService`
- `NewsService`
- `FormationUserService`

Le role du service est de fournir une interface stable aux resources. Dans l'etat actuel, il delegue presque tout a la facade. Autrement dit, le service sert surtout de couche intermédiaire pour que les routes n'aient pas besoin de manipuler directement la base de donnees.

### `backend/persistence/services/facades/_common_sql.py`

Helpers communs a toutes les facades: (fonctions partagees pour gerer les sessions SQLAlchemy, convertir les dates et manipuler les listes stockees en CSV; elles servent a garder le code des facades plus court et plus homogene. Sans elles, chaque facade devrait reecrire la meme logique de fermeture de session ou de formatage des donnees)

- `session_scope()` pour gerer une session SQLAlchemy avec commit/rollback/close,
- `isoformat()` pour serialiser les dates,
- `normalize_text()` pour nettoyer une chaine,
- `to_csv()` et `from_csv()` pour gerer les listes stockees en texte CSV.

### Exemple de facade: `UserFacade`

`backend/persistence/services/facades/user_facade_sql.py` est un bon exemple du pattern utilise partout. C'est ici que la logique de base se voit le mieux: ouvrir une session, chercher un enregistrement, en creer un, le modifier ou le supprimer, puis renvoyer un resultat pret pour l'API.

Le flux est le suivant:

1. La resource recoit la requete HTTP et lit le JSON envoye par le client.
2. Le modele de domaine valide les champs pour verifier que les donnees sont utilisables avant de toucher a la base.
3. Le service appelle `UserFacade.create_user()` ou une autre methode pour transmettre l'action a la couche de persistence.
4. La facade ouvre une session SQLAlchemy, c'est-a-dire une connexion temporaire a la base de donnees.
5. Elle hash le mot de passe avec `generate_password_hash()` pour ne jamais enregistrer le mot de passe en clair.
6. Elle cree l'utilisateur ORM, donc l'objet Python qui correspond a une ligne de la table `users`.
7. Elle commit puis retourne un dictionnaire serialise, c'est-a-dire une version simple de l'objet que l'API peut renvoyer en JSON.

Exemple simplifie:

```python
user = service.register(email, password, first_name=first_name)
```

Puis dans la facade:

```python
password_hash = generate_password_hash(password)
user = ORMUser(email=email.lower().strip(), password_hash=password_hash, ...)
db.add(user)
db.commit()
db.refresh(user)
return self._to_dict(user)
```

Le meme style existe pour:

- `CompanyFacade`
- `TrainingFacade`
- `MessageFacade`
- `ConversationFacade`
- `NotificationFacade`
- `NewsFacade`
- `FormationUserFacade`

## 8. Comment les donnees circulent

Un exemple typique ressemble a ca:

1. `POST /users` ou `POST /auth/register` arrive.
2. La resource lit le JSON.
3. Elle verifie les champs obligatoires.
4. Elle instancie le modele metier pour valider les contraintes.
5. Elle appelle la couche service.
6. La service layer delegue a la facade SQLAlchemy.
7. La facade ecrit en base.
8. La facade renvoie un dictionnaire.
9. La resource renvoie la reponse JSON a l'utilisateur.

## 9. Comportement concret des grandes fonctionnalites

### Auth

- inscription,
- login,
- refresh token (permet d'obtenir un nouveau token d'acces sans ressaisir le mot de passe, donc de prolonger la session sans refaire un login complet),
- logout avec blocklist (revoque le token courant pour qu'il ne soit plus accepte; le token reste techniquement connu du backend mais il est marque comme interdit).

### Users

- creation,
- lecture,
- mise a jour partielle ou totale,
- suppression definitive,
- desactivation logique,
- reset du mot de passe,
- profil courant via `/me`.

### Companies

- creation avec admin email obligatoire,
- listing,
- lecture detaillee,
- update partiel,
- desactivation,
- liste des utilisateurs d'une entreprise,
- affectation ou retrait d'un utilisateur.

### Trainings

- creation reservee aux super admins,
- listing,
- lecture detaillee,
- update,
- desactivation,
- inscription d'un utilisateur a une formation,
- listing des inscriptions par formation, par utilisateur, ou pour l'utilisateur courant.

### Conversations et messages

- creation et listing de conversations,
- ajout/retrait de participants,
- messages par conversation,
- messages par auteur,
- suppression d'un message,
- desactivation d'une conversation.

### Notifications

- creation,
- listing par destinataire,
- filtrage `is_read`,
- marquage comme lu,
- suppression.

### News

- listing,
- creation manuelle,
- lecture detaillee,
- suppression,
- endpoint de sync externe encore non implemente.

### Formation-user

- creation d'une relation utilisateur/formation,
- listing,
- consultation detaillee,
- mise a jour du statut ou du progress,
- suppression.

## 10. Schema des routes dans l'application

`backend/api/app.py` est aussi le fichier qui mappe toutes les routes. Si tu veux savoir rapidement ce que le backend expose, c'est le premier fichier a lire.

En plus des endpoints metier, l'application expose:

- `/` -> simple ping `{ "ok": true }`
- `/openapi.json` -> spec OpenAPI
- `/docs` et `/swagger` -> interface Swagger UI

## 11. Migrations et base de donnees

### `alembic/`

Ce dossier contient les migrations qui font evoluer le schema SQL. (fichiers d'historique qui decrivent chaque changement de structure de la base; ils permettent d'appliquer la meme evolution de schema en dev, test ou production sans repartir de zero. C'est ce qui garde la base synchronisee avec le code)

Le backend utilise des identifiants UUID en chaine de 36 caracteres dans les tables principales. (des IDs du type `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`, plus robustes qu'un simple compteur car ils sont uniques de facon globale et difficiles a deviner. Au lieu d'avoir des identifiants simples comme 1, 2, 3, on a des valeurs beaucoup moins previsibles)

## 12. Tests

Le dossier `tests/` montre que le backend est deja teste sur plusieurs axes:

- auth,
- users,
- companies,
- trainings,
- relations,
- models,
- conversation participants,
- logique d'API relationnelle.

Ca signifie que la base actuelle n'est pas juste du squelette: il y a deja un vrai comportement fonctionnel et une couverture sur plusieurs flux principaux.

## 13. Points importants a retenir

- Les modeles dans `backend/models/` servent surtout a valider les donnees.
- Les tables SQLAlchemy sont dans `backend/persistence/models.py`.
- Les facades font l'acces base et retournent des dictionnaires pour l'API.
- Les resources Flask-RESTful gerent les routes et l'erreur utilisateur.
- Le JWT est gere au niveau central dans `app.py`.
- Certaines operations sont des suppressions definitives, d'autres des desactivations logiques.
- `NewsSyncResource` est encore un stub. (le endpoint existe deja dans l'API, mais il ne fait pas encore l'etape de recuperation automatique, de transformation et d'insertion des news depuis une source externe. En clair, la route est presente mais la vraie automatisation n'est pas encore codee)
- `Conversation.participant_ids` est stocke en CSV, pas en relation normalisee.

## 14. Exemple mental rapide

Si tu veux comprendre une fonctionnalite, prends toujours ce chemin:

1. `backend/api/app.py` pour voir la route.
2. `backend/api/resources/<module>.py` pour voir le comportement HTTP.
3. `backend/models/<module>.py` pour voir la validation.
4. `backend/persistence/services/layer.py` pour voir le service.
5. `backend/persistence/services/facades/<module>_facade_sql.py` pour voir l'acces SQL.
6. `backend/persistence/models.py` pour voir la table.

Cette lecture te donne la vraie logique du backend actuel sans te perdre dans les details de chaque fichier.
