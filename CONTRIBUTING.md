# Contributing to Roshoi Core

This repository is the **Integration Core + Admin Command Center**.

## Rules

1. Do not break the order state machine.
2. Money must always stay in integer paise.
3. Audit logs are append-only. Never update or delete them.
4. Prefer small, correct changes.
5. Keep domain logic inside `src/lib/roshoi/`.
6. Do not introduce floating-point money calculations.
7. Maintain organization-scoped multi-tenancy.

## Before Making Changes

- Read `ARCHITECTURE.md`
- Read `IMPROVEMENT_LOG.md`
- Understand the existing state machine and ledger design

## Priority Areas

1. Stability of core domain
2. Clean API surface
3. Safe connection points for the three frontend apps
4. Correctness over new features

Protect the core.
