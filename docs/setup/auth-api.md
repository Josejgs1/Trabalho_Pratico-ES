[← Back to Index](../INDEX.md)

# Authentication API

Base authentication endpoints for KULTI's first backend/frontend integration cycle.

## Endpoints

### POST `/auth/register`

Creates a new user account.

Request body:

```json
{
  "name": "Ana Silva",
  "email": "ana@email.com",
  "password": "12345678"
}
```

Response `201 Created`:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Ana Silva",
  "email": "ana@email.com",
  "is_active": true,
  "created_at": "2026-04-08T12:00:00Z",
  "updated_at": "2026-04-08T12:00:00Z"
}
```

### POST `/auth/login`

Authenticates an existing user with email and password.

Request body:

```json
{
  "email": "ana@email.com",
  "password": "12345678"
}
```

Response `200 OK`:

```json
{
  "access_token": "<token>",
  "token_type": "bearer",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Ana Silva",
    "email": "ana@email.com",
    "is_active": true,
    "created_at": "2026-04-08T12:00:00Z",
    "updated_at": "2026-04-08T12:00:00Z"
  }
}
```

### GET `/auth/me`

Returns the authenticated user associated with the bearer token.

Header:

```text
Authorization: Bearer <token>
```