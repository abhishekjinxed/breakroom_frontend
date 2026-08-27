# Breakroom moderation process

## Member tools

- Members must accept Terms of Use before community features are available.
- A member can report a Work Pulse from its overflow menu.
- A member can block another member; that member's Work Pulses are hidden.
- Members can delete their account from Account & privacy.

## Moderator setup

Set `MODERATOR_EMAILS` in Railway to one or more comma-separated Google account emails that are authorized to review reports.

## Review workflow

1. Review open reports at `GET /api/safety/moderation/reports` using a moderator's Bearer token.
2. Inspect the reported item and relevant context.
3. Remove prohibited material from Cloudinary and the database when necessary.
4. End abusive conversations, block/suspend the account as appropriate, and record the decision.
5. Resolve the report with `PATCH /api/safety/moderation/reports/:reportId` using `{ "status": "REVIEWED" }` or `{ "status": "DISMISSED" }`.
6. Escalate credible threats, exploitation, or illegal content to the appropriate authorities and preserve necessary evidence.

## Response targets

- Imminent safety risk: immediately
- Sexual content, threats, hate, harassment, or doxxing: within 24 hours
- Other reports: within 3 business days
