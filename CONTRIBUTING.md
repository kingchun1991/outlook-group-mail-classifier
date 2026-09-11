# Contributing

## Workflow

1. Create a focused branch.
2. Run `npm install`, then `npm test`, `npm run lint`, and `npm run build`.
3. Keep TypeScript strict and avoid adding permissions or dependencies without documenting the reason.
4. Add or update unit tests for classification and service behavior.
5. Open a pull request with a concise summary and testing notes.

## Style

Use existing TypeScript patterns, explicit return types for public APIs, ASCII text where practical, and comments only where Office client behavior needs explanation. Do not include mailbox data or credentials in logs, tests, screenshots, or commits.
