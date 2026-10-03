# Loopdesk (Next.js + Tailwind)
Run: `npm install` then `npm run dev`, open http://localhost:3000
Deploy: push to GitHub and import into Vercel.

- `app/` routes (one folder per page) · `components/` reusable UI · `lib/content.ts` all copy and pricing data
- Forms validate client-side only. Next step: API routes + database + auth + Stripe test mode.
- All customers, reviews and quotes are sample content. Replace `[Your Name]` in `components/Footer.tsx`.

## Backend setup (Step 1: auth)
1. Create a free Postgres database (neon.tech or supabase.com) and copy its connection string.
2. `cp .env.example .env` and fill in `DATABASE_URL` and `JWT_SECRET` (`openssl rand -base64 32`).
3. `npx prisma migrate dev --name init` creates the User table and generates the Prisma client.
4. `npm run dev`, then sign up at /signup. You should land on /dashboard.
