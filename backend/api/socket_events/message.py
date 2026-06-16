from flask import request
from flask_socketio import emit, join_room, leave_room
# socket auth helper verifies JWT for socket connections
from backend.api.socket_auth import verify_token
from backend.api.sockets import socketio
from backend.persistence.services import MessageService
from backend.persistence.services.facades import ConversationFacade
# Use the built-in ConnectionRefusedError exception


connected_users = {}
# Membership is read from the conversation's participant_ids CSV (source of
# truth), which is what the REST API writes — not the conversation_participants
# table, which the public API never populates.
conversation_facade = ConversationFacade()


def conversation_room(conversation_id):
    return f"conversation:{conversation_id}"


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
    print(f"Client connecté : user={user_id}, sid={sid}")


@socketio.on("disconnect")
def handle_disconnect():
    sid = request.sid  # type: ignore[attr-defined]
    user_id = connected_users.pop(sid, None)
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

    service = MessageService()
    try:
        message = service.facade.create(
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
        emit('new_message', {'message': message}, to=sid)
