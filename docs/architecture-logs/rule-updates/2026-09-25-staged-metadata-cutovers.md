# Staged metadata cutovers and orphan audits

**Date:** 2026-09-25 Asia/Bangkok
**Status:** Approved by the user and applied.

## Rule

For migrations from files or other external resources to database metadata, stage schema and writers, legacy backfill, client handling, and metadata-only reads. Guard new public identifier allocation until legacy identifiers are indexed. Audit missing and unreferenced resources and provide recovery for interrupted writes before enabling metadata-only reads.

## Rationale and source

The product image migration showed that a new gallery allocation before legacy files are indexed can reuse an existing public image number. An interrupted file/metadata write can also leave an orphan or a row with a missing file. The staged rollout and audit make both conditions visible and recoverable while preserving URLs.

Source feature: [Indexed image metadata and nullable image links](../code-changes/2026-09-25-image-metadata.md). The user selected “Require staged metadata cutovers and orphan audits” after local testing.

## Validation

The rule is in the short `netzero-architecture` skill and the image migration section of `netzero-server/docs/GENERAL_ARCHITECTURE.md`. The feature was tested with MySQL backfill, concurrent gallery ID allocation, orphan detection/cleanup, server Jest, and React checks. Production cutover remains pending a verified backup destination.
