## Why

Coolify HTTP healthchecks fail on the `admin` and `web` containers because their runner images (`node:26-alpine` and `nginx:alpine`) do not include `curl`. Without `curl` inside the container, Coolify cannot execute an HTTP healthcheck against the running service. The `api` service is unaffected because it is deployed via Nixpacks, not these Dockerfiles.

## What Changes

- Add `RUN apk add --no-cache curl` to the runner stage of `apps/admin/Dockerfile` (before `USER node`, since `apk` requires root).
- Add `RUN apk add --no-cache curl` to the runner stage of `apps/web/Dockerfile`.
- Add a delta requirement to the `deployment-topology` capability spec: runner images SHALL include `curl` for healthchecks, with WHEN/THEN scenarios for admin (`/login` → 200) and web (`/` → 200).
- No changes to `apps/api/Dockerfile`, no builder changes, no image rewrites.

## Capabilities

### New Capabilities

(None)

### Modified Capabilities

- `deployment-topology`: adds a healthcheck-curl requirement (runner images SHALL include `curl`) with scenarios verifying `curl` presence and HTTP 200 responses from admin and web containers.

## Impact

- `apps/admin/Dockerfile`: runner stage gains one `RUN apk add --no-cache curl` line; image size grows ~1–2 MB.
- `apps/web/Dockerfile`: runner stage gains one `RUN apk add --no-cache curl` line; image size grows ~1–2 MB.
- `openspec/specs/deployment-topology/spec.md`: delta spec addition for healthcheck/curl requirement.
- `apps/api/Dockerfile`: untouched (already works).
- No new dependencies, no runtime behavior changes, no breaking changes.
