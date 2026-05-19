# AGENTS.md & skills.md Refactor Summary

**Date**: 2026-05-19  
**Status**: ✅ Complete

---

## What Was Done

### 1. Consolidated AGENTS.md

**Created**: [`AGENTS.md`](AGENTS.md) (root level, 485 lines)

**Merged from**:
- `.bob/rules-advanced/AGENTS.md` (43 lines)
- `.bob/rules-code/AGENTS.md` (43 lines)
- `.bob/rules-ask/AGENTS.md` (42 lines)
- `agents.md` (65 lines, old version)

**New structure**:
- 📋 Table of Contents with 7 major sections
- Quick Reference checklist
- 5 Iron Laws (mandatory architecture rules)
- File organization & imports
- Code generation workflow
- Agent behavioral patterns
- Running tests guide
- Known gotchas & fragile patterns
- Mode-specific notes
- Quick checklist for new features

**Key improvements**:
- All rules consolidated in one place
- Clear behavioral expectations for agents
- Step-by-step workflows
- Code examples for every pattern
- Cross-references to skills.md

---

### 2. Enhanced skills.md

**Updated**: [`skills.md`](skills.md) (717 lines)

**New structure**:
- 📋 Table of Contents with 11 major sections
- Complete end-to-end feature workflow
- Auth hub usage patterns
- State manager recipes
- Test toggle switchboard guide
- Element factory pattern examples
- Locator naming conventions (comprehensive table)
- Spec file template
- Helper file template
- Test data management
- 6 common patterns & recipes
- Known gotchas reference table
- Quick command reference

**Key improvements**:
- Practical implementation recipes
- Copy-paste ready templates
- Common patterns library
- Detailed naming conventions
- Command reference guide

---

### 3. Mode-Specific Files Updated

All mode-specific AGENTS.md files now redirect to the main consolidated file:

- `.bob/rules-advanced/AGENTS.md` → References main AGENTS.md
- `.bob/rules-code/AGENTS.md` → References main AGENTS.md
- `.bob/rules-ask/AGENTS.md` → References main AGENTS.md

Each file includes:
- Clear notice about consolidation
- Mode-specific notes (what's different)
- Links to main AGENTS.md and skills.md

---

## File Structure

```
c:/Users/asset/OneDrive/Documents/RMS/
├── AGENTS.md                    ← 🆕 Main consolidated guide (485 lines)
├── skills.md                    ← ✨ Enhanced recipes (717 lines)
├── .bob/
│   ├── rules-advanced/
│   │   └── AGENTS.md           ← 🔗 Redirect to main
│   ├── rules-code/
│   │   └── AGENTS.md           ← 🔗 Redirect to main
│   └── rules-ask/
│       └── AGENTS.md           ← 🔗 Redirect to main
```

---

## Key Benefits

### For AI Agents

1. **Single source of truth** — No conflicting rules across modes
2. **Clear behavioral patterns** — Know exactly what to do in each scenario
3. **Auto-encapsulation** — Always follow Element Factory Pattern
4. **Quick reference** — Find answers fast with table of contents

### For Developers

1. **Comprehensive guide** — Everything in one place
2. **Copy-paste templates** — Speed up implementation
3. **Pattern library** — Reusable solutions for common tasks
4. **Gotcha prevention** — Avoid known pitfalls

### For Maintenance

1. **Easier updates** — Change once, applies everywhere
2. **Consistent patterns** — All code follows same structure
3. **Better onboarding** — New team members have clear guide
4. **Reduced duplication** — No scattered rules

---

## Agent Behavioral Changes

### Before Task Execution

Agents will now:
1. ✅ Read AGENTS.md first (mandatory)
2. ✅ Check skills.md for implementation recipes
3. ✅ Verify toggle exists in test.config.ts
4. ✅ Scan helpers/elements/ for reusable locators
5. ✅ Review similar specs for patterns

### During Implementation

Agents will:
1. ✅ Always follow Element Factory Pattern (Section 1 + 2)
2. ✅ Import from helpers/base.test.ts (never @playwright/test)
3. ✅ Import from helpers/elements/auth.helper.ts (never global/auth.ts)
4. ✅ Use test.step() with 'Role: Action' format
5. ✅ Tag fragile selectors with // ⚠️
6. ✅ Add test data to helpers/data.helper.ts
7. ✅ Clear helpers/temp_codegen.txt after use

### Code Encapsulation

All new code will:
1. ✅ Have zero raw selectors in spec files
2. ✅ Extract all business logic to helpers
3. ✅ Use TEST_DATA constants (no hardcoded values)
4. ✅ Reuse existing locators (no duplicates)
5. ✅ Separate locators (Section 1) from actions (Section 2)

---

## Migration Notes

### No Breaking Changes

- All existing specs continue to work
- Old `global/auth.ts` still functional (backward compatibility)
- Mode-specific files redirect properly
- No code changes required in existing tests

### Recommended Actions

1. **New features**: Follow AGENTS.md checklist
2. **Existing code**: Gradually migrate to new patterns
3. **Documentation**: Reference AGENTS.md in PR descriptions
4. **Onboarding**: Share AGENTS.md with new team members

---

## Quick Links

- 📖 [AGENTS.md](AGENTS.md) — Rules and behavioral patterns
- 🛠️ [skills.md](skills.md) — Implementation recipes
- ⚙️ [test.config.ts](test.config.ts) — Test toggles
- 🧪 [helpers/base.test.ts](helpers/base.test.ts) — Custom fixture
- 🔐 [helpers/elements/auth.helper.ts](helpers/elements/auth.helper.ts) — Auth hub

---

## Verification Checklist

- [x] AGENTS.md created with all rules consolidated
- [x] skills.md enhanced with comprehensive recipes
- [x] Mode-specific files updated with redirects
- [x] All cross-references verified
- [x] No breaking changes introduced
- [x] Documentation complete

---

**Status**: ✅ Ready for use  
**Next Steps**: Agents will automatically reference these files before any task