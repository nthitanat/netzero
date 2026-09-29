# Keep both architecture skill defaults current

**Status:** Complete. User explicitly requests both default links advance on every update.

Replace the previous preserve-alias behavior in the release helper and Maintenance procedure. Stage and verify both immutable copies before activating discovery links; reject real-directory conflicts, repair broken links, and report/repair partial failures. Retain immutable prior revisions for project pins and rollback. Verify update, failure, rollback, measurement and loading behavior; install the final release and confirm both default links. Update project adoption and records. No application or deployment changes.

[Verified result](../architecture-logs/code-changes/2026-09-29-general-architecture-default-links.md): all 13 tests passed; both default links and complete releases verified.
