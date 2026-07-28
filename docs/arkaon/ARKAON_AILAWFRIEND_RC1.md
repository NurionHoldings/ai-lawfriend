# ARKAON × AI법친 RC1

## Position
ARKAON is the platform-level operations intelligence. Existing 공부호 remains the legal-knowledge/domain intelligence and is not renamed or allowed to become an autonomous operator.

## Cycle
OBSERVE → ANALYZE → PROPOSE → HUMAN APPROVE → EXECUTE(DISABLED)

## RC1 boundaries
- advice_only: true
- L3 autonomous execution: disabled
- production deploy: denied
- legal judgment change: denied
- client-visible send: denied
- payment/settlement/account/credential operations: denied
- proposal and approval ledger: persisted in existing AuditLog

## Integration
- Adapter: `src/features/arkaon/arkaon.adapter.ts`
- Analyzer: `src/features/arkaon/arkaon.analyzer.ts`
- Policy: `src/features/arkaon/arkaon.policy.ts`
- Ledger: `src/features/arkaon/arkaon.ledger.ts`
- Service: `src/features/arkaon/arkaon.service.ts`
- Snapshot API: `POST /api/admin/arkaon/snapshot`
- Approval API: `POST /api/admin/arkaon/proposals/:proposalId/approve`

## P0 finding retained for next migration
`control-tower-brain.repository.ts` is still an in-memory Map store. It must not be treated as a production durable ledger. ARKAON RC1 deliberately does not depend on it for proposal/approval persistence.
