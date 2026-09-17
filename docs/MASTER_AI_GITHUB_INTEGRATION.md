# Master AI — GitHub engineering read integration

Master AI can use a server-side GitHub read adapter for the existing Order King repositories. It does not grant the model arbitrary GitHub access and it does not provide write/deploy authority.

## Required environment

- `GITHUB_TOKEN`: GitHub token with the minimum repository read permissions required for the configured repositories.
- `GITHUB_OWNER`: repository owner; defaults to `Foodpalace`.

The token must be configured as a deployment secret. Never commit it, return it in tool output, or place it in client code.

## Allowed repositories

- `HDmaster`
- `roshoi-customers--orders-`
- `Roshoi-partners`
- `roshoi-riders`
- `Apps-integration-`

## Connected Master AI read tools

- `get_repository_status`
- `get_recent_commits`
- `inspect_file`
- `search_code`
- `inspect_ci`

All calls remain subject to Master AI RBAC, tenant scope, data-mode policy, tool registry risk policy and audit logging. A successful GitHub read is evidence about repository state only; it is not evidence that a deployment completed or that a code change is production-safe.

## Future write path

Repository writes, pull requests, CI reruns and deployment actions must be implemented as separately authorized tools with explicit risk classification, approval gates, idempotency and post-action verification. The read adapter intentionally does not perform writes.
