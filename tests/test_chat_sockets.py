"""Socket.IO tests for direct-message delivery and read receipts."""


def _events(received):
    return {r['name']: r['args'][0] for r in received}


def test_direct_message_delivery_and_read_receipt(seeded_context, app_bundle):
    from backend.api.sockets import socketio

    app = app_bundle['app']
    admin_token = seeded_context['admin_login']['access_token']
    member_token = seeded_context['member_login']['access_token']
    member_id = seeded_context['member_user']['id']

    admin_client = socketio.test_client(app, auth={'token': admin_token})
    member_client = socketio.test_client(app, auth={'token': member_token})
    assert admin_client.is_connected()
    assert member_client.is_connected()
    admin_client.get_received()  # flush connect noise
    member_client.get_received()

    # Admin sends a direct message (no conversation) to the member.
    admin_client.emit('send_message', {'content': 'salut', 'recipient_id': member_id})

    # The recipient receives it via their personal room.
    member_events = _events(member_client.get_received())
    assert 'new_message' in member_events
    message = member_events['new_message']['message']
    assert message['content'] == 'salut'
    assert message['is_read'] is False
    message_id = message['id']

    # The author also gets a copy on their own devices.
    admin_events = _events(admin_client.get_received())
    assert 'new_message' in admin_events

    # The member marks the DM as read; the author gets a read receipt.
    member_client.emit('mark_read', {'message_id': message_id})
    receipt = _events(admin_client.get_received())
    assert 'messages_read' in receipt
    assert receipt['messages_read']['message_id'] == message_id
    assert receipt['messages_read']['reader_id'] == member_id

    admin_client.disconnect()
    member_client.disconnect()


def test_conversation_message_broadcast_and_membership(seeded_context, app_bundle):
    from backend.api.sockets import socketio

    app = app_bundle['app']
    client = seeded_context['client']
    admin_headers = seeded_context['admin_headers']
    admin_token = seeded_context['admin_login']['access_token']
    member_token = seeded_context['member_login']['access_token']
    outsider_token = seeded_context['company_admin_login']['access_token']
    admin_id = seeded_context['admin_user']['id']
    member_id = seeded_context['member_user']['id']

    conversation_id = client.post('/conversations', headers=admin_headers, json={
        'participant_ids': [admin_id, member_id],
    }).get_json()['conversation']['id']

    admin_client = socketio.test_client(app, auth={'token': admin_token})
    member_client = socketio.test_client(app, auth={'token': member_token})
    outsider_client = socketio.test_client(app, auth={'token': outsider_token})

    admin_client.emit('join_conversation', {'conversation_id': conversation_id})
    member_client.emit('join_conversation', {'conversation_id': conversation_id})
    # The outsider is refused entry to the room.
    outsider_client.emit('join_conversation', {'conversation_id': conversation_id})
    assert 'error' in _events(outsider_client.get_received())

    admin_client.get_received()
    member_client.get_received()
    outsider_client.get_received()

    # Admin posts to the conversation; the member (in the room) receives it.
    admin_client.emit('send_message', {
        'content': 'team update', 'conversation_id': conversation_id})
    member_events = _events(member_client.get_received())
    assert 'new_message' in member_events
    assert member_events['new_message']['message']['content'] == 'team update'
    # The outsider, never in the room, receives nothing.
    assert _events(outsider_client.get_received()) == {}

    for c in (admin_client, member_client, outsider_client):
        c.disconnect()


def test_presence_broadcast(seeded_context, app_bundle):
    from backend.api.sockets import socketio

    app = app_bundle['app']
    admin_token = seeded_context['admin_login']['access_token']
    member_token = seeded_context['member_login']['access_token']
    member_id = seeded_context['member_user']['id']

    admin_client = socketio.test_client(app, auth={'token': admin_token})
    admin_client.get_received()  # flush admin's own connect

    # Member connects -> admin is told the member came online.
    member_client = socketio.test_client(app, auth={'token': member_token})
    presence = _events(admin_client.get_received())
    assert presence.get('presence') == {'user_id': member_id, 'online': True}

    # who_is_online returns the current roster to the asker.
    admin_client.emit('who_is_online')
    roster = _events(admin_client.get_received())['online_users']['user_ids']
    assert member_id in roster

    # Member disconnects -> admin is told they went offline.
    member_client.disconnect()
    presence = _events(admin_client.get_received())
    assert presence.get('presence') == {'user_id': member_id, 'online': False}

    admin_client.disconnect()


def test_typing_indicator_not_echoed_to_sender(seeded_context, app_bundle):
    from backend.api.sockets import socketio

    app = app_bundle['app']
    client = seeded_context['client']
    admin_headers = seeded_context['admin_headers']
    admin_token = seeded_context['admin_login']['access_token']
    member_token = seeded_context['member_login']['access_token']
    admin_id = seeded_context['admin_user']['id']
    member_id = seeded_context['member_user']['id']

    conversation_id = client.post('/conversations', headers=admin_headers, json={
        'participant_ids': [admin_id, member_id],
    }).get_json()['conversation']['id']

    admin_client = socketio.test_client(app, auth={'token': admin_token})
    member_client = socketio.test_client(app, auth={'token': member_token})
    admin_client.emit('join_conversation', {'conversation_id': conversation_id})
    member_client.emit('join_conversation', {'conversation_id': conversation_id})
    admin_client.get_received()
    member_client.get_received()

    admin_client.emit('typing', {'conversation_id': conversation_id, 'is_typing': True})
    # The other participant sees it...
    typing = _events(member_client.get_received())
    assert typing.get('typing') == {
        'conversation_id': conversation_id, 'user_id': admin_id, 'is_typing': True}
    # ...but it is never echoed back to the sender.
    assert 'typing' not in _events(admin_client.get_received())

    admin_client.disconnect()
    member_client.disconnect()


def test_rest_delete_broadcasts_message_deleted(seeded_context, app_bundle):
    from backend.api.sockets import socketio

    app = app_bundle['app']
    client = seeded_context['client']
    admin_headers = seeded_context['admin_headers']
    member_token = seeded_context['member_login']['access_token']
    admin_id = seeded_context['admin_user']['id']
    member_id = seeded_context['member_user']['id']

    conversation_id = client.post('/conversations', headers=admin_headers, json={
        'participant_ids': [admin_id, member_id],
    }).get_json()['conversation']['id']

    # Admin posts a message over REST; member is watching the room over a socket.
    message_id = client.post(f'/conversations/{conversation_id}/messages',
                             headers=admin_headers, json={'content': 'delete me'}
                             ).get_json()['message']['id']

    member_client = socketio.test_client(app, auth={'token': member_token})
    member_client.emit('join_conversation', {'conversation_id': conversation_id})
    member_client.get_received()

    # Admin deletes it over REST -> the room is notified live.
    assert client.delete(f'/messages/{message_id}',
                         headers=admin_headers).status_code == 200
    deleted = _events(member_client.get_received())
    assert deleted.get('message_deleted') == {
        'message_id': message_id, 'conversation_id': conversation_id}

    member_client.disconnect()
