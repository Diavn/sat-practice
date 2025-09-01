# Digital SAT Practice Platform (RW + Math) — Next.js + Prisma

A minimal, production-ready starter for creating a Digital SAT practice site similar to popular platforms. It supports:
- Reading & Writing (2×32 min) and Math (2×35 min) sections with timers
- Passage viewer, question player, MC & SPR questions
- Review with correct answers + explanations
- Admin panel to import tests in JSON
- SQLite (dev) / Postgres (prod) via Prisma
- JWT auth with simple admin login

## Quick Start

1) **Clone & install**
```bash
npm install
```

2) **Configure env**
Copy `.env.example` to `.env` and set strong values:
```
DATABASE_URL="file:./dev.db"
JWT_SECRET="a-very-long-random-string"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="ChangeMe123!"
```

3) **Database & seed**
```bash
npx prisma db push
npm run seed
```

4) **Run**
```bash
npm run dev
```

Visit:
- `/` — Home
- `/practice/rw` — Reading & Writing sections
- `/practice/math` — Math sections
- `/login` — Admin login (use seeded credentials)
- `/admin` — Import tests, list exams
- `/exams/:id` — Open an exam and jump into a section

## Import JSON (Admin)

Paste JSON like:
```json
{
  "exam": { "code": "MAY-2025-PT1", "title": "May 2025 Practice Test 1" },
  "sections": [
    { "type": "RW", "order": 1, "title": "RW Module 1", "module": 1, "timerSeconds": 1920 },
    { "type": "MATH", "order": 2, "title": "Math Module 1", "module": 1, "timerSeconds": 2100 }
  ],
  "passages": [
    { "sectionOrder": 1, "title": "Science passage", "text": "..." }
  ],
  "questions": [
    {
      "sectionOrder": 1,
      "number": 1,
      "prompt": "The passage suggests ...?",
      "type": "MC",
      "correctAnswer": "B",
      "choices": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" },
      "passageIndex": 1,
      "skill": "Information & Ideas",
      "difficulty": "Medium"
    },
    {
      "sectionOrder": 2,
      "number": 1,
      "prompt": "Solve 2x + 5 = 17",
      "type": "SPR",
      "correctAnswer": "6",
      "explanation": "2x=12 => x=6",
      "skill": "Linear equations",
      "calculatorAllowed": true
    }
  ]
}
```

## Notes

- Timers aligned with College Board's public specs (RW 54 Q in 64 min; Math 44 Q in 70 min — two modules each). See official structure pages.
- Scaled scoring varies per form; this starter reports raw correctness and per-question feedback. You can plug your own curves per exam later.
- Authentication is minimal for demo. For production, consider NextAuth, rate limiting, CSRF, and HTTPS everywhere.

## Deploy

Works well on Vercel with a managed Postgres (Neon/Supabase). Set `DATABASE_URL` to Postgres and run `prisma migrate deploy`. Seed once.

## Roadmap Ideas

- Adaptive second-module routing within a practice set
- Skill tagging and analytics dashboards
- CSV import wizard and Bluebook-style interface
- Student accounts and class/coach dashboards
