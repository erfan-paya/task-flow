# TaskFlow — Authentication

## 1. Overview

TaskFlow uses short-lived access JWTs and opaque refresh tokens.

- Access tokens are JWTs signed with HS256. They expire after 15 minutes and are sent in the `Authorization: Bearer <token>` header.
- Refresh tokens are cryptographically random opaque values. The database stores only their SHA-256 hashes.
- Refresh tokens expire after seven days and are delivered in an HttpOnly cookie.
- Each successful refresh rotates the refresh token. The replacement stays in the same token family.
- Reuse of a revoked refresh token revokes the remaining active tokens in that family.
- CSRF protection is required for cookie-authenticated refresh and logout endpoints.

JWT signing and CSRF signing use separate secrets: `JWT_SECRET` and `CSRF_SECRET`. Both must be at least 32 bytes.

## 2. Endpoints

| Method | Endpoint | Authentication | Purpose |
| --- | --- | --- | --- |
| POST | `/api/v1/auth/register` | Public | Create a user account |
| POST | `/api/v1/auth/login` | Public | Verify credentials and issue tokens |
| GET | `/api/v1/auth/csrf` | Public | Issue a CSRF token |
| POST | `/api/v1/auth/refresh` | Refresh cookie + CSRF | Rotate refresh token and issue an access token |
| POST | `/api/v1/auth/logout` | Refresh cookie + CSRF | Revoke the current refresh token |
| GET | `/api/v1/users/me` | Access JWT | Return the authenticated user's profile |

### Registration

Request:

```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "name": "Erfan Paya",
  "email": "erfan@example.com",
  "password": "a-secure-password"
}
```

Successful response: `201 Created`. The response contains the created user's public fields and never includes the password hash.

### Login

Request:

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "erfan@example.com",
  "password": "a-secure-password"
}
```

Successful response: `200 OK`. The JSON response contains an access token and public user data. The refresh token is set in the `refreshToken` HttpOnly cookie.

Invalid email and invalid password return the same unauthorized error to avoid revealing whether an account exists.

### Current user

Send the access token in the authorization header:

```http
GET /api/v1/users/me
Authorization: Bearer <access-token>
```

Successful response: `200 OK`, with the user's public profile. Missing, malformed, invalid, and expired access tokens are rejected.

## 3. Refresh and logout flow

The refresh token is stored by the browser in an HttpOnly cookie scoped to `/api/v1/auth`. JavaScript cannot read this cookie.

Before calling refresh or logout, the client obtains a CSRF token:

```http
GET /api/v1/auth/csrf
```

The response includes a CSRF token and sets a readable `csrfToken` cookie. For a state-changing cookie-authenticated request, the client must send the same token in the `X-CSRF-Token` header. The server compares the cookie and header values and verifies the token's HMAC signature and timestamp.

Refresh request:

```http
POST /api/v1/auth/refresh
X-CSRF-Token: <csrf-token>
Cookie: refreshToken=<http-only-refresh-token>; csrfToken=<csrf-token>
```

On success, the server revokes the old refresh token, creates a replacement in the same family, sets the replacement cookie, and returns a new access JWT.

Logout request:

```http
POST /api/v1/auth/logout
X-CSRF-Token: <csrf-token>
Cookie: refreshToken=<http-only-refresh-token>; csrfToken=<csrf-token>
```

Logout revokes the current refresh token and clears its cookie. Logging out does not immediately invalidate an already-issued access JWT; it remains valid until its short expiration time.

## 4. Browser deployment considerations

The intended frontend and API hosts are `app.taskflow.com` and `api.taskflow.com`. They are different origins but are same-site when served over HTTPS under the same registrable domain.

- Browser requests that need cookies must include credentials.
- The API must configure CORS for the exact frontend origin and enable credentials; wildcard origins cannot be used with credentialed requests.
- The refresh cookie is HttpOnly, Secure in production, and uses SameSite=Lax.
- The CSRF cookie is readable by frontend JavaScript so its value can be copied into the request header.
- CSRF protection remains necessary for cookie-authenticated endpoints.

CORS has not yet been configured in the current application. The browser deployment flow must not be considered complete until an explicit frontend-origin allowlist and credentialed preflight handling are implemented.

## 5. Security boundaries and limitations

- Passwords are hashed with Argon2id.
- Access JWTs are short-lived and verified against the configured algorithm, issuer, and audience.
- Refresh tokens are random, stored as hashes, rotated, and grouped into families for reuse detection.
- Refresh and logout are protected by a signed double-submit CSRF token.
- Logging and error responses must never expose raw access tokens, refresh tokens, passwords, or secret values.
- Access JWTs are not stored server-side, so logout and refresh-token revocation do not revoke an access JWT before its expiry.
- Login rate limiting, automated database-backed integration tests, and production security hardening remain follow-up work.
