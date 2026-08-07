# Contributing to LinkSave

Thanks for helping improve LinkSave. This guide keeps contributions focused, reviewable, and safe to ship.

## Before you start

- Search existing issues and pull requests before opening a new one.
- Use an issue to discuss substantial changes before investing in an implementation.
- Never include real user data, access tokens, MongoDB connection strings, OAuth client secrets, or `.env` files in issues, commits, screenshots, or pull requests.

## Development setup

Follow the [local setup instructions](README.md#run-locally). The extension and API are separate Node.js projects, so install their dependencies independently:

```bash
npm ci
cd server && npm ci
```

Use `.env.local` for the extension API URL and `server/.env` for the local API configuration. Both files are ignored; commit only updates to the corresponding `.env.example` files when a new variable is required.

## Making a change

1. Create a focused branch from the default branch.
2. Keep the change small and explain the user-facing result in the pull request.
3. Update documentation and screenshots when behavior or the popup UI changes. Screenshots must use sample data only.
4. Run the checks below before requesting review.

```bash
npm run compile
npm run build
```

If you change the API, start it locally and exercise the affected endpoint. If you change authentication, test both signed-in and signed-out states.

## Pull request checklist

- [ ] The change has a clear purpose and a concise description.
- [ ] `npm run compile` and `npm run build` pass.
- [ ] New configuration is documented in `README.md` and `.env.example`.
- [ ] No secrets, personal data, generated build output, or dependency directories are included.
- [ ] Documentation and privacy-safe screenshots are updated where relevant.

## Reporting bugs and requesting features

Include the extension version, browser version, reproduction steps, expected behavior, and actual behavior. Please remove personal URLs and account information from logs and screenshots.

For security-sensitive reports, follow [SECURITY.md](SECURITY.md) instead of opening a public issue.
