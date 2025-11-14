# Gamy Ludo

A Next.js 14 App Router starter forged for vibrant, game-inspired interfaces. It ships with TypeScript, Tailwind CSS, shadcn/ui tokens, and Framer Motion powered interactions.

## Getting started

1. Duplicate `.env.example` to `.env.local` and populate the Firebase and optional Razorpay keys listed in [docs/environment.md](docs/environment.md).
2. Install dependencies and launch the development server:

   ```bash
   npm install
   npm run dev
   ```

3. Visit [http://localhost:3000](http://localhost:3000) to explore the luminous dashboard shell.

Run the domain tests at any time with:

```bash
npm run test
```

## Tech highlights

- ⚡️ Next.js 14 with the App Router and strict TypeScript setup
- 🎨 Tailwind CSS configured for class-based dark mode and custom neon theme tokens
- 🧩 shadcn/ui conventions with reusable primitives (glass cards, gradient buttons, progress rings)
- 🎬 Framer Motion animation provider and motion-ready components out of the box
- 🌓 next-themes powered theme toggle with persisted light/dark preference

## Firebase integration

- 🔐 Firebase Authentication with Google sign-in, role-aware auth context, and protected routes
- 🔥 Firestore profile persistence wired for both client and Admin SDKs with environment-based configuration
- 🧪 Seeding and index documentation lives in [`docs/firestore.md`](docs/firestore.md) alongside the [`firestore.indexes.json`](firestore.indexes.json) manifest

## Deployment & operations

- 🚀 Follow the [Vercel pipeline guide](docs/deployment/vercel.md) for production deployment, preview environments, and required build settings
- 🔑 Reference [docs/environment.md](docs/environment.md) for every environment variable consumed across the app, including Firebase admin credentials and optional Razorpay keys
- 🌱 Seed Firestore locally or in CI with `npm run seed:firestore` after authenticating via `GOOGLE_APPLICATION_CREDENTIALS` as described in [docs/firestore.md](docs/firestore.md)
- ♿️ Accessibility and responsiveness audit steps, including Lighthouse CLI usage and keyboard/screen reader verification, are captured in [docs/audits.md](docs/audits.md)
