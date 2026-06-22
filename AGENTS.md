# AGENTS.md — A1-Localization-AM (Armenian fiscal engines)

This file applies to every agent (human or AI) that touches the
`armosphera/A1-Localization-AM` repository. It extends, and never weakens, the global
rules in `https://github.com/Armosphera/A1-portfolio/blob/main/LICENSING.md`.

## 1. What this repo is

`a1-localization-am` is the **Armenian (RA) localization + fiscal engines** — the
single source of truth for Republic-of-Armenia fiscal logic across the entire A1
product family:

- ՀՎՀհ (taxpayer ID) validation, AMD money round/format/parse
- 11 marzer (10 provinces + Yerevan), Armenian phone E.164
- 623-account chart of accounts (RA MoF order 75961)
- SRC e-invoice XML (decree N 298-Ն / arlis.am 136996)
- VAT return (cross-foot tie-out, integer/non-negative checks)
- 2026 payroll (income tax 20%, funded pension tiers, military stamp 1,000 AMD flat, health 10,800 AMD flat)

**This is regulatory territory. Wrong numbers are tax liabilities.**

## 2. Source-available, NOT on npm

This package is consumed via **vendoring** (copy `index.js` + `src/` into a
`vendor/a1-localization-am/` directory in the consumer repo). The full recipe is in
`INTEGRATION.md`.

- Consumers: `armosphera/A1-Suite-Local-ANT`, `armosphera/A1-Suite-Local-MAX`,
  `armosphera/A1-AI-ERP-SBOS-MSTUDIO-sovereign`, `armosphera/SBOS-A1-ERP`
- Vendor locations: `server/vendor/a1-localization-am/` (ANT), `packages/.../vendor/...` (MAX)
- **Never edit a vendored copy in place.** Fix upstream here, then re-vendor.

## 3. Workflow — Test-Driven Development (TDD)

**Mandatory for every non-trivial change.**

1. Write the test first (RED) in `test/<name>.test.js`. Use real RA registry numbers
   (e.g. ՀՎՀհ `00123456`, real e-invoice fixtures from `examples/`) — never synthetic.
2. Run `npm test` and confirm it fails for the right reason.
3. Write the minimum implementation in `src/<name>.js` (GREEN).
4. Re-export from `index.js`.
5. Run `npm test` and confirm green.
6. Update README module table.
7. Commit with conventional prefix.

## 4. The 2 files you must NOT edit

- **`*.data.js`** — pure data tables (chart of accounts, regions, etc.). They are
  regenerated from primary sources via `scripts/gen_*_data.js`. To update, fix the
  generator, not the data file.
- **`index.js` exports section for `experimental/` modules** — those are incubating.
  Move to root exports only after a stable release tag.

## 5. Coverage Floor — 80%

- Unit tests in `test/` (`node --test`), measured per touched module.
- CI runs across Node 18, 20, 22 (matrix in `.github/workflows/ci.yml`).
- Coverage check: every non-`*.data.js` `src/*.js` must have a corresponding test file
  (enforced by CI guard).

## 6. Conventional Commits

```
<type>(<scope>): <description>

<optional body> — must cite the regulatory source if touching fiscal logic
```

Allowed types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf`, `ci`, `build`.
- Subject line ≤72 chars, imperative mood, no trailing period.
- Body explains **why**, and **cites the official source** (e.g. "ARLIS act 75961",
  "SRC decree N 298-Ն", "2025-12 amendment to military stamp duty") when touching
  VAT rates, payroll tiers, or chart-of-accounts structure.

## 7. No Hardcoded Secrets

- API keys, customer data, real taxpayer IDs (other than published test fixtures)
  must never appear in source or tests.
- Public test fixtures (e.g. government-published sample numbers) are OK with citation.

## 8. Porting over Net-New Invention

`src/` modules are pure ports from official RA publications. **Before** writing a new
fiscal engine, search the RA MoF / SRC / ARLIS corpus for the authoritative formula.
Cite it in the commit body. If the formula is ambiguous, **stop and ask** — guessing
on fiscal code is a tax liability.

## 9. Files, Functions, Nesting

- One concept per file. Pure functions only — no I/O, no network, no filesystem.
- Functions: <50 lines, single responsibility.
- No nesting deeper than 4 levels. Prefer early returns.

## 10. JavaScript Discipline

- Zero runtime dependencies. CommonJS.
- Node ≥ 18 (engines in `package.json`). CI runs across node 18/20/22.
- Test runner: `node --test --test-concurrency=4 [--test-timeout=60000]` (the
  `--test-timeout` flag is Node 20+ only; CI guards).
- No TypeScript, no transpilation. Plain ES2022 + CommonJS.

## 11. No Debug Noise in Shipped Code

- `console.log` is for development only.
- No commented-out code in PRs.

## 12. Local-First, Offline-Capable

This repo runs in a sovereign context — every downstream consumer is air-gapped.

- No outbound network calls at runtime.
- No telemetry, no auto-update checks.
- All fixtures are real public-record numbers.

## 13. CLI Binaries

The CLI binary `ra-localization` (in `package.json` `bin`) provides offline accountant
tools (`hvhh`, `payroll`, `vat-return`, `einvoice`). Never add flags that require
network access. Output is plain JSON or human-readable text.

## 14. Question Before Damage

If an instruction is ambiguous and a wrong move would publish wrong tax rates, break
3+ consumer apps, or rewrite a lot of working code, **ask first**. Otherwise, prefer
momentum: small, reversible, well-tested steps.

## 15. Day-One Checklist

```
1. cat AGENTS.md             # this file
2. cat README.md             # install + quick start
3. cat INTEGRATION.md        # vendor recipe (consumers read this)
4. cat SOURCES.md            # regulatory citations
5. ls src/                   # note *.data.js is auto-generated
6. npm install && npm test   # confirm baseline green
7. Now edit.
```

If `npm test` baseline fails on a fresh clone: STOP, file an issue.

---

*Adapted from `armosphera/SBOS-A1-ERP/AGENTS.md`. Sibling: `A1-Localization-RU`.*
*License: Proprietary (`LicenseRef-Armosphera-Proprietary`). See `LICENSE`.*