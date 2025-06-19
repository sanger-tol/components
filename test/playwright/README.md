<!--
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
-->

# Playwright tests for ToL-UI

## Running

First, start the app

```bash
tol down && tol up && tol restore && tol alembic upgrade
```

### ToL CLI

To run the tests (headlessly):

```bash
tol test --type=playwright
```

### Local browsers (VSCode)

Enter the directory

```bash
cd test/playwright
```

Only once, install the dependencies and browsers

```bash
npm i && npx playwright install --with-deps
```

Then in VSCode, on MacOS:

**[cmd-shift-P][Tasks: Run Task][Playwright test (.env.dev)]**

This assumes that you are using an environment variable file called `.env.dev`.