# Security Policy

## Supported versions

Security fixes are applied to the latest version on the default branch.

## Reporting a vulnerability

Please do not open a public issue for a suspected security vulnerability. Use the repository's private vulnerability-reporting feature when it is enabled, or contact a project maintainer privately through the repository profile.

Include a clear description, affected files or endpoints, reproduction steps, impact, and any suggested mitigation. Do not include live credentials, user data, or production database connection strings.

Maintainers will acknowledge reports as soon as practical, investigate them privately, and coordinate a fix before public disclosure.

## Handling credentials

If you accidentally commit a secret, revoke or rotate it immediately. Removing the file in a later commit does not remove it from repository history. Then notify the maintainer through a private channel so the exposure can be assessed and remediated.
