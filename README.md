# Database setup — Nhost

## Important
This is a **new-system schema**. It does not connect to, overwrite, or migrate the old Supabase project.
Do not run it in the old production database. First confirm that you are inside the new Nhost project.

## Apply the schema
1. Open the new Nhost project.
2. Open **Database → SQL Editor**.
3. Open `migrations/001_initial_schema.sql`.
4. Review it, then run it once.
5. Track the created `public` tables in Hasura/Nhost GraphQL.
6. Configure permissions before enabling the frontend.

## Required permission design
- `owner/admin`: full business access, subject to audit.
- `hr`: employee, assignments, attendance, leave workflows.
- `finance`: advances, payroll, deductions and financial reports.
- `manager`: only assigned department/team records and approvals.
- `advance_giver`: create advances only through a server-validated operation; may view only permitted own activity.
- `employee`: own profile, own payslips, own requests and own notifications.
- `auditor`: read-only approved scope.
- `public/anonymous`: no access to HR/finance tables.

Do not use a client-side role flag as authorization. Enforce access with Hasura row/column permissions and server-side functions/actions.

## Critical business rules
- Every employee may have multiple `employee_assignments`; payroll is calculated per assignment.
- Each payroll item has an explicit currency. Do not combine USD and IQD totals without a displayed conversion rate and date.
- Overtime is IQD only and uses the hourly rate approved by management. No multiplier is assumed.
- An advance must have an authenticated `created_by` and a `giver_id` resolved from the authenticated account mapping. Never accept the giver identity only from a browser-supplied UUID.
- Password changes use Nhost Auth. Do not store password hashes in business tables.
- Passkey/WebAuthn stores credential public keys and counters, not fingerprint/face data.
- Notification event data and recipient delivery/read status are separate so that multiple recipients and channels can be audited.
- Push subscription keys are private per-device data. Push dispatch and VAPID private keys belong only on the server.

## Before importing legacy data
Prepare a read-only export from the old system, map IDs and currencies, compare row counts and financial totals, then run a trial import into staging. Never import directly into the active production tables without a reconciliation report.
