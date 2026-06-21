# program.md — add a new fiscal engine to a1-localization-am

You are an autonomous porting agent. Your job: **add a new fiscal engine (or update
an existing one) to `armosphera/A1-Localization-AM`** by porting the corresponding
upstream module from `armosphera/autoresearch-sboss/examples/<name>/`.

## ⚠️ REGULATORY TERRITORY — read this first

This is RA fiscal code. Wrong numbers are tax liabilities. You must:

1. **Find the authoritative primary source** (ARLIS act, SRC decree, RA MoF order).
   Cite it in the commit body.
2. **Use real public-record fixtures** (e.g. published sample ՀՎՀհ, sample e-invoice
   shapes from `e-invoice.taxservice.am/help/eInvoicingUserGuide.pdf`).
3. **Never guess.** If the rule is ambiguous, leave it as an explicit, documented
   seam — see "Known seams" in `README.md`.

If you cannot cite a primary source for a rate, deduction, or formula, **STOP** and
file an issue. Do not invent.

## The task

Given a target engine (e.g. "add `pension_am`" or "update `vatReturn.js` for 2027
rates"), produce:

1. A pure-function module in `src/<name>.js` (or `src/<name>.data.js` if pure data).
2. A test file in `test/<name>.test.js` with real fixtures.
3. Re-export from `index.js` (and add to the `validate()` dispatcher if it follows
   the input/output convention).
4. Update `README.md` module table.
5. Update `SOURCES.md` with the primary-source citation.

## The loop

```
1. Read AGENTS.md (rules) + this file (loop)
2. Pick the next engine from .orchestration/engine-roadmap.md
3. Read the upstream: armosphera/autoresearch-sboss/examples/<name>/
4. Find the primary source for every rate, tier, threshold
5. Implement src/<name>.js (GREEN)
6. Write tests in test/<name>.test.js (real fixtures only)
7. Re-export from index.js
8. Run npm test
9. Update README.md + SOURCES.md
10. Commit with conventional prefix + source citation in body
11. Mark .orchestration/<engine>-done
12. Pick next, repeat
```

## Files you'll touch

| File | Why |
|---|---|
| `src/<name>.js` | The pure-function engine |
| `src/<name>.data.js` | If the engine is pure data (auto-generated tables) |
| `test/<name>.test.js` | Tests with real fixtures |
| `index.js` | Re-export |
| `README.md` | Module table |
| `SOURCES.md` | Primary-source citations |

## Files you must NOT touch

- `src/*.data.js` for already-existing data tables (regions, chart-of-accounts).
  Regenerate from `scripts/gen_*.js` if needed.
- `package.json` `"private": true` flag — this package is not on npm by design.
- `INTEGRATION.md` consumer recipe — changes here break 3+ apps.

## Rules of engagement

- **Cite primary sources in every commit body.** Format:
  ```
  Per ARLIS act 75961 (commercial orgs), 9-class chart with 623 accounts.
  Per SRC decree N 298-Ն, output lines 7-16 / input lines 17-23.
  ```
- **Pure functions only.** No I/O, no network, no filesystem.
- **Real fixtures only.** Use the published sample numbers in test/ files.
- **Coverage ≥80% per touched module.** CI guard.
- **Cross-year rate bumps need a new test fixture** — old + new, both green.

## Environment

- Node ≥ 18. CI matrix: 18, 20, 22.
- `npm install` (zero runtime deps).
- `npm test` to run suite + coverage guard.
- No network access required.

## When to stop

- **Roadmap complete:** `.orchestration/<engine>-done` for every roadmap item.
  Write a one-paragraph summary in `CHANGELOG.md` and declare victory.
- **Rate source ambiguous:** file an issue, do not invent. The seam stays.
- **Coverage drops below 80%:** split the diff.

## Logging

Use conventional commits with `feat(<engine>): add <name> per <source>` or
`fix(<engine>): correct <field> per <source>`.

## Coordination

- **Upstream SBOSS validation:** cross-reference `armosphera/autoresearch-sboss`
  examples for the same engine.
- **Consumer apps:** 3 apps vendor this package (ANT, MAX, sovereign). When you
  change a public API, those apps need re-vendoring. Open coordinated PRs.
- **Sibling RU engine:** if RA and RF have a parallel engine (e.g. payroll), port
  both — RU repo and AM repo.

---

*Companion to `AGENTS.md`. AGENTS.md = rules. This file = day-to-day loop.*