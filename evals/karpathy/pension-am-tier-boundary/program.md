# pension-am-tier-boundary

Locks the **Armenian funded pension tier-boundary contract** per
RA Tax Code Art. 156 + Government Decree N 1332-Ն. Fails if:
the tier constants, tier boundaries, or pension computation drift
from the regulatory source.

## Why this matters

This is **regulatory territory**. Wrong numbers are tax liabilities
(per `AGENTS.md` §1). The pension formula has 3 tiers with different
math — a bug at the boundary (e.g. off-by-one at 500,000 or 1,125,000)
would silently mis-withhold for thousands of Armenian employees.

## What's frozen

### Tier constants (per RA Tax Code Art. 156 + Decree N 1332-Ն)

| Constant | Value | Rationale |
|----------|-------|-----------|
| `LOW_CEIL` | 500,000 AMD | Low tier ≤ 500k |
| `CAP_THRESHOLD` | 1,125,000 AMD | 15× minimum wage (75,000 × 15) |
| `CAP` | 87,500 AMD | High tier cap |
| `LOW_RATE` | 5% | Low tier rate |
| `HIGH_RATE` | 10% | Middle tier rate |
| `HIGH_OFFSET` | 25,000 AMD | Subtracted in middle tier formula |

### Tier formulas

- **Low tier** (gross ≤ 500,000): 5% × gross
- **Middle tier** (500k < gross ≤ 1.125M): 10% × gross - 25,000
- **High tier** (gross > 1.125M): capped at 87,500

### Continuous at boundaries (no jump)

- At 500,000 → 500,001: pension stays at ~25,000 (Math.round)
- At 1,125,000 → 1,125,001: pension stays at 87,500 (cap)

### Sovereignty (offline)

- pension_am.js has **no network require** (`http`/`https`/`net`/`fetch`)
- pension_am.js has **no fs require** (pure functions only)
- All computation is local, no I/O

## Allowed changes (additive only)

- Adding new test fixtures to the check.js
- Adding new exported helpers (must also be pure)
- Bumping the year in `PENSION_AM_2026` (e.g. `PENSION_AM_2027`)

## Disallowed changes

- Changing tier boundaries (`LOW_CEIL`, `CAP_THRESHOLD`, `CAP`)
- Changing tier rates (`LOW_RATE`, `HIGH_RATE`, `HIGH_OFFSET`)
- Discontinuities at boundaries
- Adding I/O (network, filesystem, environment reads)

## Run

```bash
node evals/karpathy/pension-am-tier-boundary/check.js
```

## Source

- `src/pension_am.js` (the contract surface)
- `RA Tax Code, Art. 156` (mandatory funded pension contributions)
- `RA Government Decree N 1332-Ն` (18.09.2014) — pension reform
- `arlis.am` / `profin.am` 2026 payroll updates
- `SOURCES.md` (regulatory citations)

## Consumers

- `armosphera/A1-Localization-AM` (vendored by ANT, MAX, sovereign, SBOS-A1-ERP)
- Pension computation flows from `armeniaPayroll.js::pension()` (which now delegates to `pension_am.js`)
- 146/146 unit tests pass + this lane pass = 100% green