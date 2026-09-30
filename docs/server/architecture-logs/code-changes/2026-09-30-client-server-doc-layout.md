# Client/server documentation layout

**Date:** 2026-09-30 Asia/Bangkok
**Status:** Complete. [Plan](../../implementation-plans/2026-09-30-client-server-doc-layout.md), [rule update](../rule-updates/2026-09-30-client-server-doc-layout.md).

Moved 57 Markdown files into `docs/client/` or `docs/server/`, including plans, outcomes, rule records, the archived index, the client deployment note, and the Docker guide. `docs/GENERAL_ARCHITECTURE.md` remains at the shared root. Client-only Glocal course records moved to client; API, database, deployment, and earlier project workflow records moved to server. The Glocal monorepo and pagination records remain canonical under server and are linked from client indexes.

Created client plan and architecture indexes, split the existing server indexes, updated `AGENTS.md` and the shared guide, and rebased relative Markdown links to moved files. Repaired live references in the seed README, Glocal client guide, deployment archive pointers, and repository README. A separate working-tree change removed `DOCKER.md` during the migration; preserved that deletion and directed the live seed reference to the surviving server deployment guide. No application source or installed skill release was changed by this task.

Verification: root workflow folders absent; both side indexes and shared guide present; active guidance contains no old root workflow or deployment-guide path; `git diff --check` passed. A repository-wide local Markdown link check found 14 broken targets already present in imported client or retired deployment documents; none points to moved workflow files. No runtime tests were required for the documentation move.
