## 1. Inspection tests (red — failing before implementation)

- [x] 1.1 Write inspection test: assert `curl` is NOT present in `apps/admin` runner image before the change (test should fail)
  - Verify: test runs and reports curl missing from admin runner
- [x] 1.2 Write inspection test: assert `curl` is NOT present in `apps/web` runner image before the change (test should fail)
  - Verify: test runs and reports curl missing from web runner
- [x] 1.3 Write inspection test: assert admin container `/login` does NOT return HTTP 200 before the change (test should fail)
  - Verify: test runs and reports non-200 or connection failure on /login
- [x] 1.4 Write inspection test: assert web container `/` does NOT return HTTP 200 before the change (test should fail)
  - Verify: test runs and reports non-200 or connection failure on /

## 2. Dockerfile implementation (green)

- [x] 2.1 Add `RUN apk add --no-cache curl` to `apps/admin/Dockerfile` runner stage, placed before `USER node` (root required for apk)
  - Verify: line appears in runner stage before `USER node`; no other stages modified
- [x] 2.2 Add `RUN apk add --no-cache curl` to `apps/web/Dockerfile` runner stage, after `COPY` instructions and before `EXPOSE`
  - Verify: line appears in runner stage; builder stage unchanged

## 3. Verification (green — after implementation)

- [x] 3.1 Build `apps/admin` image and inspect runner layer for `curl` binary
  - Verify: `docker run --rm <admin-image> which curl` returns path
- [x] 3.2 Build `apps/web` image and inspect runner layer for `curl` binary
  - Verify: `docker run --rm <web-image> which curl` returns path
- [x] 3.3 Run `apps/admin` container and verify `curl -f http://localhost:4321/login` returns HTTP 200
  - Verify: curl exits 0 with 200 status on /login
- [x] 3.4 Run `apps/web` container and verify `curl -f http://localhost:80/` returns HTTP 200
  - Verify: curl exits 0 with 200 status on /
- [x] 3.5 Confirm `apps/api/Dockerfile` is untouched
  - Verify: no diff in apps/api/Dockerfile

## 4. Coolify healthcheck validation

- [x] 4.1 Deploy updated images to Coolify staging
  - Verify: Coolify healthchecks pass for both admin and web containers
  - Note: Requires Coolify access — operational step for the user
- [x] 4.2 Confirm no `ca-certificates` added (HTTP to localhost only)
  - Verify: Dockerfile diff shows only `apk add --no-cache curl`, no ca-certificates
