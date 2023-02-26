# Create T3 App (extended)

This is an extended version of the [T3 Stack](https://create.t3.gg/) project bootstrapped with `create-t3-app` that includes:

- UI Components using [shadcn/ui](https://ui.shadcn.com) - which is built on top of [Radix UI](https://radix-ui.com) & [Tailwind CSS](https://tailwindcss.com)
- Full-Stack CRUD example with tRPC mutations (protected routes) using the UI components together with [react-hook-form](https://react-hook-form.com).
- E2E Testing using [Playwright](https://playwright.dev)
- Integration tests using [Vitest](https://vitest.dev).
- Docker Compose setup for local database
- [`@next/font`] for optimized fonts

[Try it out now!](https://t3-complete.vercel.app)

## Getting Started

1. Install deps

```bash
pnpm install
```

2. Start the db

```bash
docker compose up -d
```

3. Update env and push the schema to the db

```bash
cp .env.example .env
pnpm prisma db push
```

4. Start the dev server

```bash
pnpm dev
```

5. Run the tests

```bash
pnpm test
```

---

This is a [T3 Stack](https://create.t3.gg/) project bootstrapped with `create-t3-app`.

## What's next? How do I make an app with this?

We try to keep this project as simple as possible, so you can start with just the scaffolding we set up for you, and add additional things later when they become necessary.

If you are not familiar with the different technologies used in this project, please refer to the respective docs. If you still are in the wind, please join our [Discord](https://t3.gg/discord) and ask for help.

- [Next.js](https://nextjs.org)
- [NextAuth.js](https://next-auth.js.org)
- [Prisma](https://prisma.io)
- [Tailwind CSS](https://tailwindcss.com)
- [tRPC](https://trpc.io)

## Learn More

To learn more about the [T3 Stack](https://create.t3.gg/), take a look at the following resources:

- [Documentation](https://create.t3.gg/)
- [Learn the T3 Stack](https://create.t3.gg/en/faq#what-learning-resources-are-currently-available) — Check out these awesome tutorials

You can check out the [create-t3-app GitHub repository](https://github.com/t3-oss/create-t3-app) — your feedback and contributions are welcome!

## How do I deploy this?

Follow our deployment guides for [Vercel](https://create.t3.gg/en/deployment/vercel), [Netlify](https://create.t3.gg/en/deployment/netlify) and [Docker](https://create.t3.gg/en/deployment/docker) for more information.
