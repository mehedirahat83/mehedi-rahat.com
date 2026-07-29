# mehedi-rahat.com

The Next.js application for mehedirahat.com, prepared for a standard Node.js
deployment on a Hostinger VPS.

## Requirements

- Node.js 22
- pnpm 11
- PostgreSQL 15 or newer

## Local development

```bash
pnpm install
copy .env.example .env.local
pnpm dev
```

Open `http://localhost:3000`.

## Environment variables

Copy `.env.example` to `.env.local` for development. Configure the same values
in the VPS process manager for production.

- `DATABASE_URL`: PostgreSQL connection string
- `DATABASE_SSL`: set to `true` only when the database provider requires SSL
- `ADMIN_EMAIL`: administrator login email
- `ADMIN_PASSWORD`: administrator login password
- `ADMIN_SESSION_SECRET`: long random signing secret
- `RESEND_API_KEY`: optional Resend API key
- `ENQUIRY_NOTIFICATION_EMAIL`: enquiry notification recipient
- `ENQUIRY_FROM_EMAIL`: verified sender for enquiry email
- `ORDER_FROM_EMAIL`: verified sender for order email

Do not commit `.env.local` or production secrets.

## Database

Generate a migration after schema changes:

```bash
pnpm db:generate
```

Apply committed migrations to the configured PostgreSQL database:

```bash
pnpm db:migrate
```

The initial Hostinger/PostgreSQL schema is in
`drizzle/0000_demonic_justin_hammer.sql`.

## Validation

```bash
pnpm check
pnpm audit --prod
```

## Production

Create the standalone production build:

```bash
pnpm build
```

For a regular Node deployment:

```bash
pnpm start
```

For the smaller standalone artifact, copy `.next/standalone`, `.next/static`,
and `public` to the VPS release directory and run:

```bash
node server.js
```

Put Nginx in front of the Node process and run the app with a process manager
such as systemd or PM2. Set `HOSTNAME=127.0.0.1` and the chosen internal `PORT`
in the production service.
