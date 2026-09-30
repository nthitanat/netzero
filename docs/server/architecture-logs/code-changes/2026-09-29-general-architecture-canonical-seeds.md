# Shared canonical seed rule release

**Date:** 2026-09-29 Asia/Bangkok

**Outcome:** Release `d69cce694404d08969569e9bb462126213a5f71b19626d455d70c05bd49605b0` installed and verified in both `~/.codex` and `~/.codex-office`, including both default skill links.

Updated the existing Schema and seeds paragraph in `skills/general-architecture/references/ARCHITECTURE-GUIDELINES.md` with the user's exact two-sentence CREATE/INSERT update rule. The final sentence now leaves project paths, file naming, reset procedures, and tooling status to each project, avoiding conflicting ownership. Added release history and resealed the manifest. No application, seed SQL, or deployment was changed; NetZero retains its explicit adopted revision `1dd6330013a3b8e2dff256ed35bb9a485320c816b77ca7c132a70a50a56da0bf` and its existing local seed rule.

Verification: all 13 isolated release/measurement tests passed after the instruction edit. Package links and heading anchors passed. Source and both installed copies/default links passed final content verification after release history was added. Ruby parsed frontmatter. The Python skill validator was attempted but could not start because PyYAML is missing in both available Python interpreters; it is not reported as passing. Manual styling, same-session follow-up, canonical schema/preset, and live migration walkthroughs preserved selective loading and migration safeguards; these are simulations, not independent agent or live database tests.

Word counts and walkthrough details are recorded in the package's `logs/CHANGES.md`: entry stays at 476 words; technical reference grows by 26 words; other references are unchanged. Previous releases remain available for rollback. The only validation limitation is the unavailable Python validator dependency.

The repository's broad `logs` ignore rule hid the required package history from version control. Added a narrow `.gitignore` exception for `skills/general-architecture/logs/CHANGES.md`, so the source can include every file declared in its release manifest. Confirmed the history is now visible as an untracked source file; no files were staged. Final `git diff --check` passed.
