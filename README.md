# MB Traders — Admin Dashboard

A React web app for managing everything the mobile app shows: products,
categories, orders, and customers. This is what fixes "no data to show in
the app" — right now your database is empty except for the seed data; this
dashboard is how you (or whoever runs the shop) will add real products going
forward.

## Before you start: update your backend

Your existing backend already had most of what this needs (order management,
customer list, dashboard stats, product create/edit/delete). Two things were
missing, so I've added them:

- **Category management** (create/edit/delete) — previously the backend
  could only *list* categories, not manage them
- **An endpoint to list all products including inactive ones** — the public
  endpoint only shows active products, which isn't useful for an admin view

**You need to update two files in your `mb-traders-backend-mongo` project**
before this dashboard will fully work:
- `src/routes/categories.routes.js`
- `src/routes/products.routes.js`

I've attached the full updated backend as a zip alongside this dashboard —
just replace your existing backend folder with it (or copy over those two
files if you've made other changes you want to keep), then redeploy:

```bash
cd mb-traders-backend-mongo
vercel --prod
```

## Running the dashboard locally

```bash
cd mb-traders-admin
npm install
cp .env.example .env.local
```

Open `.env.local` and set `VITE_API_BASE_URL` to your backend's URL — your
deployed Vercel URL (`https://your-project.vercel.app/api`) or
`http://localhost:4000/api` if you're running the backend locally too.

```bash
npm run dev
```

Open the URL it prints (usually `http://localhost:5173`).

## Logging in

This dashboard only lets in accounts with `isAdmin: true`. If you haven't
made one yet:

1. Register any account (through the mobile app's Sign Up screen, or by
   calling `POST /api/auth/register` directly).
2. From your backend folder, run:
   ```bash
   npm run make-admin -- 03001234567
   ```
   (using that account's phone number)
3. Log in to the dashboard with that phone number and password.

## What you can do here

- **Dashboard** — total orders, sales, customers, pending orders, recent
  orders, and top-selling products at a glance.
- **Products** — add, edit, deactivate, or delete products. Setting a base
  price automatically generates the 250g/500g/1KG/2KG pricing tiers the app
  shows on the product detail screen.
- **Categories** — add, edit, or delete categories. You can't delete a
  category that still has products in it (the backend blocks this on
  purpose, to avoid orphaned products).
- **Orders** — filter by status, expand to see items and delivery address,
  and move an order forward (Pending → Packing → Out for Delivery →
  Delivered) with one click, or cancel it.
- **Customers** — see everyone who's registered.

Any product or category you add here shows up in the mobile app immediately
— there's no separate sync step, they're reading from the same database.

## Deploying this dashboard so it's not just on your PC

Same idea as the backend — deploy to Vercel:

```bash
npm install -g vercel   # if you haven't already
vercel
```

Then set the environment variable and redeploy:
```bash
vercel env add VITE_API_BASE_URL
vercel --prod
```

You'll get a URL like `https://mb-traders-admin.vercel.app` — bookmark it,
that's your shop management panel from now on.

## A note on who can access this

Right now, anyone who knows this dashboard's URL can see the login screen
(though they can't do anything without an admin account's password). Once
you're managing a real shop, consider: keeping the dashboard URL private,
using a strong password on your admin account, and not sharing the admin
phone/password with anyone who doesn't need full control over products and
orders.
