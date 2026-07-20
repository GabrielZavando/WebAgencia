## Context

The NestJS API uses Firebase Admin SDK for authentication (JWT verification via Firebase Auth) and Firestore for data persistence. The `FirebaseService` initializes on module startup via `onModuleInit()`, requiring three environment variables:

- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`

These credentials come from a Firebase Service Account. The JSON file (`api-web-agencia-firebase-admin.json`) is already present in the project root, but the environment variables are not configured in `.env`.

## Goals / Non-Goals

**Goals:**
- Add required Firebase environment variables to `.env` so the API starts successfully
- Document the correct configuration in `.env.example`
- Provide a development helper script to load credentials from the JSON file

**Non-Goals:**
- Modifying `FirebaseService` implementation (it already handles credentials correctly)
- Changing Firebase project or creating new credentials
- Implementing different credential loading strategies for production

## Decisions

### 1. Credentials via environment variables (not JSON file path)

**Decision:** Use `.env` variables directly.

**Rationale:** This follows the 12-factor app methodology. The Service Account JSON is only used as a reference to extract values for `.env`.

**Alternative considered:** Load credentials directly from the JSON file at runtime using `GOOGLE_APPLICATION_CREDENTIALS` env var pointing to the JSON path. Rejected because:
- Requires changing `FirebaseService.initializeFirebase()` to support this mode
- Adds complexity to a service that already works with env vars
- Inconsistent with how other credentials (database URL) are handled in this project

### 2. Helper script for local development

**Decision:** Create `scripts/load-firebase-env.ts` to populate `.env` from the JSON file.

**Rationale:** Reduces friction for new developers. One command extracts credentials from the JSON and writes to `.env`.

**Alternative considered:** Require manual copy-paste. Rejected because error-prone and poor developer experience.

## Risks / Trade-offs

- **[Risk]** Private key in `.env` file is a secret. → **Mitigation**: `.env` is in `.gitignore`. Never commit it. The `.env.example` contains only placeholder values.
- **[Risk]** JSON file has newlines as literal `\n`. → **Mitigation**: The `load-firebase-env.ts` script handles escaping when writing to `.env`.

## Migration Plan

1. Add variables to `.env` (manual or via script)
2. Verify API starts: `npm run start:dev`
3. Test `/api/v1/health` endpoint
4. Commit changes to `.env.example` and script

## Open Questions

- None — credentials format and service account JSON are confirmed valid.