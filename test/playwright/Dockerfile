# SPDX-FileCopyrightText: 2025 Genome Research Ltd.
#
# SPDX-License-Identifier: MIT

FROM node:23-slim

RUN apt-get update && apt-get upgrade -y && apt-get install -y curl

WORKDIR /usr/src/app

COPY package.json .

RUN npm i

COPY playwright.config.ts .

RUN npx playwright install --with-deps

COPY . .

CMD ["npx", "playwright", "test"]
