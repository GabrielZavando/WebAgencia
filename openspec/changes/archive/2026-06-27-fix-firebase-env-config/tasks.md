## 1. Configure Firebase Environment Variables

- [x] 1.1 Add `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY` to `.env` using values from `api-web-agencia-firebase-admin.json`
- [x] 1.2 Update `.env.example` with Firebase configuration template (placeholder values)

## 2. Create Development Helper Script

- [x] 2.1 Create `scripts/load-firebase-env.ts` to read Service Account JSON and write credentials to `.env`
- [x] 2.2 Add execute permission and verify script works with the existing JSON file

## 3. Configure Dotenv Loading (discovered during implementation)

- [x] 3.1 Add `dotenv.config({ path: '.env' })` to `src/main.ts` to load environment variables at startup