# Roshoi Core – Improvement Log

## 2026-09-09

### Done
- Added professional README.md
- Added ARCHITECTURE.md
- Locked core principles and domain ownership
- Added clean domain barrel export (`src/lib/roshoi/index.ts`)
- Started structured improvement tracking

### Next Priority
1. Strengthen order state machine usage across the app
2. Improve finance / settlement safety
3. Clean API surface under /v1
4. Prepare clean connection points for Customer / Partner / Rider apps
5. Remove any remaining simulated-only hardcoding where safe

### Rules
- Never break existing working domain logic
- Money always stays in integer paise
- Audit logs remain append-only
- Prefer small, correct changes over large rewrites
