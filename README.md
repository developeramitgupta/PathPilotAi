# PathPilot AI

An Indian student guidance platform connecting students, institutions, and industry.

## Project structure

```text
PathPilotAI/
├── frontend/       Next.js web application, pages, components, API routes, and UI state
├── backend/        Database schema, Supabase migrations, official-data seeds, and datasets
├── docs/           Product requirements, roadmap, API, and database documentation
├── model-server/   Reserved boundary for future dedicated AI/model services
├── training/       Reserved for approved model-evaluation and training assets
├── .env.example    Environment-variable template
└── README.md       Workspace guide
```

## Run locally

```bash
npm --prefix frontend install
copy .env.example .env.local
npm run dev
```

The root commands are simple shortcuts for the frontend application. For a Vercel deployment, set the project’s **Root Directory** to `frontend`.

## Useful commands

```bash
npm run dev
npm run check
npm run db:generate
npm run db:seed:official
```

See [frontend/README.md](./frontend/README.md) for application details and [backend/README.md](./backend/README.md) for data and database operations.
