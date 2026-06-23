# API Overview

## Auth

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`

## Users

- `GET /users`
- `POST /users`
- `GET /users/me` / `GET /me`
- `PATCH /users/me` / `PATCH /me`
- `GET /users/{id}`
- `PATCH /users/{id}`
- `PUT /users/{id}`
- `DELETE /users/{id}`
- `POST /users/{id}/reset-password`
- `GET /users/{id}/trainings`
- `GET /me/trainings`

## Companies

- `GET /companies`
- `POST /companies`
- `GET /companies/{id}`
- `PATCH /companies/{id}`
- `DELETE /companies/{id}`
- `GET /companies/{id}/users`
- `POST /companies/{id}/users/{user_id}`
- `DELETE /companies/{id}/users/{user_id}`

## Trainings

- `GET /trainings`
- `POST /trainings`
- `GET /trainings/{id}`
- `PATCH /trainings/{id}`
- `DELETE /trainings/{id}`
- `POST /trainings/{id}/enroll`
- `POST /trainings/{id}/join`
- `GET /trainings/{id}/enrollments`

## Conversations / Rooms

- `GET /conversations` / `GET /rooms`
- `POST /conversations` / `POST /rooms`
- `GET /conversations/{id}` / `GET /rooms/{id}`
- `PATCH /conversations/{id}` / `PATCH /rooms/{id}`
- `DELETE /conversations/{id}` / `DELETE /rooms/{id}`
- `GET /conversations/{id}/messages` / `GET /rooms/{id}/messages`
- `POST /conversations/{id}/messages` / `POST /rooms/{id}/messages`

## Messages

- `GET /messages`
- `DELETE /messages/{id}`

## Notifications

- `GET /notifications`
- `POST /notifications`
- `PATCH /notifications/{id}`
- `DELETE /notifications/{id}`

## News

- `GET /news`
- `GET /news/{id}`
- `POST /news`
- `POST /news/sync`

## Formation Users

- `GET /formation-users`
- `POST /formation-users`
- `GET /formation-users/{id}`
- `PATCH /formation-users/{id}`
- `DELETE /formation-users/{id}`

## Error Codes

All errors use this JSON shape:

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "user not found",
    "details": null
  }
}
```

Defined codes:

- `BAD_REQUEST`
- `UNAUTHORIZED`
- `FORBIDDEN`
- `NOT_FOUND`
- `CONFLICT`
- `VALIDATION_ERROR`
- `INVALID_CREDENTIALS`
- `INVALID_TOKEN`
- `TOKEN_EXPIRED`
- `TOKEN_REVOKED`
- `NOT_IMPLEMENTED`
- `INTERNAL_ERROR`
