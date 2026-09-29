# Deployment sudo password automation

**Status:** Complete, locally verified on 2026-09-24.

## Objective and changes

- Updated `scripts/connect-vpn.sh` and `scripts/disconnect-vpn.sh` to supply `SUDO_PASSWORD` to each local sudo command without an interactive prompt. The VPN setup validates it before installing tools or connecting.
- Updated `scripts/remote-deploy.sh` to supply `SUDO_PASSWORD` for local package installation and `REMOTE_SUDO_PASSWORD` for server sudo. When the server's SSH and sudo passwords match, the script falls back to `REMOTE_PASSWORD`.
- Removed credentials from the SSH command arguments. The script uploads a filtered copy of `.env.production` that excludes local VPN and sudo credentials, then reads the remote sudo password from that copy on the server.
- Added the optional server sudo key to `.env.production` and its tracked example, and documented the behavior in `DOCKER.md`. The real environment file remains Git-ignored.
- Kept all authentication behavior in deployment scripts; no API, database, or React contract changed.

## Verification

- Bash syntax checks passed for all changed scripts and the remote heredoc.
- Mock sudo checks passed for local sudo, separate server sudo, and SSH-password fallback.
- A mock status deployment passed through environment filtering, SCP/SSH argument handling, the selected remote action, and server sudo. No real VPN, SSH, or production server was contacted.
- The production Compose configuration validated with a temporary vector store ID supplied only for the check; the real file still needs its actual ID.
- `git diff --check` passed.

## Remaining work

If the server's sudo password differs from its SSH password, set `REMOTE_SUDO_PASSWORD` in the ignored `.env.production` before deployment. A live remote deployment has not been run.
