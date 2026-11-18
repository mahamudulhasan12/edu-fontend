# Diploma Talent Hunter

React/Vite frontend with an Express API, PostgreSQL/Prisma catalogue, and a bKash Tokenized Checkout integration.

## Local setup

1. Install Node.js 20.19+ and PostgreSQL.
2. Create a PostgreSQL database named `dth`.
3. Copy `.env.example` to `.env` and set `DATABASE_URL`, `ACCESS_TOKEN_SECRET`, and `ADMIN_API_KEY`.
   Generate independent secrets with `node -e "console.log(require('node:crypto').randomBytes(48).toString('base64url'))"`.
4. Install packages and prepare the database:

   ```sh
   npm install
   npm run db:migrate
   npm run db:seed
   ```

5. Start both the Vite website and Express API:

   ```sh
   npm run dev:full
   ```

The website is available at `http://localhost:5173`. The API listens on port `3001`.

If the payment message says the API is offline, the website may be open while the API is not. Create `.env` from `.env.example`, start PostgreSQL, apply the database migration and seed the catalogue, then restart both services with `npm run dev:full`. bKash checkout also requires valid sandbox merchant credentials; without them no payment can be initiated.

## bKash and PDF delivery

The checkout uses server-side bKash credentials. Configure `BKASH_APP_KEY`, `BKASH_APP_SECRET`, `BKASH_USERNAME`, and `BKASH_PASSWORD` with merchant-issued **sandbox** credentials before testing. Keep credentials only in the server's environment; never put them in React code, `VITE_*` variables, or browser storage.

Before deploying, set `BKASH_BASE_URL` to the official live Tokenized Checkout base URL supplied by bKash, use HTTPS for `PUBLIC_API_URL` and `FRONTEND_URL`, and register the public API callback URL with the merchant account. The callback executes and queries the transaction on the server and checks its payment ID, invoice, currency, amount, and completed status before the receipt page can retrieve its Drive links.

Use the **Manage catalogue** panel with the `ADMIN_API_KEY` from the server environment to add or edit subjects and add Google Drive links. A semester pack can be purchased only after every included subject has a valid Drive link. Configure Drive files with the intended student-access permissions. Paid Drive links are excluded from public catalogue responses and require a verified purchase receipt.

Subject names and overviews in the starter catalogue are editable examples; verify them against the exact BTEB regulation before offering a paid download.

## Commands

- `npm run build` — generate Prisma Client and build the frontend.
- `npm test` — run checkout, payment verification, and protected delivery tests.
- `npm run db:studio` — open Prisma Studio.
- `npm run start` — start the API and serve the production build.

Real payment testing requires a PostgreSQL database, public HTTPS callback, and bKash merchant credentials. Those credentials are intentionally not included in this project.
# edu-fontend
