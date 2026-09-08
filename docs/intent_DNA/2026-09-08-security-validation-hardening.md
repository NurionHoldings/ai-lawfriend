# intent_DNA — security and validation hardening

Date: 2026-09-08

## Intent and evidence

- `claim-next` compared an absent request header to an absent `INTERNAL_WORKER_KEY`, allowing an unintended `undefined === undefined` authorization path. The route now requires both values and compares SHA-256 digests with `timingSafeEqual`.
- Public illegal-lending, jeonse-damage, and wage-claim report routes generated bearer upload tokens and stored them directly. The existing form contract needs the raw token once after report creation, while attachments exist only for illegal-lending and jeonse-damage.
- Public attachment routes accepted unbounded form text and exposed raw storage errors in their response body. Existing report schemas already enforce report-field limits.
- `npm test` collected server modules under jsdom, where the Next `server-only` runtime sentinel throws before test collection.
- `tsc` failures were stale test fixtures caused by Zod defaulted input/output type confusion, incomplete UI mocks, and assumptions that JSON values are objects. Production validation schemas remain the enforcement point.

## Implemented scope

- Fail closed when the worker secret or header is absent and use constant-time digest comparison; regression tests cover absent, matching, and mismatching keys.
- Store SHA-256 upload-token digests for newly created public reports. Attachment verification is timing-safe, expires at `createdAt + 24h`, and accepts legacy plaintext tokens only in that same window. No schema migration is required.
- Preserve the one-time raw-token response required by the existing attachment UI. It is not selected back from persistence and is not logged.
- Bound attachment token/memo/uploader fields, reject overlong filenames, unsupported MIME types, and oversize files before storage. Server failures return a generic message.
- Keep proxy IP behavior unchanged because deployment proxy trust was not established.
- Alias `server-only` only in Vitest; Next production behavior is unchanged.
- Add PostgreSQL services plus health checks to both CI jobs. No migration or external database call was added.
- Realign the Phase 15F static verifier with the canonical Phase 20 external-message adapter where attachment metadata is now enforced.
- Preserve the sealed Phase 15F compatibility marker while the runtime enforcement remains in Phase 20, preventing older predeploy gates from rejecting the current architecture.
- Realign the Client Collaboration master gate's attachment and message-log evidence with their canonical Phase 20 adapter and log services.
- Repair stale test fixtures through builder-boundary Zod normalization and accurate fixture values; required review/source fields remain schema validated.

## Verification

- `npx tsc --noEmit` passes.
- Targeted claim/token/external-messaging and affected legal-strategy suites pass (13 files, 116 tests).
- `npm run lint` passes (existing warnings only).
- Full `npm test -- --silent --reporter=dot` passes: 469 files and 1,879 tests.
- `npm run verify:canonical-sources` reaches an environment-level `tsx` Unix-socket `EPERM`; the same script run without the `tsx` CLI IPC daemon (`node --import tsx scripts/verify-canonical-sources.ts`) passes and confirms the canonical Prisma schema and case-status definition files exist.

## Deferred / risks

- `npm audit` was not run: this execution environment blocked transmitting the private dependency tree to the public npm registry. No package or lockfile change was made without an approved compatible advisory result.
- No database migration was created. Token expiry is derived from `createdAt`; a future explicit migration may add a dedicated expiry/revocation column if operational requirements demand it.
- No proxy-IP trust-model change, durable AI metering, database encryption migration, external live messaging, or production migration was attempted.
