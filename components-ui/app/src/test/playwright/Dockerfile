# SPDX-FileCopyrightText: 2025 Genome Research Ltd.
#
# SPDX-License-Identifier: MIT

FROM mcr.microsoft.com/playwright:v1.59.1-noble

WORKDIR /usr/src/app

COPY package.json .

RUN npm i

COPY playwright.config.ts .

COPY . .

CMD ["npx", "playwright", "test"]
