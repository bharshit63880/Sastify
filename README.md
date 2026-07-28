# Sastify

Sastify is a MERN marketplace with a responsive storefront, product discovery, cart and checkout, customer accounts, order tracking, and a role-protected administration workspace.

## Architecture

- `frontend/`: Create React App, React Router, Redux Toolkit, Tailwind, Framer Motion, and selective MUI compatibility.
- `backend/`: Express, Mongoose, JWT authentication, address/cart/order services, coupons, banners, and configurable payment gateways.
- Deployment: the existing frontend and backend Vercel projects remain separate. No framework or deployment migration is required.

## Local setup

1. Install dependencies in `frontend` and `backend` with `npm install`.
2. Copy each `.env.example` to `.env` in the same folder.
3. Replace placeholder values locally. Never commit `.env`.
4. Start MongoDB or provide a reachable Atlas URI.
5. Run `npm run dev` in `backend`.
6. Run `npm start` in `frontend`.

The backend waits for its initial database connection before opening the local HTTP listener. Vercel requests connect through the shared connection helper.

## Environment

Frontend:

- `REACT_APP_BASE_URL`: deployed backend origin, without a trailing slash.
- `REACT_APP_STRIPE_PUBLISHABLE_KEY`: optional legacy Stripe form key when that form is enabled.

Backend:

- `MONGO_URI`, `JWT_SECRET`, `ORIGIN`, `PRODUCTION`, `NODE_ENV`
- `COOKIE_EXPIRATION_DAYS`, `OTP_EXPIRATION_TIME`
- `LOGIN_TOKEN_EXPIRATION`, `PASSWORD_RESET_TOKEN_EXPIRATION`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`
- `PAYMENT_PROVIDER`
- Provider-specific PayU or Razorpay keys
- `MOCK_PAYMENT_SECRET` for explicit local/test payment mode only
- `ALLOW_VERCEL_PREVIEWS`: opt-in; keep false unless arbitrary preview origins are intentionally trusted

`ORIGIN` accepts a comma-separated allowlist. Credentials-enabled CORS is never wildcarded.

## Validation

Frontend:

```bash
npm test -- --watchAll=false
npm run build
```

Backend:

```bash
node --check index.js
```

The backend package currently has no automated integration-test runner. Security-sensitive routes should also be exercised against a disposable test database.

## Security notes

- Customer and admin routes verify JWTs from the HTTP-only cookie or bearer token.
- Blocked users are rejected during token resolution.
- All product, category, brand, coupon, banner, user-management, and order-management mutations require admin authorization.
- Address and customer-order operations are ownership-scoped.
- Gateway order IDs are unique and successful payment verification returns the existing order on a replay.
- A database transaction is still recommended for payment verification, stock decrement, coupon usage, cart clearing, and order creation as one atomic operation.
- In-memory rate limiting was intentionally not added because it is unreliable across Vercel serverless instances. Use an edge or durable rate-limit service for production auth endpoints.

## Production smoke checklist

1. Open the backend root endpoint and confirm a `200` health response.
2. Open the frontend and confirm storefront APIs use `REACT_APP_BASE_URL`.
3. Verify the production frontend origin is present in backend `ORIGIN`.
4. Confirm unknown origins do not receive credentialed CORS access.
5. Sign up, request OTP, verify the account, sign out, and sign in again.
6. Confirm an expired session returns `401` and the intended frontend route is preserved.
7. Add a product as a guest, sign in, and verify guest-cart synchronization.
8. Create, edit, set default, and delete an address owned by the test customer.
9. Apply a valid and invalid coupon and verify totals come from checkout preview.
10. Run COD order creation once and confirm cart, stock, coupon usage, and order history.
11. In gateway test mode, verify success, failure, retry, and duplicate-callback behavior.
12. Confirm a non-admin receives `403` for every admin mutation, including banners.
13. Confirm an admin can manage products, orders, users, categories, brands, coupons, and banners.
14. Verify dark/light themes and widths from 320 through 1440 pixels.
15. Inspect browser and Vercel logs for CORS, cookie, database, payment, and unhandled errors.

## Known limitations

- Live flows require a reachable MongoDB deployment and valid SMTP/payment configuration.
- Product variant inventory is global; color-size combination availability is not modeled.
- Review records do not currently prove verified purchases.
- Full order creation is not yet wrapped in a MongoDB transaction.
- Production Lighthouse results depend on backend availability and network latency.
