# Vercel deployment pipeline

1. **Create the project**
   - Connect the GitHub repository in the Vercel dashboard and select the `main` branch.
   - Set the framework preset to **Next.js** and keep the default build command (`npm run build`) and output directory (`.next`).

2. **Configure environment variables**
   - Populate the keys listed in [../environment.md](../environment.md) under the *Production* scope.
   - Use Vercel’s *Preview* environment to duplicate the same keys for branch deploys.

3. **Install build caching**
   - Leave “Automatic” caching enabled so that Next.js incremental artifacts are reused between builds.

4. **Secrets & service accounts**
   - Store `FIREBASE_PRIVATE_KEY` as a Vercel secret (`vercel env add`) to avoid multiline formatting issues.
   - If Firestore seeding should run after deploys, add a Vercel build hook that executes `npm run seed:firestore` in a GitHub Actions workflow with `GOOGLE_APPLICATION_CREDENTIALS` pointing to an injected service account file.

5. **Preview checks**
   - Enable Vercel GitHub checks so accessibility reports and unit tests must pass before merging.
   - Configure branch protections in GitHub to require the `npm run test` job.

6. **Post-deploy verification**
   - Run the Lighthouse workflow described in [../audits.md](../audits.md) against the production URL.
   - Validate responsive behaviour using the Vercel preview device toolbar.
