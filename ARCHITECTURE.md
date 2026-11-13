# Architecture and delivery plan

## Components
- Frontend: React + TypeScript + Vite; hosted as a static GitHub Pages site.
- Identity: Nhost Auth; all staff/manager/giver accounts are provisioned by administrators.
- Data API: Nhost GraphQL / Hasura over PostgreSQL.
- Server-side operations: Nhost Functions for sensitive workflows such as creating advances, approvals, notifications and push delivery.
- File storage: Nhost Storage for employee documents, with private access policies.
- Notifications: in-app event + recipient inbox + optional Web Push delivery + delivery/read log.

## Why this is a foundation release
The UI shell and normalized database schema are provided. The actual Nhost project identifiers, Hasura permissions, server functions, notification credentials, and legacy import mapping are environment-specific and must be configured and tested before business transactions are enabled.

## Milestones
1. Foundation: upload files, install dependencies, configure Nhost, apply schema.
2. Identity and authorization: create owner account, map roles, configure row/column permissions.
3. Employee registry and assignments.
4. Advances: giver account lifecycle, secure password change, authenticated giver-to-advance mapping, approval and reversal.
5. Payroll and deductions: per-assignment payroll, explicit currencies, locked periods and reconciliation.
6. Attendance, leave and overtime: hourly IQD rate defined by management.
7. Notification center: templates, recipient resolution, in-app inbox, push opt-in, delivery retries, 404/410 cleanup and read tracking.
8. Migration rehearsal: export old data, map, import into staging, reconcile.
9. UAT and controlled activation: parallel run, sign-off, then production switch.

## Passkeys
Use Nhost Auth WebAuthn/passkey support if enabled for the selected project configuration. A passkey uses cryptographic challenge/response; the app must not request or store biometric samples. Add registration and recovery UX only after verifying the current project's Auth configuration.
