from flask import request
from flask_socketio import emit, join_room, leave_room
# socket auth helper verifies JWT for socket connections
from backend.api.socket_auth import verify_token
from backend.api.sockets import socketio
from backend.api.state import mark_offline, mark_online, online_user_ids
from backend.persistence.services import MessageService
from backend.persistence.services.facades import ConversationFacade
# Use the built-in ConnectionRefusedError exception


connected_users = {}
# Membership is read from the conversation's participant_ids CSV (source of
# truth), which is what the REST API writes — not the conversation_participants
# table, which the public API never populates.
conversation_facade = ConversationFacade()
message_service = MessageService()


def conversation_room(conversation_id):
    return f"conversation:{conversation_id}"


def user_room(user_id):
    """Personal room a user auto-joins on connect, used for direct messages.

    Joining ``user:<id>`` lets us deliver 1-to-1 messages (and read
    receipts) to every device the user is connected from.
    """
    return f"user:{user_id}"


def notify_message_deleted(message):
    """Broadcast a ``message_deleted`` event for a (soft-)deleted message.

    Conversation messages are announced to the conversation room; direct
    messages are announced to both parties' personal rooms. Called from the
    REST delete handler so connected clients drop the message live.
    """
    conversation_id = message.get('conversation_id')
    if conversation_id:
        socketio.emit('message_deleted',
                      {'message_id': message['id'], 'conversation_id': conversation_id},
                      to=conversation_room(conversation_id))
        return
    for uid in (message.get('recipient_id'), message.get('author_id')):
        if uid:
            socketio.emit('message_deleted', {'message_id': message['id']},
                          to=user_room(uid))


@socketio.on("connect")
def handle_connect(auth):
    if not auth:
        raise ConnectionRefusedError("auth missing")

    token = auth.get("token")
    if not token:
        raise ConnectionRefusedError("token missing")

    try:
        user_id = verify_token(token)
    except Exception:
        raise ConnectionRefusedError("invalid token")

    if not user_id:
        raise ConnectionRefusedError("invalid token")

    sid = request.sid  # type: ignore[attr-defined]
    connected_users[sid] = user_id
    # Join a personal room so direct messages reach all of the user's devices.
    join_room(user_room(user_id))
    # Announce presence only on the first connection for this user.
    if mark_online(user_id):
        socketio.emit('presence', {'user_id': user_id, 'online': True})
    print(f"Client connecté : user={user_id}, sid={sid}")


@socketio.on("disconnect")
def handle_disconnect():
    sid = request.sid  # type: ignore[attr-defined]
    user_id = connected_users.pop(sid, None)
    # Announce going offline only when the user's last connection drops.
    if user_id and mark_offline(user_id):
        socketio.emit('presence', {'user_id': user_id, 'online': False})
    print(f"Client déconnecté : user={user_id}, sid={sid}")


@socketio.on("join_conversation")
def handle_join_conversation(data):
    conversation_id = (data or {}).get('conversation_id')
    if not conversation_id:
        return
    sid = request.sid  # type: ignore[attr-defined]
    user_id = connected_users.get(sid)
    if not user_id:
        return
    if not conversation_facade.is_participant(conversation_id, user_id):
        emit('error', {'message': 'not a participant in this conversation'}, to=sid)
        return
    room = conversation_room(conversation_id)
    join_room(room)
    print(f"User {user_id} joined room {room}")
    emit('joined_conversation', {'conversation_id': conversation_id}, to=sid)


@socketio.on("leave_conversation")
def handle_leave_conversation(data):
    conversation_id = (data or {}).get('conversation_id')
    if not conversation_id:
        return
    sid = request.sid  # type: ignore[attr-defined]
    user_id = connected_users.get(sid)
    if not user_id:
        return
    room = conversation_room(conversation_id)
    leave_room(room)
    print(f"User {user_id} left room {room}")
    emit('left_conversation', {'conversation_id': conversation_id}, to=sid)


@socketio.on("typing")
def handle_typing(data):
    """Relay a typing indicator to the other participants.

    Payload: ``{conversation_id|recipient_id, is_typing}``. The notice is
    never echoed back to the sender.
    """
    sid = request.sid  # type: ignore[attr-defined]
    user_id = connected_users.get(sid)
    if not user_id:
        return
    payload = data or {}
    is_typing = bool(payload.get('is_typing'))
    conversation_id = payload.get('conversation_id')
    recipient_id = payload.get('recipient_id')

    if conversation_id:
        if not conversation_facade.is_participant(conversation_id, user_id):
            return
        emit('typing',
             {'conversation_id': conversation_id, 'user_id': user_id, 'is_typing': is_typing},
             to=conversation_room(conversation_id), include_self=False)
    elif recipient_id:
        socketio.emit('typing', {'user_id': user_id, 'is_typing': is_typing},
                      to=user_room(recipient_id))


@socketio.on("who_is_online")
def handle_who_is_online():
    """Return the list of currently connected user ids to the requester."""
    sid = request.sid  # type: ignore[attr-defined]
    if not connected_users.get(sid):
        return
    emit('online_users', {'user_ids': online_user_ids()}, to=sid)


@socketio.on("send_message")
def handle_send_message(data):
    sid = request.sid  # type: ignore[attr-defined]
    user_id = connected_users.get(sid)
    if not user_id:
        return
    payload = data or {}
    content = payload.get('content')
    conversation_id = payload.get('conversation_id')
    recipient_id = payload.get('recipient_id')
    if not content:
        return
    if conversation_id and not conversation_facade.is_participant(conversation_id, user_id):
        emit('error', {'message': 'not a participant in this conversation'}, to=sid)
        return

    if not conversation_id and not recipient_id:
        emit('error', {'message': 'recipient_id or conversation_id required'}, to=sid)
        return

    try:
        message = message_service.facade.create(
            author_id=user_id,
            content=content,
            recipient_id=recipient_id,
            conversation_id=conversation_id,
        )
    except Exception as exc:
        print('Failed to persist message:', exc)
        return

    if conversation_id:
        room = conversation_room(conversation_id)
        socketio.emit('new_message', {'message': message}, to=room)
    else:
        # Direct message: deliver to the recipient and back to the author's
        # own devices via their personal rooms.
        socketio.emit('new_message', {'message': message}, to=user_room(recipient_id))
        socketio.emit('new_message', {'message': message}, to=user_room(user_id))


@socketio.on("mark_read")
def handle_mark_read(data):
    """Mark messages as read and broadcast a read receipt.

    Payload accepts either ``conversation_id`` (marks the whole conversation
    read for the caller) or ``message_id`` (marks a single direct message).
    """
    sid = request.sid  # type: ignore[attr-defined]
    user_id = connected_users.get(sid)
    if not user_id:
        return
    payload = data or {}
    conversation_id = payload.get('conversation_id')
    message_id = payload.get('message_id')

    if conversation_id:
        if not conversation_facade.is_participant(conversation_id, user_id):
            emit('error', {'message': 'not a participant in this conversation'}, to=sid)
            return
        updated = message_service.facade.mark_conversation_read(conversation_id, user_id)
        if updated:
            socketio.emit('messages_read',
                          {'conversation_id': conversation_id, 'reader_id': user_id},
                          to=conversation_room(conversation_id))
        return

    if message_id:
        message = message_service.facade.mark_read(message_id, user_id)
        if not message:
            return
        # Notify the original author (on their personal room) that it was read.
        socketio.emit('messages_read',
                      {'message_id': message_id, 'reader_id': user_id},
                      to=user_room(message['author_id']))
