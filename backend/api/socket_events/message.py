from flask import request
from flask_socketio import emit, join_room, leave_room
from backend.api.auth import verify_token
from backend.api.sockets import socketio
# Use the built-in ConnectionRefusedError exception


connected_users = {}


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
    ...


@socketio.on("leave_conversation")
def handle_leave_conversation(data):
    ...


@socketio.on("send_message")
def handle_send_message(data):
    ...
