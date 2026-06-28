## Why

The API fails to start with `Firebase configuration is incomplete` error because the `.env` file lacks the required Firebase environment variables. The Service Account JSON file (`api-web-agencia-firebase-admin.json`) exists at the project root, but its credentials are not configured in the environment.

## What Changes

- Add `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY` to `.env`
- Update `.env.example` with correct Firebase configuration template
- Create `scripts/load-firebase-env.ts` to optionally load credentials from the Service Account JSON file for local development

## Capabilities

### New Capabilities
- `firebase-env-config`: Configuration management for Firebase Admin SDK credentials in development and production environments

### Modified Capabilities
- (none — existing Firebase integration code is correct, only environment setup is missing)

## Impact

- **Configuration**: `.env` and `.env.example` files
- **Scripts**: New development helper script
- **Documentation**: README.md may need updated setup instructions