# AGENTS.md

## Commands
- `npm run dev` - Dev server on port 3000, logs to dev.log
- `npm run build` - Production build
- `npm run lint` - ESLint
- `npm run db:push` / `db:generate` / `db:migrate` / `db:reset` - Prisma

## Stack
- Next.js 16 + React 19 + TypeScript
- Tailwind CSS 4 + shadcn/ui (Radix UI)
- Prisma + SQLite
- Zustand (state), next-intl (i18n), web-push (notifications)

## Deployment
- Vercel-ready via `npm run vercel`
- SQLite read-only on Vercel; use Turso or similar for production DB
- Set env vars: `DATABASE_URL`, `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`

## Notes
- No test suite configured (no test script in package.json)
- Notifications work offline via Service Worker
- Postinstall runs `prisma generate`