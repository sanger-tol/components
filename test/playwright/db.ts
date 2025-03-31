// SPDX-FileCopyrightText: 2025 Genome Research Ltd.
//
// SPDX-License-Identifier: MIT

import postgres from 'postgres';

const sql = postgres({
    host: process.env.POSTGRES_HOST,
    password: process.env.POSTGRES_PASSWORD,
    port: process.env.POSTGRES_PORT,
    username: process.env.POSTGRES_USER,
    database: process.env.POSTGRES_DB,
});

export default sql;
