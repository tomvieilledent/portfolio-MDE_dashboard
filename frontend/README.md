# Messagerie - Frontend

## Structure

```
frontend/
├── index.html                 # Page principale de la messagerie
├── src/
│   ├── js/
│   │   └── app.js            # Logique principale de l'application
│   ├── css/
│   │   └── styles.css        # Styles personnalisés pour les bulles de chat
│   ├── pages/                # Pages futures
│   └── components/           # Composants réutilisables
├── public/                   # Fichiers statiques
└── README.md
```

## Fonctionnalités

### Page de Messagerie
- **Liste des conversations** : Affiche toutes les conversations avec :
  - Avatar et nom du contact
  - Rôle et entreprise du contact
  - Statut en ligne/hors ligne
  - Dernier message et heure
  - Badge de messages non lus
  
- **Zone de chat** : 
  - Affichage des messages reçus et envoyés
  - Bulles de messages stylisées (design from Figma mockup)
  - Timestamp et statut de livraison
  - Bouton d'options pour chaque message (hover)
  
- **Barre de saisie** :
  - Input pour taper les messages
  - Support de la touche Entrée pour envoyer
  - Bouton d'envoi

## Styles

### Bulles de messages

Le HTML fourni est déjà intégré dans `src/components/ChatBubble.html` et les styles correspondants dans `styles.css`.

**Message reçu** :
```html
<div class="flex items-start gap-2.5 group">
   <img class="w-8 h-8 rounded-full" src="/docs/images/people/profile-picture-3.jpg" alt="User image">
   <div class="flex flex-col w-full max-w-[320px] leading-1.5 p-4 bg-gray-100 rounded-2xl rounded-tl-none">
      <!-- Contenu du message -->
   </div>
</div>
```

**Message envoyé** :
```html
<div class="flex items-start gap-2.5 justify-end group">
   <div class="flex flex-col w-full max-w-[320px] leading-1.5 p-4 bg-green-500 text-white rounded-2xl rounded-tr-none">
      <!-- Contenu du message -->
   </div>
</div>
```

### Classes Tailwind utilisées
- `rounded-2xl` : Coins arrondis
- `rounded-tl-none` / `rounded-tr-none` : Coin pointu en haut
- `bg-gray-100` : Fond gris pour messages reçus
- `bg-green-500` : Fond vert pour messages envoyés
- `max-w-[320px]` : Largeur maximale des bulles

## Lancer la messagerie

### Option 1 : Serveur simple Python
```bash
cd frontend
python3 -m http.server 8000
```
Accédez à : `http://localhost:8000`

### Option 2 : Avec Live Server (VS Code)
Installez l'extension Live Server et cliquez sur "Go Live"

### Option 3 : Avec Node.js
```bash
npm install -g http-server
http-server frontend
```

## Intégration Backend

Pour connecter le frontend au backend Flask :

1. **Configuration CORS** dans `backend/api/app.py` :
```python
from flask_cors import CORS
CORS(app)
```

2. **API Endpoints à implémenter** :
   - `GET /api/conversations` : Liste des conversations
   - `GET /api/conversations/<id>/messages` : Messages d'une conversation
   - `POST /api/messages` : Envoyer un message
   - `GET /api/messages/<id>` : Récupérer un message
   - `PUT /api/messages/<id>` : Modifier un message
   - `DELETE /api/messages/<id>` : Supprimer un message

3. **Remplacer les données mock** dans `src/js/app.js` par des appels API

## Prochaines étapes

- [ ] Connecter au backend Flask
- [ ] Intégrer l'authentification JWT
- [ ] Ajouter la pagination pour les messages
- [ ] Implémentation de WebSockets pour les messages en temps réel
- [ ] Ajouter les uploadd'images/fichiers
- [ ] Notifications de nouveaux messages
- [ ] Recherche de conversations
