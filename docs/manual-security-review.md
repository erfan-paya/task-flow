# TaskFlow — Manual Security Verification

This checklist is intended for manual verification with Bruno, Postman, or a browser. It does not require an automated test suite.

## 1. Environment and startup

- [ ] Set `CORS_ORIGINS` to the exact frontend origin, including scheme and port (for example, `http://localhost:3001`).\n- [ ] Confirm startup fails when `CORS_ORIGINS` is missing or empty.
- [ ] For production, use the deployed HTTPS frontend origin only.
- [ ] Start the API and confirm it connects to PostgreSQL.
- [ ] Confirm startup fails when a required secret is missing or shorter than 32 bytes.
- [ ] Confirm startup rejects malformed CORS origins and origins containing paths.

## 2. CORS

Send a request with an approved `Origin` header.

- [ ] Response includes `Access-Control-Allow-Origin` with that exact origin.
- [ ] Response includes `Access-Control-Allow-Credentials: true`.
- [ ] Response includes `Vary: Origin`.

Send a preflight request:

```http
OPTIONS /api/v1/auth/refresh
Origin: http://localhost:3001
Access-Control-Request-Method: POST
Access-Control-Request-Headers: content-type,x-csrf-token
```

- [ ] Approved preflight returns `204`.
- [ ] Response allows the requested method and headers.
- [ ] A different/unapproved origin does not receive CORS permission.
- [ ] Preflight from an unapproved or missing origin is rejected.

## 3. Authentication error handling

- [ ] Request `GET /api/v1/users/me` without Authorization; expect `401` and the standard error response shape.
- [ ] Send malformed Bearer credentials; expect `401`.
- [ ] Send an invalid or expired access token; expect `401`.
- [ ] Call refresh without the CSRF cookie/header; expect `403` and the standard error response shape.
- [ ] Send mismatched or invalid CSRF values; expect `403`.
- [ ] Confirm unexpected errors return a generic `500` response without stack traces or internal details.

## 4. Login throttling

- [ ] Send 10 login requests from one client IP within 15 minutes; requests should reach normal validation/authentication handling.
- [ ] Send the 11th request from that IP within the same window; expect `429`.
- [ ] Confirm the response includes rate-limit headers.
- [ ] After the window expires, confirm the client can try again.

The current limiter is in-memory and per process. Restarting the API resets its counters, and separate API instances do not share them. It is a baseline for the current single-instance project, not a distributed production rate limiter.

## 5. Request limits and response headers

- [ ] Send valid JSON with a body below 16 KB; normal route handling should continue.
- [ ] Send malformed JSON; expect `400`.
- [ ] Send a JSON body larger than 16 KB; expect `413`.
- [ ] Confirm responses include `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, and `Referrer-Policy: no-referrer`.
- [ ] Confirm `X-Powered-By` is absent.
- [ ] In production over HTTPS, confirm `Strict-Transport-Security` is present.

## 6. Existing authentication lifecycle

- [ ] Register and log in with valid credentials.
- [ ] Confirm the refresh token is an HttpOnly cookie and is not returned in the JSON body.
- [ ] Confirm the access token can access `GET /api/v1/users/me`.
- [ ] Refresh once and confirm the refresh cookie changes.
- [ ] Attempt to reuse the old refresh token and confirm the token family is revoked.
- [ ] Log out and confirm the refresh cookie is cleared and the refresh token cannot be used again.
- [ ] Confirm logout does not immediately revoke an already-issued access JWT; it expires within its configured lifetime.

## Deployment notes

- Use HTTPS in production.
- Configure the reverse proxy and Express proxy-trust setting deliberately before relying on IP-based rate limiting. Do not blindly trust arbitrary forwarded headers.
- For multiple API instances, move rate-limit state to a shared store.
- Set production secrets independently and keep them out of source control.
