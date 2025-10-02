# Design Document Discrepancies

## Change History
| Date       | Description                              |
| ---------- | ---------------------------------------- |
| 2024-03-25 | Initial analysis of design discrepancies |

## Status Legend
🔴 Unresolved
🟡 In Progress
🟢 Resolved

## Active Discrepancies

### 1. Phase Definition Inconsistency 🔴

**Description:** Design documents contain inconsistent phase definitions, with conflicting scope for Phase 1.

**Details:**
- `migration_plan_phase1.md` describes Phase 1 as "adding support for newer Claude API specifications while maintaining backward compatibility"
- `implementation_plan_phase1.md` describes Phase 1 as "fixing existing bugs and adding support for newer Claude API specifications"
- Current phasing defines Phase 1 [COMPLETE] as "Fix filename format bug" and moves API changes to Phase 2 [ACTIVE]

**Proposed Resolution:** Update all design documents to reflect new phasing structure. Move `implementation_plan_phase1.md` to `/design/done/` and create new implementation plan for Phase 2.

### 2. Sequence Diagram Misalignment 🔴

**Description:** Sequence diagram doesn't reflect planned architecture changes for API detection and structured content extraction.

**Details:**
- Shows only regex-based extraction
- Missing multi-stage processing pipeline with model detection and fallback mechanisms

**Proposed Resolution:** Create updated sequence diagram including new processing flow: API detection → format-specific extraction → fallback mechanisms.

### 3. Data Flow Documentation Gaps 🔴

**Description:** Data flow document lacks new artifact extraction methodology.

**Details:**
- References only regex-based parsing
- Missing structured content extraction for Claude 3.5+
- No model detection or fallback mechanisms

**Proposed Resolution:** Update data flow document to include new processing pipeline while maintaining backward compatibility documentation.

### 4. Inconsistent API Version Terminology 🔴

**Description:** Inconsistent API version terminology across documents.

**Details:**
- `migration_plan_phase1.md`: "modern" (Claude 3.5+), "claude-3", "legacy"
- `api_migration_problems.md`: specifically mentions "Claude 3.5+"
- No consistent naming convention

**Proposed Resolution:** Standardize API version terminology across all documents with clear version boundaries.

### 5. Implementation Plan vs. Migration Plan Mismatch 🔴

**Description:** Implementation and migration plans have overlapping but mismatched scopes.

**Details:**
- Implementation plan prioritizes filename bugs
- Migration plan prioritizes API changes
- Timeline and priority inconsistencies

**Proposed Resolution:** Create new Phase 2 implementation plan aligned with migration plan, acknowledging completed Phase 1.

### 6. Content Type Support Scope Confusion 🔴

**Description:** Inconsistent definition of supported content types.

**Details:**
- `api_migration_problems.md` lists multiple types (code, images, tool outputs, etc.)
- Migration plan focuses on code blocks
- Unclear Phase 2 content type scope

**Proposed Resolution:** Define clear content type support scope for Phase 2, likely limiting to code blocks initially.

### 7. Test Strategy Document Location 🔴

**Description:** Testing strategy embedded in migration plan instead of separate document.

**Details:**
- Testing approach in `migration_plan_phase1.md` (lines 200-266)
- No dedicated test plan document

**Proposed Resolution:** Extract testing strategy into separate document.
