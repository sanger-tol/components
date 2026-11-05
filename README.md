<!--
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
-->

# Components - ToL UI

'Components' is an environment to develop and test new react components for the ToL UI package.

Please find the ToL UI docs [here](https://ssg-confluence.internal.sanger.ac.uk/display/TOL/ToL+UI+Library).

## Building and running the application locally

[Tol developer documentation](https://ssg-confluence.internal.sanger.ac.uk/display/TOL/Building+and+running+any+ToL+Platforms+app+locally)

### Local environment variables from Keeper

Keeper is the source of truth for local configuration. Generate your ignored
[`.env.dev`](.env.dev) from [`.env.dev.template`](.env.dev.template) before
starting Docker Compose. This runs **on your device, not in a Dockerfile**:
Compose needs the variables before building or starting containers, and Keeper
credentials and generated secrets must not be baked into image layers.
No change to the `web-base-dev` image is required.

#### One-time prerequisites

1. Install Docker with Compose v2 and retain access to the private base images
   used by the existing development Dockerfiles.
2. Ask your Keeper administrator for a **Secrets Manager application** with
   read access to the `components` record in the `local_env_variables` shared
   folder, and a separate **one-time client/device token for each developer**.
   A normal Keeper vault login alone is not sufficient.
3. Install **Keeper Secrets Manager CLI (`ksm`)**, not Keeper Commander.
   Use the [official installer for your platform](https://docs.keeper.io/keeperpam/secrets-manager/secrets-manager-command-line-interface),
   or, with Python 3.10+ and `pipx` already installed:

   ```sh
   pipx install 'keeper-secrets-manager-cli[keyring]'
   ksm interpolate --help
   ```

   Use a CLI release supporting `interpolate` and `--validate`; upgrade an
   existing pipx installation with
   `pipx upgrade keeper-secrets-manager-cli`.
   The `keyring` extra enables OS-native credential storage, including macOS
   Keychain.
4. Initialize a device profile from a private terminal **outside this repository**.
   The following uses Bash's hidden prompt so the token is not saved in shell
   history or passed as a command-line argument:

   ```sh
   bash
   cd "$HOME"
   read -r -s -p 'Keeper one-time token: ' KSM_CLI_TOKEN
   printf '\n'
   export KSM_CLI_TOKEN
   ksm profile init
   unset KSM_CLI_TOKEN
   exit
   ```

   Never paste the token into a committed file or
   share a device profile with teammates. If the CLI uses file-based storage
   instead of the OS keyring, keep `keeper.ini` outside the repository and
   restrict it to your user (`chmod 600 keeper.ini`).
   See Keeper's [profile setup documentation](https://docs.keeper.io/keeperpam/secrets-manager/secrets-manager-command-line-interface/profile-command).

#### Template configuration

The template uses `keeper://components/custom_field/<field-label>` because
the variables are custom fields on the `components` record. Folder paths are
not part of Keeper notation. Field labels must exactly match those in Keeper.
If the application can access multiple records named `components`, replace
`components` in every reference with the intended **record UID**.

Keeper interpolates values verbatim, so they must be valid Docker Compose
dotenv values. Add suitable dotenv quoting in the template where needed (for
example, a value containing a space followed by `#`). Keeper also rejects
certain shell metacharacters by default; do not bypass that protection or
`source`/`eval` the generated file. If generation fails, check CLI support,
device access, field labels, and value formatting before retrying.

#### Generate and start

From the repository root:

```sh
sh scripts/dev-env.sh &&
  docker compose --env-file .env.dev up --build components-db components-api components-ui
```

The script uses `ksm interpolate --validate` to resolve the template in a private
temporary directory, then replaces `.env.dev` with owner-only permissions only
after success. A failure leaves any existing `.env.dev` unchanged and removes
the temporary files. Keeper errors stop the command, so the `&&`
prevents Docker from starting with a stale file. Generation replaces any
existing `.env.dev`; move any local overrides into Keeper before switching.
Rerun the command after changing values in Keeper, and recreate running
containers to pick up the changes. No manual copies need to be distributed,
but a plaintext `.env.dev` still exists locally; delete it when no longer needed.

Always supply `--env-file .env.dev` for other Compose commands that use this
configuration. Avoid `docker compose config` in shared logs: its normal output
can include resolved secrets.
