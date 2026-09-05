# PathPilot AI

An Indian student guidance platform connecting students, institutions, and industry.

## Project structure

```text
PathPilotAI/
├── app/            The full PathPilot web app: pages, UI, API routes, and product logic
├── database/       Database migrations, Supabase configuration, import scripts, and verified datasets
├── docs/           Product requirements, architecture notes, and implementation guides
├── .env.example    Environment-variable template
└── README.md       Workspace guide
```

## Run locally

```bash
npm --prefix app install
copy .env.example .env.local
npm run dev
```

The root commands are shortcuts for the PathPilot app. For a Vercel deployment, set the project’s **Root Directory** to `app`.

## Useful commands

```bash
npm run dev
npm run check
npm run db:generate
npm run db:seed:official
```

See [app/README.md](./app/README.md) for product code and [database/README.md](./database/README.md) for database and verified-data operations.
