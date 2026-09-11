# Group Mail Classifier for Outlook

MIT-licensed Outlook add-in that classifies the current message according to whether a configured group address appears in **To** or **Cc**, then applies a category and optionally moves the message to a configured folder.

## Features

- Exact `TO_ONLY`, `TO_INCLUDED`, `CC_ONLY`, `CC_INCLUDED`, and `NONE` classification.
- Fluent UI task pane with subject/message metadata, recipient counts, classification, categories, current folder, and routing decision.
- Roaming settings for multiple group email rules and four folder mappings per rule.
- Categories: `GMC-TO-ONLY` (red), `GMC-TO` (orange), `GMC-CC-ONLY` (blue), `GMC-CC` (green).
- Manual refresh/apply flow for clients without event-based activation.
- Office.js category and move operations, plus Microsoft Graph folder lookup/creation and message update abstractions.
- Strict TypeScript, Jest tests, ESLint, webpack, and a sideloadable manifest.

## Classification rules

| Classification | Condition                                                                 |
| -------------- | ------------------------------------------------------------------------- |
| `TO_ONLY`      | Group exists in To, To has only the group, and Cc is empty                |
| `TO_INCLUDED`  | Group exists in To and either To has another recipient or Cc is non-empty |
| `CC_ONLY`      | Group exists in Cc, Cc has only the group, and group is not in To         |
| `CC_INCLUDED`  | Group exists in Cc with another Cc recipient, and group is not in To      |
| `NONE`         | Group does not exist in To or Cc                                          |

## Prerequisites

- Node.js 18 or newer and npm.
- Microsoft 365 Outlook or Outlook on the web with Exchange Online.
- Outlook Mailbox requirement set 1.5+ for the manifest baseline.
- An HTTPS development host. `https://localhost:3000` is suitable with Office add-in development certificates.
- For Graph operations, an Entra ID app registration and delegated `Mail.Read`, `Mail.ReadWrite`, and `MailboxSettings.ReadWrite` permissions with admin consent as required by tenant policy.

## Development

```bash
npm install
npm start
npm run build
npm run lint
npm run test
```

The development server serves the task pane, settings page, command page, assets, and `manifest.xml` on port 3000. The repository does not commit certificates; install the Office add-in development certificate for your platform or use a trusted HTTPS tunnel.

# GitHub Pages Deployment

1. Enable GitHub Pages in the repository settings and select **GitHub Actions** as the source.
2. Configure GitHub Actions permissions to allow Pages deployments.
3. Push to `main`.
4. Wait for the **Deploy GitHub Pages** workflow to finish.

The workflow runs `npm ci`, builds the site, and publishes `dist` to GitHub Pages.

# GitHub Pages Health Check

The homepage automatically checks these endpoints and displays whether each is reachable:

- `taskpane.html`
- `settings.html`
- `commands.html`
- `manifest.xml`

# Public Repository Notice

This is a public website. Do not commit:

- credentials
- tokens
- secrets
- tenant identifiers
- mailbox data

# Personal Deployment Recommendation

For a personal deployment:

1. Fork this repository.
2. Use a personal GitHub Pages site.
3. Maintain private configuration.
4. Deploy under your own GitHub account.

## Sideloading

1. Start the server with `npm start`.
2. Ensure `manifest.xml` URLs resolve from the Outlook client. Replace the localhost host with your trusted HTTPS host if needed.
3. In OWA: open **Settings > Mail > Customize actions > Manage add-ins** (or **Get Add-ins > My add-ins > Add a custom add-in > Add from file**) and upload `manifest.xml`.
4. In New Outlook for Windows: open **More apps / Get Add-ins > My add-ins > Add a custom add-in > Add from file**.
5. In Microsoft 365 Outlook desktop: open **Home > Get Add-ins > My add-ins > Add a custom add-in > Add from file**.
6. Open a message, choose **Mail Classifier**, then choose **Open Settings**.

# Configuration

Multiple rules can be configured in Settings. Each rule has a name, group email, and its own folder mapping.

### Single Rule Example

```text
Rule Name: AIOps
Group Email: aiops@company.com
TO_ONLY: AIOps Direct
TO_INCLUDED: AIOps Shared
CC_ONLY: AIOps FYI
CC_INCLUDED: AIOps Monitor
```

### Multiple Rule Example

Configure `AIOps`, `NOC`, and `Service Desk`, each with its own group email and folders. Rules are evaluated in order: **First Match Wins**. The first matching configured rule is used.

Folder values may be top-level display names or paths such as `Inbox/Support/Direct`. `NONE` never creates a category or moves a message.

# Multi Group Support

Examples include AIOps, NOC, SOC, Finance, HR, and Service Desk. Users may configure unlimited rules.

# User Configuration Storage

Configuration is stored in Outlook Roaming Settings. No recompilation or GitHub Pages redeployment is required; configuration is user-specific.

# Public Website Notice

This public website only hosts the application. User rules are not stored in GitHub; they are stored in Outlook Roaming Settings. Changes made in Settings are stored inside Outlook and take effect immediately.

## Architecture

- `src/utils/classifyRecipients.ts`: pure, deterministic classifier and normalization.
- `src/services/settingsService.ts`: Office roaming settings with browser/local fallback.
- `src/services/mailboxService.ts`: Office.js current-item reader.
- `src/services/categoryService.ts`: category creation/application through Outlook.
- `src/services/folderService.ts`: Graph folder resolution and creation.
- `src/services/messageService.ts`: category and move orchestration plus Graph update support.
- `src/services/graphService.ts`: token provider and Microsoft Graph SDK client.
- `src/taskpane/`: Fluent UI task pane.
- `src/settings/`: settings page.
- `src/commands/`: event/command entry point.

## Event activation and limitations

Outlook event-based activation is client- and requirement-set-dependent. The manifest includes a short `LaunchEvent`/command entry point for supported hosts, but message-read activation and moving an already-open message are not uniformly available. The handler therefore completes quickly and does not display UI. The task pane's **Refresh**, **Apply Category**, and **Move Message** actions are the supported fallback. Graph token acquisition also depends on tenant consent and client authentication support.

## Testing

The automated suite covers all five classifications, multiple rules, first-match ordering, and legacy settings migration. Category and folder routing are deterministic from `CATEGORY_BY_CLASSIFICATION` and each rule's folder mapping.

## Compatibility matrix

| Surface                               | Status                                                              |
| ------------------------------------- | ------------------------------------------------------------------- |
| Outlook on the Web                    | Supported with manual task pane flow                                |
| New Outlook for Windows               | Supported with manual task pane flow                                |
| Microsoft 365 Outlook desktop         | Supported where Mailbox 1.5+ is available                           |
| Exchange Online                       | Supported                                                           |
| Exchange Server/on-premises           | Not a supported deployment target                                   |
| Graph folder/create/update operations | Requires delegated Graph permissions and consent                    |
| Automatic message-open activation     | Subject to Outlook client support; manual fallback always available |

## Troubleshooting

- **Manifest rejected:** verify every URL is HTTPS and publicly reachable by the client, and that the Mailbox requirement set is supported.
- **Cannot move:** configure a destination folder and ensure the current item is a message in a writable mailbox.
- **Graph consent error:** verify the Entra ID app has the delegated permissions listed above and consent has been granted.
- **Settings not visible:** close and reopen the task pane after saving roaming settings.

## Screenshots

Screenshots can be added to `docs/screenshots/` and linked here once captured from a tenant; no tenant data is included in this repository.

## Security and privacy

See [SECURITY.md](./SECURITY.md). The add-in processes recipient addresses and message metadata only to classify the current item. Do not commit tokens, certificates, tenant identifiers, or customer message content.

## Roadmap

- Admin-managed deployment templates and centralized policy.
- Optional Graph-based batch classification.
- Telemetry-free diagnostics export with redaction.
- Additional localized Fluent UI resources.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md). Pull requests should include tests for changes to classification or routing behavior.

## License

This project is available under the [MIT License](./LICENSE).
## Configuration

### Single Rule Example

Configure a rule in the Settings page with a name, group email, and optional folder mappings:

```text
Rule Name: AIOps
Group Email: aiops@company.com
TO_ONLY: Inbox/AIOps Direct
TO_INCLUDED: Inbox/AIOps Shared
```

## Multi Group Support

Add as many rules as needed. Rules are evaluated in order and the first matching rule wins.

```text
AIOps          aiops@company.com
NOC            noc@company.com
Service Desk   servicedesk@company.com
```

## User Settings

Rules, folder mappings, and preferences are stored in Outlook `Office.context.roamingSettings`. They are per-user and are not stored in `.env` files or GitHub.

## GitHub Pages Deployment

Push to `main` to build, validate, and deploy the site to GitHub Pages. Production URLs come from `.env.production`.

## OWA Installation

In Outlook on the web, open **Get Add-ins > My add-ins > Add a custom add-in > Add from file**, then upload `dist/manifest.xml`.

## New Outlook Installation

Open **More apps / Get Add-ins > My add-ins > Add a custom add-in > Add from file**, then upload `dist/manifest.xml`.

## Desktop Outlook Installation

Open **Home > Get Add-ins > My add-ins > Add a custom add-in > Add from file**, then upload `dist/manifest.xml`.

## Troubleshooting

Run `npm run build && npm run validate`. Confirm that the manifest is generated from `manifest.template.xml`, contains no `localhost` in production, and points to the deployed Pages URL.
