## Context

Coolify manages deployment of three applications on a VPS: `web` (Static Site, nginx), `admin` (Web Application Node, @astrojs/node SSR), and `api` (Web Application Nixpacks). Coolify executes HTTP healthchecks against each container. The runner images for `admin` (`node:26-alpine`) and `web` (`nginx:alpine`) do not include `curl`, so Coolify's HTTP healthcheck cannot run inside the container and fails. The `api` service is unaffected because Coolify builds it via Nixpacks, not a custom Dockerfile.

Both Dockerfiles use multi-stage builds with a dedicated `runner` stage. The `builder` and `deps-prod` stages must remain unchanged. The change is constrained to the runner stage only, using `apk add --no-cache curl` on Alpine-based images.

## Goals / Non-Goals

**Goals:**
- Install `curl` in the runner stage of `apps/admin/Dockerfile` so Coolify can run HTTP healthchecks.
- Install `curl` in the runner stage of `apps/web/Dockerfile` so Coolify can run HTTP healthchecks.
- Preserve the existing multi-stage pattern; do not rewrite either Dockerfile from scratch.
- Do not modify `apps/api/Dockerfile` (already works).
- Keep image size impact minimal (~1–2 MB per image via `--no-cache`).

**Non-Goals:**
- Do NOT add `ca-certificates` (healthcheck is HTTP to localhost, not HTTPS).
- Do NOT install curl in builder or deps-prod stages.
- Do NOT add a Docker `HEALTHCHECK` instruction (Coolify manages its own healthcheck).
- Do NOT change Coolify configuration (out of scope for this change).

## Decisions

### D1: Install curl via `apk add --no-cache curl` in runner stage only (chosen)

Alternative B (Coolify TCP healthcheck, no Dockerfile change) was rejected because it only confirms the port is open, not that the application returns HTTP 200, and it requires a Coolify config change outside this change's scope.

Alternative C (Docker `HEALTHCHECK` instruction + curl) was rejected because it duplicates Coolify's healthcheck and adds complexity without benefit if Coolify already pings externally.

Alternative D (shared base image with curl) was rejected as over-engineered for a single package and would require maintaining custom base images.

Rationale: Option A is the minimal, pattern-faithful change (~2 lines per Dockerfile), keeps builder untouched, and satisfies the user's constraints.

### D2: Admin — place `RUN apk add --no-cache curl` before `USER node`

The runner stage ends with `USER node` (line 107 of admin/Dockerfile). `apk add` requires root, so the curl installation must occur before the user switch. Placing it after the `COPY` instructions and before `USER node` preserves the non-root runtime user.

### D3: Web — place `RUN apk add --no-cache curl` in the runner stage

The web runner (`nginx:alpine`) runs as root by default, so `apk add` can be placed anywhere in the runner stage. It will go after the `COPY` instructions and before `EXPOSE`.

### D4: Healthcheck paths

- Admin: `/login` (returns 200; `/` returns 302 redirect, which Coolify would treat as failure).
- Web: `/` (nginx serves static HTML, returns 200).

### D5: No `ca-certificates`

Since the healthcheck targets `localhost` over HTTP, `ca-certificates` is unnecessary and would add ~1–2 MB without benefit.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| curl adds a small attack surface to the runtime image | Minimal package, runner-only, `--no-cache`; acceptable trade-off for healthcheck capability |
| Admin `RUN apk add` placed after `USER node` would fail (needs root) | Pin placement before `USER node`; verify during build |
| Image size increase (~1–2 MB per image) | `--no-cache` avoids apk cache layer; impact is negligible relative to base images |
| Future HTTPS healthcheck would need `ca-certificates` | Documented as a known limitation; revisit if Coolify switches to HTTPS |

## Migration Plan

1. Build both images locally and confirm `curl` exists in the runner layer.
2. Run each container and verify HTTP 200 on admin `/login` and web `/`.
3. Deploy to Coolify staging; confirm healthchecks pass.
4. Rollback: revert the two `RUN apk add` lines if healthchecks fail.

## Open Questions

None. All user-specified constraints (admin path `/login`, web path `/`, no `ca-certificates`, TDD inspection tests) are captured in tasks.md.
