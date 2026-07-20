## ADDED Requirements

### Requirement: Firebase Admin SDK configuration
The system SHALL provide a singleton Firebase Admin SDK instance initialized with service account credentials from environment variables.

#### Scenario: Firebase App initialization on module load
- **WHEN** the Firebase module initializes during application startup
- **THEN** it reads `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY` from environment
- **AND** initializes Firebase Admin App with those credentials
- **AND** exports Firestore database instance and Auth instance

#### Scenario: Firebase credentials missing
- **WHEN** any required Firebase environment variable is missing
- **THEN** the application SHALL throw an error during startup with message "Firebase configuration is incomplete"

### Requirement: Firebase service availability
The system SHALL verify Firebase connectivity on startup via health check endpoint.

#### Scenario: Health check includes Firebase status
- **WHEN** GET /api/v1/health is called
- **THEN** the response includes `firebase.status` field with value "connected" or "disconnected"
- **AND** if disconnected, includes `firebase.error` with reason

### Requirement: Secure credential handling
The system SHALL never log or expose Firebase credentials.

#### Scenario: Credentials not in logs
- **WHEN** Firebase initializes or errors occur
- **THEN** no credential values (private key, client email) appear in logs
- **AND** error messages reference configuration keys, not values