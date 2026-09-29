# Keep architecture skill defaults current

**Status:** Complete. User explicitly requested updated defaults in both environments on every update.

## Result

Release `1dd6330013a3b8e2dff256ed35bb9a485320c816b77ca7c132a70a50a56da0bf` is installed and fully verified in both homes. Both `~/.codex/skills/general-architecture` and `~/.codex-office/skills/general-architecture` now resolve to their respective `skill-releases/general-architecture/1dd6330013a3b8e2dff256ed35bb9a485320c816b77ca7c132a70a50a56da0bf/` directories. NetZero adoption matches this release. Earlier immutable releases remain available; project pins are not silently migrated by default-link changes.

The release helper stages/verifies all selected copies before activation, atomically replaces each default link, and attempts restoration if activation fails. It repairs stale/broken symlinks, preserves real-directory conflicts, and refuses `install --pinned`. Normal verification now requires the actual default symlink to resolve to the selected release as well as matching complete contents. Cross-home changes are recoverable, not globally atomic.

## Verification and scope

All 13 isolated tests and the skill validator passed. Coverage includes upgrades advancing both links, retained pins, broken links, real-directory conflicts, injected activation failure/restoration, partial copy failure, corruption, measurement, and activation-bypass rejection. Final normal verification passed in both real homes without `--pinned`. Source links/anchors passed.

The separate package change log owns detailed rationale, counts and loading review. Entry remains 402 body words; Maintenance grew by six words (673 → 679) to express activation/recovery behavior. Small-task and update-route loading checks were manual selection simulations; no application integration claim.

Changed only skill source/tooling/tests, explicit project adoption, and required records. No application, database, deployment, Git commit, or unrelated existing-work changes.
