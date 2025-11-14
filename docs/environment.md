# Environment variables

The project reads configuration from `.env.local` (Next.js convention) and, for server-side scripts, from the ambient process environment. The following keys are required:

| Scope | Key | Description |
| --- | --- | --- |
| Client | `NEXT_PUBLIC_FIREBASE_API_KEY` | Web API key for the Firebase project |
| Client | `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Auth domain, usually `<project>.firebaseapp.com` |
| Client | `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID used by the client SDK |
| Client | `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Storage bucket name |
| Client | `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Sender ID for Cloud Messaging |
| Client | `NEXT_PUBLIC_FIREBASE_APP_ID` | Client app ID |
| Client (optional) | `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | Analytics measurement ID if enabled |
| Server | `FIREBASE_PROJECT_ID` | Project ID for the Admin SDK |
| Server | `FIREBASE_CLIENT_EMAIL` | Service account client email |
| Server | `FIREBASE_PRIVATE_KEY` | Service account private key (replace literal `\n` with real newlines) |
| Optional | `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Public Razorpay key for the payment demo |
| Optional | `RAZORPAY_KEY_ID` | Server-side Razorpay key ID |
| Optional | `RAZORPAY_KEY_SECRET` | Razorpay secret used by the API route |

### Local seeding & CI automation

- Provide `GOOGLE_APPLICATION_CREDENTIALS` pointing to a service-account JSON file before running `npm run seed:firestore`.
- When running inside CI, export the Firebase admin credentials as environment variables or use a secrets manager to materialise the `.env.local` file prior to the build step.
