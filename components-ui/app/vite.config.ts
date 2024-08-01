// SPDX-FileCopyrightText: 2024 Genome Research Ltd.
//
// SPDX-License-Identifier: MIT

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import viteTsconfigPaths from 'vite-tsconfig-paths'
import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig({
    plugins: [react(), viteTsconfigPaths(), basicSsl()],
    build: {
        emptyOutDir: true,
        outDir: 'build',
    },
    server: {
        host: '0.0.0.0',
        port: 3000,
        https: true
    },
    test: {
        environment: 'jsdom',
        setupFiles: ['./src/setupTests.ts'],
        testMatch: ['**/*.test.tsx'],
        globals: true
    }
})