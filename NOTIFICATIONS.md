# Notification specification

Each notification event should capture:
- Event type and unique event reference
- Title and full detail body
- Employee / business entity affected
- Actor (the user who performed the action)
- Amount and currency where relevant
- Status and reason
- Created/sent timestamps and action URL
- Recipient-specific in-app state (unread/read/archived)
- Recipient-specific push state (queued/sent/failed/expired)
- Failure reason and delivery timestamp

## Event families
Advances created/approved/rejected/cancelled; payroll prepared/approved/paid; deductions created/approved/rejected/applied; attendance exceptions; overtime submitted/approved/rejected; leave requested/approved/rejected; account/security events; role and permission changes.

## Delivery rules
- Resolve recipients by role and organizational scope on the server.
- Create one notification event and separate recipient rows.
- In-app notifications do not depend on browser push permission.
- Push is sent only to devices with explicit browser permission and an active subscription.
- Never include passwords, passkeys, national IDs, or unnecessary private employee data in push text.
- Retry transient failures; deactivate expired subscriptions after HTTP 404/410.
- Do not send duplicate notifications for the same business event.
