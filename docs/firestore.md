# Firestore Schema & Tooling

This project uses Firebase Authentication (Google provider) together with Firestore to persist player profiles and authorization roles.

## Environment configuration

Populate the variables in `.env.local` based on `.env.example`.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Public Firebase API key used by the web client. |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Auth domain for OAuth redirects. |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Project identifier shared by the client and server SDKs. |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Storage bucket identifier (kept for completeness). |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Messaging sender id required by the SDK. |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Client app id for Firebase initialization. |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | Optional analytics identifier. |
| `FIREBASE_PROJECT_ID` | Project id for the Admin SDK. |
| `FIREBASE_CLIENT_EMAIL` | Service account client email for the Admin SDK. |
| `FIREBASE_PRIVATE_KEY` | Private key for the service account. Escape newlines as `\\n`. |

## Collections

| Collection | Document ID | Fields | Description |
| --- | --- | --- | --- |
| `users` | Firebase Auth UID | `displayName: string`, `email: string`, `photoURL: string`, `role: "user" \| "admin"`, `coins: number`, `createdAt: Date`, `updatedAt: Date` | Stores the normalized player profile, running coin balance, and role that powers protected routes. Documents are created on first sign-in and default to the `user` role. |
| `coinClaims` | Firebase Auth UID | `totalCoins: number`, `claimed: Record<string, { fragmentId: string, coins: number, title: string, type?: string, claimedAt: Date }>` | Ledger of every reward fragment, bonus, or watch payout the player has earned. The `totalCoins` aggregate backs vault totals and Razorpay cashouts. |
| `userEngagement` | Firebase Auth UID | `dailyBonus: { lastClaimDate: string, streak: number, totalClaims: number, lastReward: number, lastClaimedAt: Date }`, `watchAndEarn: { lastWatchDate: string, watchesToday: number, totalViews: number, lastReward: number, lastWatchedAt: Date }` | Tracks daily login bonus streaks and watch-and-earn cooldown state for each player. |
| `config` | `engagement` | `dailyBonus: { baseReward: number, streakMultipliers: number[], capStreak: number }`, `watchAndEarn: { rewardPerView: number, cooldownMinutes: number, maxViewsPerDay: number }`, `updatedAt: Date` | Central configuration for engagement systems powering the daily login bonus and watch-and-earn rewards. Admin tooling can update this document to tune payouts and cooldowns. |

## Indexes

Composite indexes are stored in `firestore.indexes.json` and can be deployed with `firebase deploy --only firestore:indexes`.

| Collection | Fields | Purpose |
| --- | --- | --- |
| `users` | `role` (asc), `updatedAt` (desc) | Powers dashboards that filter admins while ordering by activity. |

## Seed script

`scripts/seed-firestore.ts` seeds baseline users for local development.

```bash
npm install
npm run seed:firestore
```

The script creates two documents:

- `users/admin-template` – admin exemplar used to validate elevated UI flows.
- `users/explorer-template` – default player profile for smoke testing protected routes.

Both documents populate the same fields defined in the collection schema. Update or extend them as needed for testing scenarios.
