<!--
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
-->


When implementing sqlite using these functions you must make sure vite has the correct snippet:

viteStaticCopy({
    targets: [
    {
        src: path.resolve(__dirname, "node_modules/jeep-sqlite/dist/**/*"),
        dest: "jeep-sqlite",
    },
    ],
}),