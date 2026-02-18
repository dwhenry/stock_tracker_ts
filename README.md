# Stock Tracker (TypeScript)

A TypeScript/Next.js port of the Stock Tracker Rails app. Monorepo with Next.js (App Router) and Drizzle ORM + MySQL.

## Stack

- **Monorepo**: pnpm workspaces
- **App**: Next.js 15 (App Router), React 19
- **Database**: MySQL, Drizzle ORM
- **Auth**: JWT in HTTP-only cookie (no email in this version)

## Structure

- `apps/web` – Next.js app (dashboard, customers, accessories, customer stocks, checkout, users, account)
- `packages/database` – Drizzle schema, client, migrations

## Setup

1. **Prerequisites**: Node 20+, pnpm, MySQL (e.g. local or Docker).

2. **Install**:
   ```bash
   pnpm install
   ```

3. **Database**: Create a MySQL database and set `DATABASE_URL`:
   ```bash
   export DATABASE_URL="mysql://root:password@localhost:3306/stock_tracker"
   ```
   Then create the DB (e.g. `CREATE DATABASE stock_tracker;`) and push schema:
   ```bash
   pnpm db:push
   ```

4. **Seed** (creates admin user):
   ```bash
   pnpm db:seed
   ```
   Default login: `admin@stock-tracker.com` / `password123` (change after first login).

5. **Run**:
   ```bash
   pnpm dev
   ```
   Open [http://localhost:3000](http://localhost:3000). Log in, then use Dashboard, Customers, Accessories, and (for admin) Users.

## Scripts

| Command       | Description                    |
|---------------|--------------------------------|
| `pnpm dev`    | Start Next.js dev server       |
| `pnpm build`  | Build web app                  |
| `pnpm db:push`| Push Drizzle schema to MySQL   |
| `pnpm db:generate` | Generate Drizzle migrations |
| `pnpm db:migrate`  | Run migrations            |
| `pnpm db:studio`  | Open Drizzle Studio      |
| `pnpm db:seed`    | Seed admin user           |

## Features

- **Auth**: Login, logout, JWT session; forgot/reset password (no email sent); account (change password).
- **Users** (admin): CRUD; roles `basic` | `admin`.
- **Customers**: CRUD; custom alert levels per accessory on edit.
- **Accessories**: CRUD; barcode, default “alert when stock below”; optional image (DB-backed blob).
- **Customer stocks**: Per-customer, per-accessory quantity and optional alert override; add/edit/delete; adjustments recorded (initial, addition, removal, checkout).
- **Checkout**: Multi-item checkout; reduces stock and records checkout adjustments (no email).
- **Dashboard**: Counts (customers, accessories, low-stock items) and low-stock table.

## Env

- `DATABASE_URL` – MySQL connection string (default: `mysql://root@localhost:3306/stock_tracker`).
- `JWT_SECRET` – Secret for signing JWTs (default: dev-only value; set in production).

## Differences from Rails version

- **Auth**: JWT in cookie instead of server-side sessions; password reset tokens stored in DB (no email).
- **Jobs**: No background queue; “low stock” logic is inline (email omitted).
- **Images**: Accessory images stored in `blobs` table (longblob), served via `/api/blobs/[id]`.
