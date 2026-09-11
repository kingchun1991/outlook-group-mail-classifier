# Security policy

## Reporting a vulnerability

Please do not open a public issue for a suspected vulnerability. Contact the repository maintainers privately with a reproduction, affected version, and impact. Remove secrets and personal mailbox data from reports.

## Deployment guidance

- Serve the add-in over HTTPS and use a certificate trusted by the Outlook client.
- Never commit client secrets, refresh tokens, Graph bearer tokens, or mailbox content.
- Request only the `ReadWriteMailbox` permission needed by the current-item workflow.
- Validate and allow-list configured internal domains; settings are user-controlled and are not a security boundary.
- Treat Office.js and Graph responses as untrusted input and keep Graph calls scoped to the current user.
- Review Microsoft 365 consent and conditional-access policies before publishing.
