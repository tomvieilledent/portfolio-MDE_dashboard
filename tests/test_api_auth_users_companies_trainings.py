from typing import Any, cast

import pytest

from backend.api.errors import ERROR_CODES


def assert_error(response, status, code):
    payload = response.get_json()
    assert response.status_code == status
    assert payload['error']['code'] == code
    return payload


def make_text(length, char='a'):
    return char * length


def test_home_and_openapi_routes(app_bundle):
    client = app_bundle['client']

    home = client.get('/')
    spec = client.get('/openapi.json')

    assert home.status_code == 200
    assert home.get_json() == {'ok': True}
    assert spec.status_code == 200
    assert 'openapi' in spec.get_json()


def test_auth_register_login_refresh_logout_and_revoke(app_bundle):
    client = app_bundle['client']

    register = client.post('/auth/register', json={
        'email': 'new.user@example.com',
        'password': 'password123',
        'first_name': 'New',
    })
    assert register.status_code == 201
    register_payload = register.get_json()
    assert register_payload['user']['email'] == 'new.user@example.com'
    assert register_payload['user']['first_name'] == 'New'
    assert 'access_token' in register_payload
    assert 'refresh_token' in register_payload

    duplicate = client.post('/auth/register', json={
        'email': 'new.user@example.com',
        'password': 'password123',
    })
    assert_error(duplicate, 409, ERROR_CODES['CONFLICT'])

    login = client.post('/auth/login', json={
        'email': 'new.user@example.com',
        'password': 'password123',
    })
    assert login.status_code == 200
    login_payload = login.get_json()
    assert login_payload['user']['email'] == 'new.user@example.com'

    refresh = client.post('/auth/refresh', headers={
        'Authorization': f"Bearer {login_payload['refresh_token']}"
    })
    assert refresh.status_code == 200
    assert 'access_token' in refresh.get_json()

    logout = client.post('/auth/logout', headers={
        'Authorization': f"Bearer {login_payload['access_token']}"
    })
    assert logout.status_code == 200
    assert logout.get_json() == {'msg': 'logged out'}

    revoked = client.get('/users/me', headers={
        'Authorization': f"Bearer {login_payload['access_token']}"
    })
    assert revoked.status_code == 401
    assert revoked.get_json()['error']['code'] in {
        ERROR_CODES['TOKEN_REVOKED'],
        ERROR_CODES['INVALID_TOKEN'],
    }


def test_auth_rejects_bad_payloads_and_invalid_credentials(app_bundle):
    client = app_bundle['client']

    missing = client.post(
        '/auth/register', json={'email': 'missing-password@example.com'})
    assert_error(missing, 400, ERROR_CODES['BAD_REQUEST'])

    invalid_email = client.post('/auth/register', json={
        'email': 'bad-email',
        'password': 'password123',
    })
    assert_error(invalid_email, 400, ERROR_CODES['VALIDATION_ERROR'])

    bad_login = client.post('/auth/login', json={
        'email': 'ghost@example.com',
        'password': 'password123',
    })
    assert_error(bad_login, 401, ERROR_CODES['INVALID_CREDENTIALS'])


@pytest.mark.parametrize(
    'payload, status, code',
    [
        ({'email': '', 'password': 'password123'},
         400, ERROR_CODES['BAD_REQUEST']),
        ({'email': 'user@example.com', 'password': ''},
         400, ERROR_CODES['BAD_REQUEST']),
        ({'email': 123, 'password': 'password123'},
         400, ERROR_CODES['VALIDATION_ERROR']),
        ({'email': 'user@example.com', 'password': 123},
         400, ERROR_CODES['VALIDATION_ERROR']),
        ({'email': make_text(255) + '@example.com',
         'password': 'password123'}, 400, ERROR_CODES['VALIDATION_ERROR']),
    ],
)
def test_auth_register_field_validation_cases(app_bundle, payload, status, code):
    client = app_bundle['client']

    response = client.post('/auth/register', json=payload)
    assert_error(response, status, code)


def test_protected_route_requires_auth(app_bundle):
    client = app_bundle['client']

    response = client.get('/users')
    assert_error(response, 401, ERROR_CODES['UNAUTHORIZED'])


def test_user_crud_and_profile_endpoints(seeded_context):
    client = seeded_context['client']
    admin_headers = seeded_context['admin_headers']
    member_id = seeded_context['member_user']['id']

    me = client.get('/users/me', headers=admin_headers)
    assert me.status_code == 200
    assert me.get_json()['user']['email'] == 'admin@example.com'

    updated_me = client.patch('/users/me', headers=admin_headers, json={
        'first_name': 'Updated',
        'last_name': 'Admin',
    })
    assert updated_me.status_code == 200
    assert updated_me.get_json()['user']['first_name'] == 'Updated'

    create_user = client.post('/users', headers=admin_headers, json={
        'email': 'created@example.com',
        'password': 'password123',
        'first_name': 'Created',
        'last_name': 'User',
        'company_id': None,
        'is_super_admin': False,
    })
    assert create_user.status_code == 201
    created_user_id = create_user.get_json()['user']['id']

    list_users = client.get('/users', headers=admin_headers)
    assert list_users.status_code == 200
    assert len(list_users.get_json()['users']) >= 4

    get_user = client.get(f'/users/{created_user_id}', headers=admin_headers)
    assert get_user.status_code == 200
    assert get_user.get_json()['user']['email'] == 'created@example.com'

    replace_user = client.put(f'/users/{created_user_id}', headers=admin_headers, json={
        'first_name': 'Replaced',
        'last_name': 'Name',
    })
    assert replace_user.status_code == 200
    assert replace_user.get_json()['user']['first_name'] == 'Replaced'

    patch_user = client.patch(f'/users/{created_user_id}', headers=admin_headers, json={
        'phone': '+33600000000',
    })
    assert patch_user.status_code == 200
    assert patch_user.get_json()['user']['phone'] == '+33600000000'

    reset_password = client.post(f'/users/{created_user_id}/reset-password', headers=admin_headers, json={
        'password': 'newpassword123',
    })
    assert reset_password.status_code == 200

    deactivate_user = client.patch(
        f'/users/{created_user_id}/deactivate', headers=admin_headers)
    assert deactivate_user.status_code == 200
    assert deactivate_user.get_json() == {'msg': 'deactivated'}

    delete_user = client.delete(
        f'/users/{created_user_id}', headers=admin_headers)
    assert delete_user.status_code == 200
    assert delete_user.get_json() == {'msg': 'user deleted'}

    deleted_user = client.get(
        f'/users/{created_user_id}', headers=admin_headers)
    assert_error(deleted_user, 404, ERROR_CODES['NOT_FOUND'])

    filtered_users = client.get(
        '/users', headers=admin_headers, query_string={'company_id': 'missing-company'})
    assert filtered_users.status_code == 200
    assert filtered_users.get_json()['users'] == []

    member_profile = client.get(f'/users/{member_id}', headers=admin_headers)
    assert member_profile.status_code == 200


@pytest.mark.parametrize(
    'payload, status, code',
    [
        ({'email': 'missing-password@example.com'},
         400, ERROR_CODES['BAD_REQUEST']),
        ({'email': 'bad-email', 'password': 'password123'},
         400, ERROR_CODES['VALIDATION_ERROR']),
        ({'email': 123, 'password': 'password123'},
         400, ERROR_CODES['VALIDATION_ERROR']),
        ({'email': 'user@example.com', 'password': 123},
         400, ERROR_CODES['VALIDATION_ERROR']),
        ({'email': 'user@example.com', 'password': make_text(257)},
         400, ERROR_CODES['VALIDATION_ERROR']),
    ],
)
def test_user_create_field_validation_cases(seeded_context, payload, status, code):
    client = seeded_context['client']
    admin_headers = seeded_context['admin_headers']

    response = client.post('/users', headers=admin_headers, json=payload)
    assert_error(response, status, code)


def test_company_flow_and_admin_email_requirement(seeded_context):
    client = seeded_context['client']
    admin_headers = seeded_context['admin_headers']
    company_admin_id = seeded_context['company_admin_user']['id']

    missing_admin_email = client.post('/companies', headers=admin_headers, json={
        'name': 'No Admin Email',
    })
    assert_error(missing_admin_email, 400, ERROR_CODES['BAD_REQUEST'])

    invalid_admin_email = client.post('/companies', headers=admin_headers, json={
        'name': 'Invalid Email Company',
        'admin_email': 'bad-email',
    })
    assert_error(invalid_admin_email, 400, ERROR_CODES['VALIDATION_ERROR'])

    create_company = client.post('/companies', headers=admin_headers, json={
        'name': 'My Company',
        'description': 'Demo company',
        'website_link': 'https://example.com',
        'admin_email': 'company.admin@example.com',
    })
    assert create_company.status_code == 201
    company = create_company.get_json()['company']
    company_id = company['id']
    assert company['admin_email'] == 'company.admin@example.com'
    assert company['admin_id'] == company_admin_id

    list_companies = client.get('/companies', headers=admin_headers)
    assert list_companies.status_code == 200
    assert len(list_companies.get_json()['companies']) >= 1

    get_company = client.get(f'/companies/{company_id}', headers=admin_headers)
    assert get_company.status_code == 200
    assert get_company.get_json()['company']['id'] == company_id

    patch_company = client.patch(f'/companies/{company_id}', headers=admin_headers, json={
        'description': 'Updated description',
    })
    assert patch_company.status_code == 200
    from backend.persistence.db import SessionLocal
    from backend.persistence.models import Company as ORMCompany

    db = SessionLocal()
    try:
        stored_company = db.query(ORMCompany).filter(
            ORMCompany.id == company_id).first()
        assert stored_company is not None
        stored_company = cast(Any, stored_company)
        assert stored_company.description == 'Updated description'
    finally:
        db.close()

    company_users = client.get(
        f'/companies/{company_id}/users', headers=admin_headers)
    assert company_users.status_code == 200
    assert company_users.get_json()['users'] == []

    assign_user = client.post(
        f'/companies/{company_id}/users/{seeded_context["member_user"]["id"]}', headers=admin_headers)
    assert assign_user.status_code == 200
    from backend.persistence.db import SessionLocal
    from backend.persistence.models import User as ORMUser

    db = SessionLocal()
    try:
        stored_user = db.query(ORMUser).filter(
            ORMUser.id == seeded_context['member_user']['id']).first()
        assert stored_user is not None
        stored_user = cast(Any, stored_user)
        assert stored_user.company_id == company_id
    finally:
        db.close()

    company_users_after_assign = client.get(
        f'/companies/{company_id}/users', headers=admin_headers)
    assert company_users_after_assign.status_code == 200
    assert len(company_users_after_assign.get_json()['users']) == 1

    remove_user = client.delete(
        f'/companies/{company_id}/users/{seeded_context["member_user"]["id"]}', headers=admin_headers)
    assert remove_user.status_code == 200
    db = SessionLocal()
    try:
        stored_user = db.query(ORMUser).filter(
            ORMUser.id == seeded_context['member_user']['id']).first()
        assert stored_user is not None
        stored_user = cast(Any, stored_user)
        assert stored_user.company_id is None
    finally:
        db.close()

    deactivate_company = client.delete(
        f'/companies/{company_id}', headers=admin_headers)
    assert deactivate_company.status_code == 200
    assert deactivate_company.get_json() == {'msg': 'company deactivated'}

    list_filtered = client.get(
        '/users', headers=admin_headers, query_string={'company_id': company_id})
    assert list_filtered.status_code == 200


@pytest.mark.parametrize(
    'payload, status, code',
    [
        ({'name': ''}, 400, ERROR_CODES['BAD_REQUEST']),
        ({'name': 'Valid Company'}, 400, ERROR_CODES['BAD_REQUEST']),
        ({'name': 123, 'admin_email': 'admin@example.com'},
         400, ERROR_CODES['VALIDATION_ERROR']),
        ({'name': make_text(201), 'admin_email': 'admin@example.com'},
         400, ERROR_CODES['VALIDATION_ERROR']),
        ({'name': 'Valid Company', 'admin_email': ''},
         400, ERROR_CODES['BAD_REQUEST']),
        ({'name': 'Valid Company', 'admin_email': 123},
         400, ERROR_CODES['VALIDATION_ERROR']),
        ({'name': 'Valid Company', 'admin_email': make_text(255) +
         '@example.com'}, 400, ERROR_CODES['VALIDATION_ERROR']),
        ({'name': 'Valid Company', 'admin_email': 'missing@example.com'},
         400, ERROR_CODES['BAD_REQUEST']),
        ({'name': 'Valid Company', 'admin_email': 'company.admin@example.com',
         'admin_id': 'bad-uuid'}, 400, ERROR_CODES['VALIDATION_ERROR']),
    ],
)
def test_company_create_field_validation_cases(seeded_context, payload, status, code):
    client = seeded_context['client']
    admin_headers = seeded_context['admin_headers']

    response = client.post('/companies', headers=admin_headers, json=payload)
    assert_error(response, status, code)


def test_training_permissions_and_crud(seeded_context):
    client = seeded_context['client']
    admin_headers = seeded_context['admin_headers']
    company_admin_headers = seeded_context['company_admin_headers']

    company = client.post('/companies', headers=admin_headers, json={
        'name': 'Training Company',
        'admin_email': 'company.admin@example.com',
    }).get_json()['company']

    forbidden = client.post('/trainings', headers=company_admin_headers, json={
        'title': 'Docker Basics',
        'company_id': company['id'],
    })
    assert_error(forbidden, 403, ERROR_CODES['FORBIDDEN'])

    create_training = client.post('/trainings', headers=admin_headers, json={
        'title': 'Docker Basics',
        'company_id': company['id'],
        'description': 'Intro to Docker',
    })
    assert create_training.status_code == 201
    training = create_training.get_json()['training']
    training_id = training['id']
    assert training['title'] == 'Docker Basics'
    assert training['company_id'] == company['id']

    list_trainings = client.get('/trainings', headers=admin_headers)
    assert list_trainings.status_code == 200
    assert len(list_trainings.get_json()['trainings']) >= 1

    get_training = client.get(
        f'/trainings/{training_id}', headers=admin_headers)
    assert get_training.status_code == 200

    patch_training = client.patch(f'/trainings/{training_id}', headers=admin_headers, json={
        'description': 'Updated description',
    })
    assert patch_training.status_code == 200
    from backend.persistence.db import SessionLocal
    from backend.persistence.models import Training as ORMTraining

    db = SessionLocal()
    try:
        stored_training = db.query(ORMTraining).filter(
            ORMTraining.id == training_id).first()
        assert stored_training is not None
        stored_training = cast(Any, stored_training)
        assert stored_training.description == 'Updated description'
    finally:
        db.close()


@pytest.mark.parametrize(
    'payload',
    [
        ({'first_name': '', 'last_name': 'Valid'}),
        ({'first_name': '   ', 'last_name': 'Valid'}),
        ({'first_name': 123, 'last_name': 'Valid'}),
        ({'first_name': 'A' * 101, 'last_name': 'Valid'}),
        ({'first_name': 'Valid', 'last_name': ''}),
        ({'first_name': 'Valid', 'last_name': '   '}),
        ({'first_name': 'Valid', 'last_name': 123}),
        ({'first_name': 'Valid', 'last_name': 'B' * 101}),
    ],
)
def test_user_update_name_validation_cases(seeded_context, payload):
    """PUT and PATCH to update user names must validate inputs."""
    client = seeded_context['client']
    admin_headers = seeded_context['admin_headers']

    # create a user to operate on
    create_user = client.post('/users', headers=admin_headers, json={
        'email': 'to.update@example.com',
        'password': 'password123',
        'first_name': 'Initial',
        'last_name': 'Name',
    })
    assert create_user.status_code == 201
    user_id = create_user.get_json()['user']['id']

    # PUT should reject invalid payloads
    resp_put = client.put(f'/users/{user_id}',
                          headers=admin_headers, json=payload)
    assert_error(resp_put, 400, ERROR_CODES['VALIDATION_ERROR'])

    # PATCH should also reject when provided
    resp_patch = client.patch(
        f'/users/{user_id}', headers=admin_headers, json=payload)
    assert_error(resp_patch, 400, ERROR_CODES['VALIDATION_ERROR'])

    # name validation assertions complete


@pytest.mark.parametrize(
    'payload',
    [
        ({'first_name': ''}),
        ({'first_name': '   '}),
        ({'first_name': 123}),
        ({'first_name': 'A' * 101}),
        ({'last_name': ''}),
        ({'last_name': '   '}),
        ({'last_name': 123}),
        ({'last_name': 'B' * 101}),
    ],
)
def test_me_patch_name_validation_cases(seeded_context, payload):
    """PATCH /users/me should validate name inputs like the user endpoints."""
    client = seeded_context['client']
    admin_headers = seeded_context['admin_headers']

    resp = client.patch('/users/me', headers=admin_headers, json=payload)
    assert_error(resp, 400, ERROR_CODES['VALIDATION_ERROR'])


@pytest.mark.parametrize(
    'payload, status, code',
    [
        ({}, 400, ERROR_CODES['BAD_REQUEST']),
        ({'title': ''}, 400, ERROR_CODES['BAD_REQUEST']),
        ({'title': 123}, 400, ERROR_CODES['VALIDATION_ERROR']),
        ({'title': make_text(201)}, 400, ERROR_CODES['VALIDATION_ERROR']),
        ({'title': 'Docker Basics', 'description': 123},
         400, ERROR_CODES['VALIDATION_ERROR']),
        ({'title': 'Docker Basics', 'description': make_text(2001)},
         400, ERROR_CODES['VALIDATION_ERROR']),
        ({'title': 'Docker Basics', 'picture': 123},
         400, ERROR_CODES['VALIDATION_ERROR']),
        ({'title': 'Docker Basics', 'picture': make_text(513)},
         400, ERROR_CODES['VALIDATION_ERROR']),
    ],
)
def test_training_create_field_validation_cases(seeded_context, payload, status, code):
    client = seeded_context['client']
    admin_headers = seeded_context['admin_headers']

    response = client.post('/trainings', headers=admin_headers, json=payload)
    assert_error(response, status, code)
