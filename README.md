# Next.js + Redux Auth Frontend (for a Laravel 12 API)

Full authentication flow — login, signup, logout, forgot/reset password,
dashboard, and profile — built with Next.js (App Router) and Redux Toolkit,
talking to your existing Laravel 12 REST API.

## Setup

```bash
npm install
cp .env.local.example .env.local   # then set NEXT_PUBLIC_API_URL
npm run dev
```

## How auth state works

- **Redux slice** (`src/store/slices/authSlice.js`) holds `user`, `token`,
  `status`, and validation `errors`, with thunks for every auth action.
- **Token storage**: the Sanctum token is stored in a cookie (`auth_token`,
  via `js-cookie`) rather than localStorage, so `src/middleware.js` can read
  it on the edge and redirect before a protected page ever renders.
- **Session bootstrap**: `SessionInit` (mounted in `app/layout.js`) checks
  for that cookie on first load and calls `GET /user` to repopulate Redux
  state after a refresh.
- **Guards**: `AuthGuard` protects `/dashboard` and `/profile` client-side;
  `GuestGuard` keeps logged-in users out of `/login`, `/register`, etc.
  Middleware does the same check at the routing layer as a first line of
  defense.

## Expected Laravel API routes

This frontend assumes standard Laravel Sanctum token routes. Adjust
`src/lib/axios.js` calls or your `routes/api.php` so they line up:

| Method | Endpoint           | Body                                            | Response          |
| ------ | ------------------ | ----------------------------------------------- | ----------------- |
| POST   | `/register`        | `name, email, password, password_confirmation`  | `{ user, token }` |
| POST   | `/login`           | `email, password`                               | `{ user, token }` |
| POST   | `/logout`          | — (auth)                                        | `{}`              |
| GET    | `/user`            | — (auth)                                        | `{ user }`        |
| PUT    | `/profile`         | `name, email, ...` (auth)                       | `{ user }`        |
| POST   | `/forgot-password` | `email`                                         | `{ message }`     |
| POST   | `/reset-password`  | `token, email, password, password_confirmation` | `{ message }`     |

A minimal Sanctum-based `AuthController` typically issues the token with
`$user->createToken('web')->plainTextToken`. Make sure CORS
(`config/cors.php`) allows your Next.js origin and that `EnsureFrontendRequestsAreStateful`
is **not** required since we're using bearer tokens rather than
cookie-based SPA auth.

For `/reset-password`, Laravel's default `ResetPassword` notification links
to a Laravel Blade view. Point it at your Next.js app instead, e.g. in
`AppServiceProvider::boot()`:

```php
ResetPassword::createUrlUsing(function ($user, string $token) {
    return config('app.frontend_url')."/reset-password?token={$token}&email={$user->email}";
});
```

## Project structure

```
src/
  app/
    login/page.js
    register/page.js
    forgot-password/page.js
    reset-password/page.js
    dashboard/page.js
    profile/page.js
    layout.js, page.js, providers.js
  components/
    AuthGuard.js, GuestGuard.js, SessionInit.js
    AuthShell.js, Navbar.js, FormError.js
  store/
    store.js
    slices/authSlice.js
  lib/
    axios.js
  middleware.js
```

## Notes

- Styling uses Tailwind CSS with a small custom token set (see
  `tailwind.config.js` and `globals.css`); swap freely.
- Validation errors from Laravel's `{ errors: { field: [...] } }` shape are
  flattened automatically by `extractErrors()` in `src/lib/axios.js` and
  rendered under each field.

1. Usage Limit Per User
   Definition: The maximum number of times a single customer can use this promotion.

Purpose: Prevents the same customer from abusing the promotion repeatedly.

Examples:

First Purchase Discount → Set to 1 (each customer can only use it once)

Referral Discount → Set to 1 (one-time use per customer)

Loyalty Points Promotion → Set to 10 (customer can earn points up to 10 times)

How it works:

text
If Usage Limit Per User = 1:

- Customer A uses promotion → ✅ Allowed (1st use)
- Customer A tries again → ❌ Denied (already used limit)
- Customer B uses promotion → ✅ Allowed (1st use)

2. Total Usage Limit
   Definition: The maximum number of times this promotion can be used across all customers combined.

Purpose: Limits the total number of redemptions to control costs and availability.

Examples:

Flash Sale → Set to 50 (only 50 redemptions total)

Limited-time Offer → Set to 100 (first 100 customers get the deal)

Exclusive Promo → Set to 10 (exclusive to first 10 customers)

How it works:

text
If Total Usage Limit = 5:

- Customer A uses promotion → ✅ Allowed (1/5 used)
- Customer B uses promotion → ✅ Allowed (2/5 used)
- Customer C uses promotion → ✅ Allowed (3/5 used)
- Customer D uses promotion → ✅ Allowed (4/5 used)
- Customer E uses promotion → ✅ Allowed (5/5 used)
- Customer F tries to use → ❌ Denied (limit reached)
