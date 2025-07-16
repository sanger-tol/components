<!--
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
-->

# Playwright tests for ToL-UI

## Setup

First, start the app

```bash
tol down && tol up && tol restore && tol alembic upgrade
```

## Running

There are 2 ways to run the tests

### ToL CLI

To run the tests (headlessly):

```bash
tol test --type=playwright
```

### Local browsers (VSCode)

Only once, enter the directory, and install the dependencies and browsers

```bash
cd test/playwright && npm i && npx playwright install --with-deps
```

Then in VSCode, on MacOS:

**[cmd-shift-P][Tasks: Run Task][Playwright test (.env.dev)]**

This assumes that you are using an environment variable file called `.env.dev`.

## Reading the report

In the `test/playwright directory`, run:

```bash
npx playwright show-report
```
