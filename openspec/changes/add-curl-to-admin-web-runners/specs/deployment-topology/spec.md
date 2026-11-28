## ADDED Requirements

### Requirement: Runner images include curl for Coolify HTTP healthchecks

The system **SHALL** include `curl` in the runner stage of the Docker images for `apps/admin` and `apps/web` so that Coolify can execute HTTP healthchecks inside the container.

#### Scenario: Admin runner image contains curl

- **WHEN** the `apps/admin` Docker image is built from the runner stage
- **THEN** the `curl` binary is present in the final image
- **AND** `curl` is installed via `apk add --no-cache curl`
- **AND** `apk add` runs before `USER node` (root required)

#### Scenario: Web runner image contains curl

- **WHEN** the `apps/web` Docker image is built from the runner stage
- **THEN** the `curl` binary is present in the final image
- **AND** `curl` is installed via `apk add --no-cache curl`

#### Scenario: Admin healthcheck returns HTTP 200 on /login

- **WHEN** the `apps/admin` container is running and Coolify healthchecks `http://localhost:4321/login`
- **THEN** the response status is 200
- **AND** `curl` is used to perform the check inside the container

#### Scenario: Web healthcheck returns HTTP 200 on /

- **WHEN** the `apps/web` container is running and Coolify healthchecks `http://localhost:80/`
- **THEN** the response status is 200
- **AND** `curl` is used to perform the check inside the container

#### Scenario: Builder stage is unaffected

- **WHEN** the `apps/admin` or `apps/web` Docker image is built
- **THEN** the builder stage does not contain `curl`
- **AND** the `apps/api` Dockerfile is not modified
