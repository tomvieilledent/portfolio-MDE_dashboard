# Guide Django

Ce document explique les bases de Django de facon simple pour une premiere prise en main.

## C'est quoi Django ?

Django est un framework web Python. Il aide a creer:

- des sites web
- des APIs
- des panneaux d'administration
- des applications avec base de donnees

Son idee principale est de te donner une structure claire pour developper plus vite.

## Les grands principes

### 1. Le projet

Le projet est le conteneur principal.

Dans ce repo, le projet Django est dans `backend/config/`.

Il contient la configuration globale:

- `settings.py`
- `urls.py`
- `asgi.py`
- `wsgi.py`

### 2. Les applications

Un projet Django est compose d'une ou plusieurs applications.

Dans ce repo, les applications métiers principales sont:

- `backend/users/`
- `backend/companies/`
- `backend/formations/`
- `backend/chat/`

Une application sert a isoler une partie du metier:

- utilisateurs
- entreprises
- formations
- messages
- etc.

### 3. Les modeles

Les modeles definissent les donnees.

Un modele represente en general une table de base de donnees.

Exemple de role:

- un modele `User`
- un modele `Company`
- un modele `Message`

### 4. Les vues

Les vues recoivent une requete et renvoient une reponse.

Une vue peut renvoyer:

- du HTML
- du JSON
- une redirection
- une erreur

### 5. Les routes

Les routes disent a Django quelle vue appeler pour chaque URL.

Exemple:

- `/admin/` vers l'administration
- `/api/` vers une partie applicative

## Vocabulaire technique

### Requete

Une requete est ce que le navigateur ou le client API envoie a Django.

Elle peut etre de type:

- `GET` pour lire une ressource
- `POST` pour creer une ressource
- `PUT` ou `PATCH` pour modifier une ressource
- `DELETE` pour supprimer une ressource

### Reponse

Une reponse est ce que Django renvoie apres avoir traite la requete.

Elle peut contenir:

- du HTML
- du JSON
- un message d'erreur
- une redirection

### Vue

Une vue est la fonction ou la classe qui traite la requete.

Son role:

- lire les donnees de la requete
- appliquer la logique metier
- appeler les modeles si besoin
- renvoyer une reponse

### Modele

Un modele represente une structure de donnee.

En pratique, il definit souvent:

- le nom de la table
- les colonnes
- les contraintes
- les relations avec d'autres modeles

### Migration

Une migration est un fichier qui decrit une modification de la base de donnees.

Elle permet a Django de savoir comment transformer la base sans le faire a la main.

### ORM

L'ORM de Django est la couche qui permet de parler a la base de donnees avec du Python au lieu d'ecrire directement du SQL.

Exemple mental:

- au lieu d'ecrire une requete SQL complexe
- tu manipules des objets Python

### Serializer

Un serializer sert surtout dans une API.

Il convertit:

- un objet Python ou un modele en JSON
- du JSON recu en donnees Python valides

### Admin

L'admin est l'interface d'administration fournie par Django.

### Middleware

Un middleware est un composant qui intercepte les requetes ou les reponses.

Il peut servir a:

- la securite
- les sessions
- le CORS
- la gestion d'erreurs

### App

Une app est un bloc fonctionnel du projet.

Exemples:

- authentification
- messagerie
- gestion de compagnies
- catalogue de formation

## Comment organiser ton projet

### Structure simple pour debuter

Pour un petit projet, garde une structure simple mais deja separee par domaine:

- `config/` pour la configuration globale
- `users/` pour les utilisateurs et les roles
- `companies/` pour les entreprises et les liaisons employe-entreprise
- `formations/` pour les formations et les inscriptions
- `chat/` pour la messagerie
- `manage.py` pour les commandes

Chaque app garde ses propres modeles, vues, tests et fichiers d'administration.

### Structure scalable quand le projet grandit

Quand le projet devient plus gros, tu peux ajouter des sous-modules internes:

- `services/` pour la logique metier complexe
- `selectors/` pour les requetes de lecture
- `serializers/` si tu exposes une API
- `permissions/` si tu ajoutes des droits plus fins

Mais la base reste la meme: une app par domaine.

Avantage:

- code plus lisible
- code plus facile a tester
- equipe plus facile a organiser

## Ou mettre les modeles ?

### Option 1: tous les modeles dans `models.py`

C'est la solution la plus simple.

Tu peux mettre plusieurs modeles dans un seul fichier.

Exemple:

- `User`
- `Company`
- `Message`

Cette solution est tres bien si le projet est petit.

### Option 2: plusieurs fichiers de modeles

Quand il y a beaucoup de modeles, tu peux organiser un dossier `models/`.

Exemple conceptuel:

- `models/user.py`
- `models/company.py`
- `models/message.py`
- `models/__init__.py`

Cette organisation est plus propre pour un projet scalable.

### Quelle approche choisir ?

Pour debuter:

- commence avec un seul `models.py`

Pour grandir:

- passe vers un dossier `models/` quand la logique devient trop grande

## Peut-on avoir plusieurs modeles dans le meme fichier ?

Oui.

Exemple:

```python
from django.db import models

class Company(models.Model):
	name = models.CharField(max_length=255)

class Employee(models.Model):
	company = models.ForeignKey(Company, on_delete=models.CASCADE)
	first_name = models.CharField(max_length=100)
```

Ici, deux modeles sont dans le meme fichier.

C'est normal et courant.

## A quoi sert une migration ?

Une migration sert a synchroniser le code Python et la base de donnees.

Si tu modifies un modele:

- Django detecte le changement avec `makemigrations`
- il cree un fichier de migration
- tu appliques ensuite cette migration avec `migrate`

### Pourquoi ce systeme existe ?

Parce qu'il faut garder une trace des changements.

Cela permet:

- de reproduire la structure de la base
- de travailler en equipe
- de deploiement proprement
- de revenir en arriere si besoin

### Quand faire une migration ?

Chaque fois que tu modifies:

- un champ de modele
- une relation entre modeles
- un nouveau modele
- une contrainte de base de donnees

## A quoi sert une vue ?

Une vue est le coeur du traitement.

Elle decide quoi faire quand une URL est appelee.

Exemple de role d'une vue:

1. recevoir la requete
2. verifier les donnees
3. lire ou enregistrer en base
4. construire la reponse

### Vue fonctionnelle

Une fonction simple qui traite une requete.

### Vue basee sur une classe

Une classe qui organise la logique en methodes.

Les vues basees sur des classes sont souvent utiles quand il y a beaucoup de logique.

## A quoi servent les routes ?

Les routes disent a Django quelle vue appeler.

Sans routes:

- Django ne sait pas ou envoyer la requete

Avec routes:

- chaque URL a un comportement clair

## Comment penser un projet Django proprement

### Regle 1: une responsabilite par fichier

- `settings.py` pour la configuration
- `urls.py` pour les routes
- `models.py` pour les donnees
- `views.py` pour la logique
- `admin.py` pour l'admin

### Regle 2: garder le code lisible

Si un fichier devient trop gros:

- decoupe le code
- cree de nouveaux modules
- regroupe par domaine fonctionnel

### Regle 3: ne pas melanger les couches

Ne mets pas:

- la logique metier dans `urls.py`
- la configuration dans `models.py`
- les acces base de donnees directs dans les vues sans besoin

### Regle 4: penser evolutif

Commence simple, puis fais grandir la structure si le projet l'exige.

## Modeles, relations et base de donnees

Un modele peut etre relie a un autre modele.

Types de relations frequentes:

- `ForeignKey`: plusieurs objets vers un seul
- `OneToOneField`: un objet vers un seul
- `ManyToManyField`: plusieurs objets vers plusieurs objets

Exemple:

- une compagnie a plusieurs employes
- un employe appartient a une compagnie

## Types de fichiers importants dans Django

### `models.py`

Contient les donnees.

### `views.py`

Contient la logique de traitement.

### `urls.py`

Contient les routes.

### `admin.py`

Enregistre les modeles pour l'interface d'administration.

### `tests.py`

Contient les tests.

### `apps.py`

Definit l'application Django.

## Comment evoluer vers une architecture plus grande

Quand ton projet devient plus complexe, tu peux ajouter:

- un dossier `serializers/`
- un dossier `services/`
- un dossier `selectors/`
- un dossier `tests/`

Cela permet de mieux separer les responsabilites sans casser la structure de base.

## Exemple de logique d'une fonctionnalite

Si tu veux ajouter une fonctionnalite "compagnies":

1. tu crees le modele `Company`
2. tu generes la migration
3. tu crées une vue pour lire ou creer des compagnies
4. tu ajoutes une route
5. tu testes

## Resume des termes cles

- **Projet**: le conteneur global
- **App**: une partie fonctionnelle du projet
- **Modele**: la structure des donnees
- **Vue**: la logique qui traite la requete
- **Route**: le chemin URL
- **Migration**: le changement de schema de la base
- **ORM**: la couche Python vers la base de donnees
- **Admin**: l'interface d'administration
- **Middleware**: le filtre entre requete et reponse

## Cycle de travail Django

Le fonctionnement de base est souvent le suivant:

1. Tu decris une donnee dans `models.py` de l'app concernée
2. Tu crees une migration
3. Tu appliques la migration
4. Tu ecris une vue dans `views.py`
5. Tu relies la vue dans `urls.py`
6. Tu testes le comportement dans le navigateur ou via API

## Les fichiers importants

### `manage.py`

C'est le fichier de commande principal.

Tu l'utilises pour:

- lancer le serveur
- creer les migrations
- mettre a jour la base de donnees
- executer les tests

### `settings.py`

C'est la configuration globale.

On y trouve notamment:

- les applications installees
- la base de donnees
- les fichiers statiques
- les langues
- le fuseau horaire
- la securite

### `urls.py`

Il definit le routage.

Il existe en general:

- un `urls.py` principal dans le projet
- des `urls.py` dans chaque application quand le projet grandit

### `models.py`

Il definit la structure des donnees.

Quand tu le modifies, tu dois presque toujours faire:

- `python manage.py makemigrations`
- `python manage.py migrate`

### `views.py`

Il contient la logique de traitement.

### `admin.py`

Il sert a enregistrer les modeles pour les voir dans l'interface admin Django.

### `migrations/`

Django y stocke l'historique des changements de schema.

## Commandes de base

```bash
python manage.py runserver
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
python manage.py test
```

## Creation d'une fonctionnalite simple

### Cas classique

Si tu veux ajouter une fonctionnalite, tu peux suivre cet ordre:

1. Ajouter ou modifier un modele
2. Creer la migration
3. Ecrire la vue
4. Ajouter la route
5. Tester

### Exemple mental

Si tu veux gerer des compagnies:

- `models.py` pour la structure de la compagnie
- `views.py` pour l'affichage ou l'API
- `urls.py` pour le chemin d'acces
- `admin.py` pour l'administration

## Base de donnees

Django parle avec la base de donnees via ses modeles.

En developpement, on utilise souvent SQLite car c'est simple.

En production, on utilise souvent PostgreSQL car c'est plus robuste.

## Migrations

Les migrations servent a garder la base de donnees synchronisee avec le code.

Quand un modele change, Django ne modifie pas la base tout seul.
Il faut generer puis appliquer une migration.

## Admin Django

Django propose une interface d'administration prete a l'emploi.

C'est tres utile pour:

- tester rapidement des modeles
- ajouter/modifier des donnees
- verifier que les relations fonctionnent

## Bonnes pratiques pour debuter

- Commence petit
- Garde une structure simple
- Change un seul element a la fois
- Cree des tests quand tu ajoutes de la logique
- Fais une migration a chaque modification de modele
- Separer la configuration, la logique et les donnees

## Comment lire un projet Django

Si tu ouvres un projet Django pour la premiere fois:

1. Regarde `manage.py`
2. Regarde `settings.py`
3. Regarde `urls.py`
4. Regarde `models.py`
5. Regarde `views.py`
6. Regarde `admin.py`
7. Regarde les migrations

## Erreurs courantes

- Oublier une migration apres avoir modifie un modele
- Mettre de la logique metier dans `urls.py`
- Mettre trop de code dans une seule vue
- Ne pas separer les responsabilites
- Modifier directement la base de donnees sans passer par Django

## Resume

Django fonctionne avec une logique simple:

- les modeles definissent les donnees
- les vues traitent les requetes
- les routes dirigent le trafic
- les settings configurent le projet
- les migrations gardent la base a jour

C'est une tres bonne base pour apprendre le developpement web de facon propre et structuree.
