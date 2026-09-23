<!--
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
-->

# Offline SQLite service

`sqliteService` provides the `SqliteService` class, constructed with a database name and its upgrade statements. It initialises the Capacitor SQLite connection once, configures `jeep-sqlite` and its persistent web store in browsers, applies upgrades, and returns an opened database connection via `getSQLiteDatabase()`.

## Consuming application

Add `sql.js@1.11.0` and the package peer dependencies to `package.json`:

```json
{
	"dependencies": {
		"@capacitor-community/sqlite": "^8.1.0",
		"jeep-sqlite": "^2.8.0",
		"json-edit-react": "1.30.1",
		"react": "18.3.1",
		"react-dom": "18.3.1",
		"react-markdown": "10.1.0",
		"react-router-dom": "^5.2.0",
		"sql.js": "1.11.0"
	}
}
```

Create a `schema.ts` that exports ordered versioned SQL upgrade statements. Create an `index.ts` that imports the upgrades, instantiates `SqliteService` with a stable database name, and exposes the application's queries or seed functions.

Add the plugin logic to `vite.config.ts`:

```ts
const copy = () => {
    const candidates = [
        path.resolve(__dirname, "node_modules/jeep-sqlite/dist"),
        path.resolve(__dirname, "node_modules/@tol/tol-ui/node_modules/jeep-sqlite/dist"),
    ];

    const sourceDir = candidates.find((candidate) => fs.existsSync(candidate));

    if (!sourceDir) {
        console.warn("jeep-sqlite assets not found; skipping copy step");
        return;
    }

    fs.mkdirSync(targetDir, { recursive: true });
    fs.cpSync(sourceDir, targetDir, { recursive: true, force: true });

    const wasmCandidates = [
        path.resolve(__dirname, "node_modules/sql.js/dist/sql-wasm.wasm"),
        path.resolve(__dirname, "node_modules/@tol/tol-ui/node_modules/sql.js/dist/sql-wasm.wasm"),
    ];

    const wasmSource = wasmCandidates.find((candidate) => fs.existsSync(candidate));

    if (!wasmSource) {
        console.warn("sql-wasm.wasm not found; skipping copy step");
        return;
    }

    fs.mkdirSync(wasmTargetDir, { recursive: true });
    fs.copyFileSync(wasmSource, path.resolve(wasmTargetDir, "sql-wasm.wasm"));
};


export default defineConfig({
  plugins: [
    ...,
    copyJeepSqliteAssets(),
  ],
  ....
```

The plugin copies `jeep-sqlite` to `public/jeep-sqlite` and `sql-wasm.wasm` to `public/assets` for both builds and local development.