# Maintenance

## Revision resolution

Compare the loaded `RELEASE.json` digest with project adoption once per session; repeat only after installation/adoption changes. Routine edits do not load this procedure or verify both homes.

On mismatch, verify and load the adopted copy at `ACTIVE_CODEX_HOME/skill-releases/general-architecture/REVISION/` or the recorded project-local package. Active home means the session's configured home, defaulting to `~/.codex`. Never substitute the newest release. If unavailable, obtain the trusted recorded release; disclose the limitation and use repository rules only for adequately covered decisions.

## Shared rules

Promote rules only when authorized; a one-off fix is not automatically general guidance. Project guides own application paths, contracts, naming, topology, and exceptions; the fixed documentation paths are owned by [Adoption: Records](ADOPTION.md#records). Maintain one source package; installations are distributions. Package resources are separate from project workflow documents.

For **every source update**, complete this review before sealing:

1. Edit the owning instruction in place. Merge the change into its existing rule, remove superseded wording, and check related sections/links for duplication and contradictions. Add a new section only for a responsibility with no existing owner; do not stack dated corrections or repeated reminders.
2. Run `measure` against the verified previous release. Record before/after entry and individual reference word counts. Keep the entry body around **300–500 words**, excluding metadata; justify deviations and necessary growth. Do not pad a complete shorter entry or require repeated 33% reductions. Moving text into routinely loaded references does not demonstrate reduced reading.
3. Exercise a small styling/text task and a same-session follow-up on every update: no unrelated database, deployment, adoption, maintenance, history, or extraction-plan bodies; no unnecessary rereads/revision checks. Exercise affected task routes too; broaden cases when routing, ownership, or safeguards change. Record expected/actual files and sections read, instruction words, separate project context, avoidable reads/calls, and outcomes. Correct unexplained overreading without dropping safeguards; label simulations and unverified behavior.
4. Run the skill validator and applicable behavioral/distribution checks. Confirm compatibility, single ownership, direct links, preserved safeguards, and rollback. Measurements cannot prove semantic consistency; review it explicitly. New project adoption requires its own compatibility review.
5. Record changes, rationale, counts, justified growth, checks/results, and limitations in [the separate change log](../logs/CHANGES.md). Keep history out of instruction files; routine tasks never load the log. Record each project's adoption separately. Update and verify both homes’ default links before claiming completion.

## Source and releases

Version the portable package in a trusted repository/artifact store. Release tooling requires only that package and destination homes. Record its obtainable source in project adoption; shared releases do not automatically update projects.

From the package, use Python 3 (`PREVIOUS_PACKAGE` identifies the verified prior release):

```sh
python3 scripts/release.py measure --baseline PREVIOUS_PACKAGE
python3 scripts/release.py seal
python3 scripts/release.py verify
python3 scripts/release.py install --homes "$HOME/.codex" "$HOME/.codex-office"
python3 scripts/release.py verify --homes "$HOME/.codex" "$HOME/.codex-office"
```

`measure` reports counts and target status; it does not approve exceptions or certify reviews. `seal` hashes all regular files except `RELEASE.json`, rejecting symlinks. The manifest checks complete content integrity against the recorded digest, not publisher authenticity. Never edit installed releases.

Every installation/update verifies both immutable copies before atomically replacing each default `skills/general-architecture` symlink, including stale/broken links. Real files/directories at discovery paths are preserved and reported as conflicts. Completion requires both defaults pointing to the selected release. Retained project pins use immutable paths; `verify --pinned` checks those only and cannot bypass default activation during installation.

Cross-home activation is not globally atomic. Copy failures preserve defaults; activation failures attempt link restoration and report recovery failures. Repair and rerun the same release; matching copies are reused, corrupt ones refused. Identify consumers before quarantining corruption. Require complete content and default-link verification in both homes.

## Upgrades and rollback

Review compatibility and migration needs before adoption. Reuse authorization; ask only about unresolved policy/scope changes. After dual-home verification, update only authorized projects' digest/resolution and reload their entry point. Retain other projects' pins and all old releases; no application migration is implied.

To roll back, restore the previously recorded project digest, reload its entry point, and run its `scripts/release.py verify --homes "$HOME/.codex" "$HOME/.codex-office" --pinned`. Reinstall that exact trusted package first if missing. Before retiring a predecessor, inventory unique rules/references, prove parity, switch project routing, and archive it outside discovery for recovery.
