## ADDED Requirements

### Requirement: Firebase environment variables shall be configured

The system SHALL load Firebase Admin SDK credentials from environment variables (`FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`) during application initialization.

#### Scenario: Application starts with valid Firebase credentials
- **WHEN** the application starts with all required Firebase environment variables set
- **THEN** `FirebaseService.onModuleInit()` SHALL initialize Firebase Admin SDK successfully
- **AND** the API SHALL respond to requests

#### Scenario: Application fails to start without Firebase credentials
- **WHEN** any required Firebase environment variable is missing
- **THEN** `FirebaseService.onModuleInit()` SHALL throw `Error: Firebase configuration is incomplete`
- **AND** the application SHALL fail to start

### Requirement: Helper script shall load credentials from JSON

The development helper script SHALL read the Service Account JSON file and write equivalent environment variables to `.env`.

#### Scenario: Script extracts credentials successfully
- **WHEN** the script is executed with path to Service Account JSON
- **THEN** it SHALL write `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY` to `.env`
- **AND** the `FIREBASE_PRIVATE_KEY` SHALL have newlines properly escaped

#### Scenario: Script fails if JSON is invalid
- **WHEN** the script is executed with an invalid JSON file path
- **THEN** it SHALL log an error message and exit with non-zero code