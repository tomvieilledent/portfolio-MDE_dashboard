# Guide complet : Implémenter un chat temps réel (A → Z)

Ce guide pas-à-pas explique comment concevoir, implémenter, tester et déployer un système de chat temps réel pour un site web. Il est adapté à votre code existant (backend/api) et fournit exemples, commandes et bonnes pratiques.

---

## 0. Vue d'ensemble

Objectifs :
- Messages en temps réel (WebSocket / Socket.IO)
- Historique paginé via REST
- Authentification par JWT pour REST et sockets
- Fichiers (upload sécurisé)
- Notifications et comptage non lus
- Tests, monitoring et mise à l'échelle (Redis pub/sub)

Stack recommandé (aligné sur votre repo) :
- Backend Python (Flask + Flask-SocketIO ou ASGI + socket.io compatible)
- DB : PostgreSQL (SQLAlchemy)
- Stockage fichiers : S3 ou dossier sécurisé
- Broker pour scale : Redis

---

## 1. Exigences et cas d'usage

Liste minimale :
- One-to-one chat (DM)
- Group chat (channels)
- Recevoir/enregistrer messages texte et fichiers
- Lecture/Statut lu/non lu
- Indicateur de saisie (`typing`)
- Présence en ligne
- Chargement historique (infinite scroll)

Décidez limites : taille max message, durée conservation, types MIME autorisés.

---

## 2. Modèle de données (SQLAlchemy)

Schéma simplifié :

- `User` (existant)
- `Conversation`:
  - id (PK), type (dm/group), title, created_at
- `ConversationParticipant`:
  - conversation_id (FK), user_id (FK), role, joined_at, last_read_at
- `Message`:
  - id (PK), conversation_id (FK), sender_id (FK), content (text or JSON), content_type (text/file), file_url (nullable), created_at, edited_at, is_deleted (bool)

Exemple SQLAlchemy (snippet) :

```python
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean, Text
from sqlalchemy.sql import func

class Message(Base):
    __tablename__ = 'messages'
    id = Column(Integer, primary_key=True)
    conversation_id = Column(Integer, ForeignKey('conversations.id'), index=True, nullable=False)
    sender_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    content = Column(Text)
    content_type = Column(String(20), default='text')
    file_url = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    edited_at = Column(DateTime(timezone=True), nullable=True)
    is_deleted = Column(Boolean, default=False)
```

Ajoutez migrations (alembic) : `alembic revision --autogenerate -m "add chat tables"` puis `alembic upgrade head`.

---

## 3. Endpoints REST (historique, listing, création conv.)

Endpoints essentiels :
- `GET /conversations` — liste des conversations de l'utilisateur
- `POST /conversations` — créer conversation (DM/group)
- `GET /conversations/{id}/messages?limit=&before=` — charger messages (pagination)
- `POST /conversations/{id}/messages` — (optionnel) envoyer message via REST
- `POST /uploads` — upload sécurisé de fichiers

Bonnes pratiques :
- Filtrer par participant et permissions
- Retourner `has_more` + `cursor` pour pagination

Exemple de route (Flask-like) :

```python
@bp.route('/conversations/<int:c_id>/messages')
def get_messages(c_id):
    user = get_current_user()
    ensure_participant(user.id, c_id)
    limit = int(request.args.get('limit', 50))
    before = request.args.get('before')  # iso datetime or message id
    msgs = Message.query.filter(Message.conversation_id==c_id)
    if before:
        msgs = msgs.filter(Message.created_at < parse(before))
    msgs = msgs.order_by(Message.created_at.desc()).limit(limit).all()
    return jsonify([m.to_dict() for m in reversed(msgs)])
```

Ajoutez tests unitaires pour ces endpoints (voir `tests/`).

---

## 4. Authentification socket

Méthode : valider JWT à la connexion socket.
- Envoyer token dans `auth` param ou dans query param `?token=` ou cookie. Votre repo contient `socket_auth.py` — réutilisez la logique JWT.
- Rejecter la connexion si token invalide.

Exemple (Socket.IO server) :

```python
@socketio.on('connect')
def connect_handler():
    token = request.args.get('token') or request.headers.get('Authorization')
    user = validate_jwt(token)
    if not user:
        return False  # refuse
    join_user_rooms(user.id)
```

---

## 5. Events Socket — protocole minimal

Événements client → serveur :
- `join` {conversation_id}
- `leave` {conversation_id}
- `message:send` {conversation_id, content, temp_id(optional)}
- `typing` {conversation_id, is_typing}

Événements serveur → client :
- `message:new` {message}
- `message:ack` {temp_id, real_id}
- `typing` {user_id, conversation_id, is_typing}
- `presence` {user_id, online}

Flow send message :
1. Client envoie `message:send` (optimistic UI can use temp_id)
2. Server valide, persiste message, émet `message:new` au room `conv:{id}`
3. Server émet `message:ack` au socket de l'émetteur pour corréler temp_id -> id

Exemple serveur (simplifié):

```python
@socketio.on('message:send')
def on_msg_send(data):
    user = current_user_from_socket()
    conv_id = data['conversation_id']
    if not is_participant(user.id, conv_id):
        emit('error', {'msg':'not allowed'})
        return
    msg = Message(conversation_id=conv_id, sender_id=user.id, content=data['content'])
    db.session.add(msg)
    db.session.commit()
    out = msg.to_dict()
    socketio.emit('message:new', out, room=f'conv:{conv_id}')
    emit('message:ack', {'temp_id': data.get('temp_id'), 'id': msg.id})
```

Votre repo a `backend/api/socket_events/message.py` — place ideale pour intégrer cette logique.

### 5.bis Contrat **réellement implémenté** (à jour)

Les noms ci-dessus sont la cible historique ; le code en place utilise :

Client → serveur :
- `join_conversation` / `leave_conversation` `{conversation_id}` — refusé (`error`) si non-membre
- `send_message` `{content, conversation_id?, recipient_id?}` — fournir l'un *ou* l'autre
- `mark_read` `{conversation_id}` (marque toute la conversation lue) *ou* `{message_id}` (DM unique)
- `typing` `{conversation_id|recipient_id, is_typing}` — jamais renvoyé à l'émetteur
- `who_is_online` (sans payload) → réponse `online_users`

Serveur → client :
- `new_message` `{message}` — `message.is_read` inclus
- `joined_conversation` / `left_conversation` `{conversation_id}`
- `messages_read` `{conversation_id|message_id, reader_id}` — accusé de lecture
- `message_deleted` `{message_id, conversation_id?}` — émis lors d'un soft-delete REST
- `typing` `{conversation_id?, user_id, is_typing}`
- `presence` `{user_id, online}` — diffusé à tous quand un user passe en/hors ligne
- `online_users` `{user_ids}` — réponse à `who_is_online`
- `error` `{message}`

Rooms : `conversation:<id>` pour les conversations ; **`user:<id>`** rejoint automatiquement à la connexion, utilisé pour livrer les **messages directs** (1-à-1, sans `conversation_id`) et les accusés de lecture à tous les appareils d'un utilisateur. **À la connexion, le serveur rejoint aussi automatiquement toutes les rooms `conversation:<id>` de l'utilisateur** (via `list_by_participant`), pour que les messages de groupe déclenchent badges/toasts même panneau de chat fermé.

Présence : suivie en mémoire dans `backend/api/state.py` (`ONLINE_USERS`, compteur de connexions par user) ; `presence` n'est diffusé qu'aux transitions réelles online↔offline (multi-onglets gérés).

Côté REST :
- Conversations (DM ad-hoc **et groupes nommés**) :
  - `GET /conversations` → `{conversations}` ; chaque entrée est **enrichie** de `title`, `last_message` et `unread` (pour l'inbox style WhatsApp).
  - `POST /conversations` `{participant_ids[], title?}` — le créateur est toujours ajouté. `title` (≤ 200 car., trim) crée un **groupe nommé** ; sans titre, conversation ad-hoc.
  - `PATCH /conversations/<id>` accepte soit `{title}` (renommer le groupe ; `""` efface le nom), soit `{participant_id, action:"add"|"remove"}` (gérer les membres — `remove` de soi-même = quitter le groupe). `title` a priorité s'il est présent.
  - `DELETE /conversations/<id>` désactive (soft) la conversation.
- Lu/non-lu : `POST /conversations/<id>/read`, `POST /messages/<id>/read`, `GET /messages/unread` → `{unread, conversations, direct}`
- Présence : `GET /presence` → `{online: [user_id, ...]}`
- Suppression : `DELETE /messages/<id>` est un **soft-delete** (colonne `is_active`, réservé à l'auteur) ; les messages inactifs sont exclus de tous les listings/compteurs et un `message_deleted` est diffusé en temps réel.

---

## 6. Rooms & scalabilité

- Chaque conversation map to a Socket.IO room: `conv:{id}`.
- Pour multi-instance, activez Redis message queue: `message_queue='redis://localhost:6379/0'` dans `SocketIO` init.
- Use Redis Pub/Sub to broadcast between workers.

---

## 7. Frontend – principe et snippets

Charge initiale : GET `/conversations/{id}/messages?limit=50` (load newest 50), afficher, scroll to bottom.

Socket client (Socket.IO):

```javascript
const socket = io({ auth: { token } });

socket.on('connect', () => {
  socket.emit('join', { conversationId });
});

socket.on('message:new', msg => addMessageToUI(msg));

function sendMessage(text) {
  const tempId = generateTempId();
  addOptimisticMessage(tempId, text);
  socket.emit('message:send', { conversation_id: conversationId, content: text, temp_id: tempId });
}

socket.on('message:ack', ({temp_id, id}) => replaceTempId(temp_id, id));
```

UI details:
- Virtualize long lists (react-window)
- Handle scroll to top to load older messages
- Show timestamps and grouping by date

---

## 8. Uploads fichiers

Endpoint `POST /uploads` :
- Auth required
- Validate MIME and size
- Store with random UUID filename
- Return accessible URL

Client workflow:
1. Upload file (FormData) to `/uploads`
2. Receive `file_url` in response
3. Send message with `content_type=file` and `file_url`

Server security : presigned S3 upload recommended for large files.

---

## 9. Lecture / non lus

- Chaque participant a `last_read_at` timestamp
- Quand l'utilisateur ouvre une conversation, mettez `last_read_at = now()`
- Calculez non lus: COUNT(messages where created_at > last_read_at)
- Emit `read` event optionally over socket to update other participants

---

## 10. Tests

- Unit tests for facades DB (insert/read messages)
- Integration tests simulating socket clients (python-socketio test client)
- API tests for REST endpoints (see `tests/` existing examples)

Example socketio test:

```python
from socketio import Client

c = Client()
c.connect('http://localhost:5000', headers={'Authorization': 'Bearer ...'})
# emit, wait for events, assert
```

---

## 11. Déploiement

- Serveur WebSocket-friendly: `gunicorn -k eventlet -w 1 'backend.api.app:app'` if using Flask-SocketIO + eventlet
- Use Redis for message_queue for scale
- HTTPS termination at load balancer (NGINX)
- Worker autoscaling for REST; sticky sessions not required if using Redis pub/sub

---

## 12. Monitoring & observabilité

- Logs: structured logs for events `message:send`, `message:new`, errors
- Metrics: messages/sec, active sockets, queue lengths
- Alerts: error rate, Redis latency

---

## 13. Checklist d'implémentation détaillée (Tâches concrètes)

1. Créer migrations DB (tables conversations, messages, participants)
2. Implémenter facades DB (create_message, list_messages(cursor, limit))
3. Exposer endpoints REST pour historique & upload
4. Implémenter auth socket (réutiliser `socket_auth.py`)
5. Implémenter `message:send` dans `socket_events/message.py` (persist + emit)
6. Mettre à jour frontend: loader historique + socket client
7. Tests unitaires et d'intégration
8. Ajouter Redis pour multi-instance
9. Déployer et monitorer

---

## 14. Snippets d'aide (à copier)

- Charger messages (JS fetch):
```javascript
async function loadMessages(conversationId, before) {
  const url = new URL(`/conversations/${conversationId}/messages`, API_ORIGIN);
  if (before) url.searchParams.set('before', before);
  url.searchParams.set('limit', 50);
  const r = await fetch(url, { headers: { Authorization: 'Bearer ' + token } });
  return r.json();
}
```

- Exemple d'emit côté client (optimistic):
```javascript
socket.emit('message:send', {conversation_id, content, temp_id});
```

- Exemple de test unitaire minimal (pytest):
```python
def test_create_message(db_session):
    msg = Message(conversation_id=1, sender_id=1, content='hi')
    db_session.add(msg)
    db_session.commit()
    assert msg.id is not None
```

---

## 15. Ressources

- Socket.IO docs: https://socket.io/docs/
- Flask-SocketIO: https://flask-socketio.readthedocs.io/
- python-socketio: https://python-socketio.readthedocs.io/
- Pagination patterns: keyset pagination

---

## 16. Prochaines actions que je peux faire pour vous

- A) Implémenter l'event `message:send` directement dans `backend/api/socket_events/message.py`
- B) Ajouter endpoint REST `GET /conversations/{id}/messages` et tests
- C) Créer un composant frontend React minimal (chat UI + socket client)
- D) Générer ce guide en PDF maintenant (je peux le convertir ici)

Indiquez quelles actions vous voulez que je réalise en premier.
