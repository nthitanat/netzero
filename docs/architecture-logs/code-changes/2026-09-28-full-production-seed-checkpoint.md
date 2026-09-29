# Full production seed refresh checkpoint

**Date:** 2026-09-28 Asia/Bangkok  
**Status:** In progress; waiting for production VPN access.

## Objective

Replace the synthetic user emails and names with their actual production values, then add production rows from every populated table, including events, to the per-table INSERT seeds.

## Work and boundary

- Inspected the current 17-table seed layout and confirmed the existing user and product snapshot still uses synthetic emails and names. No seed data was changed in this attempt.
- The configured Chula VPN endpoint times out on TCP 443, no VPN route to the production server is present, and SSH to the server timed out. The user said they will restore VPN access.
- A direct retry with `scripts/connect-vpn.sh` and OpenConnect reached `POST https://vpn.chula.ac.th/` but failed to open the HTTPS connection. A subsequent TCP 443 check still timed out; no OpenConnect process or production VPN route remained.
- Keep password hashes out of the seed unless explicitly requested; preserve real email and name fields as directed. Inventory live table names, counts, and columns before changing any remaining INSERT file. Resolve fixture ID collisions and replay against disposable MySQL after the export.

## Remaining work

Reconnect to production read-only, export all populated tables, generate the corresponding INSERT files, verify row counts and foreign keys in disposable MySQL, update the seed documentation and this log, and remove any temporary private export.
