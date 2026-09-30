# Shared canonical seed update rule

**Status:** Complete; source and both installed defaults verified at `d69cce694404d08969569e9bb462126213a5f71b19626d455d70c05bd49605b0`. [Tested outcome](../architecture-logs/code-changes/2026-09-29-general-architecture-canonical-seeds.md).

Promote the user's explicit rule into the shared skill's existing Schema and seeds section: edit the owning CREATE/INSERT definition and do not accumulate ALTER/UPDATE files as permanent definitions. Preserve reviewed live migrations and historical migration records.

1. Edit the owning reference in place and review related wording for consistency.
2. Measure against release `da723d59afccde9991da12a009e1c347b2b85cb5a078438567e5805de2c577d7`; validate the skill, selective loading, links, and distribution.
3. Record the approved rule and tested outcome, seal the package, install and verify both Codex default links.

This updates the shared package; project adoption remains explicitly pinned by AGENTS.md.
