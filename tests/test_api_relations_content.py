import pytest

from backend.api.errors import ERROR_CODES
from tests.helpers import assert_error, make_text


def test_conversation_and_message_flow(seeded_context):
    client = seeded_context['client']
    admin_headers = seeded_context['admin_headers']
    member_id = seeded_context['member_user']['id']

    create_conversation = client.post('/conversations', headers=admin_headers, json={
        'participant_ids': [seeded_context['admin_user']['id'], member_id],
    })
    assert create_conversation.status_code == 201
    conversation = create_conversation.get_json()['conversation']
    conversation_id = conversation['id']
    assert member_id in conversation['participant_ids']

    list_conversations = client.get('/conversations', headers=admin_headers)
    assert list_conversations.status_code == 200
    assert len(list_conversations.get_json()['conversations']) >= 1

    get_conversation = client.get(
        f'/conversations/{conversation_id}', headers=admin_headers)
    assert get_conversation.status_code == 200

    add_participant = client.patch(f'/conversations/{conversation_id}', headers=admin_headers, json={
        'participant_id': 'new-participant-id',
        'action': 'add',
    })
    assert add_participant.status_code == 200
    assert 'new-participant-id' in add_participant.get_json()[
        'conversation']['participant_ids']

    remove_participant = client.patch(f'/conversations/{conversation_id}', headers=admin_headers, json={
        'participant_id': 'new-participant-id',
        'action': 'remove',
    })
    assert remove_participant.status_code == 200
    assert 'new-participant-id' not in remove_participant.get_json()[
        'conversation']['participant_ids']

    create_message = client.post(f'/conversations/{conversation_id}/messages', headers=admin_headers, json={
        'content': 'Hello team',
    })
    assert create_message.status_code == 201
    message = create_message.get_json()['message']
    message_id = message['id']
    assert message['content'] == 'Hello team'

    list_conversation_messages = client.get(
        f'/conversations/{conversation_id}/messages', headers=admin_headers)
    assert list_conversation_messages.status_code == 200
    assert len(list_conversation_messages.get_json()['messages']) >= 1

    list_messages = client.get(
        '/messages', headers=admin_headers, query_string={'conversation_id': conversation_id})
    assert list_messages.status_code == 200
    assert len(list_messages.get_json()['messages']) >= 1

    list_by_author = client.get('/messages', headers=admin_headers,
                                query_string={'author_id': seeded_context['admin_user']['id']})
    assert list_by_author.status_code == 200
    assert len(list_by_author.get_json()['messages']) >= 1

    delete_message = client.delete(
        f'/messages/{message_id}', headers=admin_headers)
    assert delete_message.status_code == 200
    assert delete_message.get_json() == {'msg': 'message deleted'}

    missing_message = client.delete(
        f'/messages/{message_id}', headers=admin_headers)
    assert_error(missing_message, 404, ERROR_CODES['NOT_FOUND'])

    delete_conversation = client.delete(
        f'/conversations/{conversation_id}', headers=admin_headers)
    assert delete_conversation.status_code == 200
    assert delete_conversation.get_json(
    ) == {'msg': 'conversation deactivated'}


def test_notifications_flow(seeded_context):
    client = seeded_context['client']
    admin_headers = seeded_context['admin_headers']
    member_id = seeded_context['member_user']['id']

    create_notification = client.post('/notifications', headers=admin_headers, json={
        'recipient_id': member_id,
        'content': 'You have a new assignment',
    })
    assert create_notification.status_code == 201
    notification = create_notification.get_json()['notification']
    notification_id = notification['id']
    assert notification['recipient_id'] == member_id
    assert notification['is_read'] is False

    list_notifications = client.get(
        '/notifications', headers=admin_headers, query_string={'recipient_id': member_id})
    assert list_notifications.status_code == 200
    assert len(list_notifications.get_json()['notifications']) >= 1

    filtered_notifications = client.get(
        '/notifications', headers=admin_headers, query_string={'recipient_id': member_id, 'is_read': 'false'})
    assert filtered_notifications.status_code == 200
    assert len(filtered_notifications.get_json()['notifications']) >= 1

    mark_read = client.patch(
        f'/notifications/{notification_id}', headers=admin_headers, json={'is_read': True})
    assert mark_read.status_code == 200
    assert mark_read.get_json()['notification']['is_read'] is True

    delete_notification = client.delete(
        f'/notifications/{notification_id}', headers=admin_headers)
    assert delete_notification.status_code == 200
    assert delete_notification.get_json() == {'msg': 'notification deleted'}

    missing_notification = client.delete(
        f'/notifications/{notification_id}', headers=admin_headers)
    assert_error(missing_notification, 404, ERROR_CODES['NOT_FOUND'])


def test_news_flow_and_sync_placeholder(seeded_context):
    client = seeded_context['client']
    admin_headers = seeded_context['admin_headers']

    public_list = client.get('/news')
    assert public_list.status_code == 200
    assert 'news' in public_list.get_json()

    missing_title = client.post('/news', headers=admin_headers, json={})
    assert_error(missing_title, 400, ERROR_CODES['BAD_REQUEST'])

    create_news = client.post('/news', headers=admin_headers, json={
        'title': 'Release note',
        'source': 'Internal',
        'summary': 'Backend is ready',
        'url': 'https://example.com/news/release-note',
    })
    assert create_news.status_code == 201
    news_item = create_news.get_json()['news_item']
    news_id = news_item['id']
    assert news_item['title'] == 'Release note'

    get_news = client.get(f'/news/{news_id}')
    assert get_news.status_code == 200
    assert get_news.get_json()['news_item']['id'] == news_id

    sync_news = client.post('/news/sync', headers=admin_headers)
    assert_error(sync_news, 501, ERROR_CODES['NOT_IMPLEMENTED'])

    delete_news = client.delete(f'/news/{news_id}', headers=admin_headers)
    assert delete_news.status_code == 200
    assert delete_news.get_json() == {'msg': 'news item deleted'}


def test_formation_user_flow(seeded_context):
    client = seeded_context['client']
    admin_headers = seeded_context['admin_headers']
    member_headers = {'Authorization': f"Bearer {seeded_context['member_login']['access_token']}"}
    member_id = seeded_context['member_user']['id']

    training = client.post('/trainings', headers=admin_headers, json={
        'title': 'Python Advanced',
    }).get_json()['training']
    training_id = training['id']

    # express interest (no session scheduled yet)
    interest = client.post(f'/trainings/{training_id}/interest', headers=member_headers)
    assert interest.status_code == 201
    assert interest.get_json()['interest']['type'] == 'interested'

    # admin can see interested users
    interested = client.get(f'/trainings/{training_id}/interested', headers=admin_headers)
    assert interested.status_code == 200
    assert len(interested.get_json()['interested']) >= 1

    # admin creates a session
    session_resp = client.post(f'/trainings/{training_id}/sessions', headers=admin_headers, json={
        'start_date': '2027-01-10T09:00:00',
        'end_date': '2027-01-12T17:00:00',
        'max_participants': 10,
        'location': 'Paris',
    })
    assert session_resp.status_code == 201
    session_id = session_resp.get_json()['session']['id']

    # member enrolls — interest is auto-upgraded to enrolled
    enroll = client.post(f'/training-sessions/{session_id}/enroll', headers=member_headers)
    assert enroll.status_code == 201
    enrollment = enroll.get_json()['enrollment']
    assert enrollment['type'] == 'enrolled'
    assert enrollment['session_id'] == session_id
    relation_id = enrollment['id']

    # user sees their trainings
    user_trainings = client.get(f'/users/{member_id}/trainings', headers=admin_headers)
    assert user_trainings.status_code == 200
    assert len(user_trainings.get_json()['enrollments']) >= 1

    current_user_trainings = client.get('/me/trainings', headers=member_headers)
    assert current_user_trainings.status_code == 200
    assert len(current_user_trainings.get_json()['enrollments']) >= 1

    # admin marks session as completed → enrollment auto-completed
    complete = client.patch(f'/training-sessions/{session_id}', headers=admin_headers, json={
        'status': 'completed',
    })
    assert complete.status_code == 200

    completions = client.get('/trainings/completions', headers=admin_headers)
    assert completions.status_code == 200
    assert len(completions.get_json()['completions']) >= 1

    # admin revokes completion
    revoke = client.patch(f'/formation-users/{relation_id}', headers=admin_headers)
    assert revoke.status_code == 200
    assert revoke.get_json()['formation_user']['type'] == 'enrolled'

    # admin deletes the relation
    delete_relation = client.delete(f'/formation-users/{relation_id}', headers=admin_headers)
    assert delete_relation.status_code == 200
    assert delete_relation.get_json() == {'msg': 'enrollment deleted'}


@pytest.mark.parametrize(
    'payload, status, code',
    [
        ({}, 404, ERROR_CODES['NOT_FOUND']),
        ({'participant_id': ''}, 404, ERROR_CODES['NOT_FOUND']),
        ({'participant_id': 'x', 'action': 'invalid'},
         404, ERROR_CODES['NOT_FOUND']),
    ],
)
def test_conversation_patch_invalid_cases(seeded_context, payload, status, code):
    client = seeded_context['client']
    admin_headers = seeded_context['admin_headers']

    # create a conversation to operate on
    conv = client.post('/conversations', headers=admin_headers,
                       json={}).get_json()['conversation']

    response = client.patch(
        f"/conversations/{conv['id']}", headers=admin_headers, json=payload)
    assert_error(response, status, code)


@pytest.mark.parametrize(
    'payload, status, code',
    [
        ({}, 400, ERROR_CODES['VALIDATION_ERROR']),
        ({'content': ''}, 400, ERROR_CODES['VALIDATION_ERROR']),
    ],
)
def test_conversation_messages_post_invalid(seeded_context, payload, status, code):
    client = seeded_context['client']
    admin_headers = seeded_context['admin_headers']

    conv = client.post('/conversations', headers=admin_headers,
                       json={}).get_json()['conversation']
    response = client.post(
        f"/conversations/{conv['id']}/messages", headers=admin_headers, json=payload)
    assert_error(response, status, code)


@pytest.mark.parametrize(
    'payload, status, code',
    [
        ({}, 400, ERROR_CODES['BAD_REQUEST']),
        ({'recipient_id': '', 'content': 'Hi'},
         400, ERROR_CODES['BAD_REQUEST']),
        ({'recipient_id': 'some-id', 'content': ''},
         400, ERROR_CODES['BAD_REQUEST']),
    ],
)
def test_notifications_post_field_validation(seeded_context, payload, status, code):
    client = seeded_context['client']
    admin_headers = seeded_context['admin_headers']

    response = client.post(
        '/notifications', headers=admin_headers, json=payload)
    assert_error(response, status, code)


@pytest.mark.parametrize(
    'payload, status, code',
    [
        ({}, 400, ERROR_CODES['BAD_REQUEST']),
        ({'title': ''}, 400, ERROR_CODES['BAD_REQUEST']),
    ],
)
def test_news_post_field_validation(seeded_context, payload, status, code):
    client = seeded_context['client']
    admin_headers = seeded_context['admin_headers']

    response = client.post('/news', headers=admin_headers, json=payload)
    assert_error(response, status, code)


def test_training_interest_missing_training(seeded_context):
    client = seeded_context['client']
    member_headers = {'Authorization': f"Bearer {seeded_context['member_login']['access_token']}"}

    response = client.post('/trainings/nonexistent-id/interest', headers=member_headers)
    assert_error(response, 404, ERROR_CODES['NOT_FOUND'])
