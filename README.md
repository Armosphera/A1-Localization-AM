# A1-Localization-AM

**Armenian (Republic of Armenia) localization + fiscal engines.** Pure,
dependency-free JavaScript modules that encode RA-specific correctness:
taxpayer IDs, the dram, regions, phone numbers, the statutory chart of
accounts, SRC e-invoicing, the VAT return, and payroll withholdings.

This is the single source of truth extracted from the A1 suite so that
**A1 Suite**, **HayHashvapah**, and any future product share one audited
implementation instead of drifting copies. (Sibling to `A1-AI-Core`, which
does the same for the AI layer.)

> ⚠️ **Tax software, handle with care.** These engines compute real fiscal
> obligations. Rules are sourced from official RA publications (cited below)
> and covered by tests, but they are **not a substitute for a licensed
> accountant**. Where a rule could not be confirmed from a primary source it
> is left as an explicit, documented seam rather than guessed — see
> [Known seams](#known-seams).

## Install / use

Zero runtime dependencies. Requires Node ≥ 18 (uses the built-in test runner).

```js
const { localization, vatReturn, einvoice, payroll, chartOfAccounts } =
  require("a1-localization-am");

localization.validateHvhh("00123456");      // → { ok, normalized, error }
localization.roundAmd(1234.6);              // → 1235  (whole dram)
payroll.computePayroll(600000);             // → { incomeTax, pension, stamp, health, net, ... }
chartOfAccounts.accountByCode("226");       // → { code, name, class, ... } (input VAT)
einvoice.validateEInvoice(account, invoice);// → { ok, errors:[{code,message}] }
vatReturn.vatReturnForm(period);            // → { lines, source, lineDefinitions }
```

There is also an **offline CLI** (no server, no network) for accountants:

```
npx ra-localization hvhh 00123456
npx ra-localization payroll 600000
npx ra-localization vat-return period.json
npx ra-localization einvoice invoice.json
```

## Modules (`src/`)

| Module | Responsibility |
|--------|----------------|
| `localization.js` | ՀՎՀՀ (8-digit taxpayer ID) validation; AMD money: `roundAmd` (lenient, whole-dram), `formatAmd`, and `parseAmd` — a strict, locale-tolerant boundary parser returning `{ok, amount, error}` that fails loud on bad input. |
| `armeniaRegions.js` | The 11 marzer (10 provinces + Yerevan) — lookup by code or name. |
| `armeniaPhone.js` | Armenian phone validation, E.164 normalization, display formatting. |
| `armeniaChartOfAccounts.js` + `.data.js` | The **623-account, 9-class** RA chart of accounts; leading digit ⇒ class ⇒ normal balance. |
| `einvoice.js` | SRC e-invoice (հաշիվ-ապրանքագիր): `buildEInvoiceXml` (emits mandatory `Գործարքի տեսակ` / transaction type, buyer ՀՎՀՀ or passport) + `validateEInvoice`, a fail-closed compliance gate. |
| `vatReturn.js` | The unified VAT/excise return: `computeVatReturn`, `vatReturnForm` mapped to the **official line numbers**, and `validateVatReturnForm` (cross-foot tie-out, integer/non-negative checks). |
| `pension_am.js` | Հայաստանի funded pension (RA Tax Code Art. 156 + Decree N 1332-Ն): tiered (5% / 10%−25k / capped 87,500) per Decree N 1332-Ն. Pure functions, whole AMD rounding. |
| `armeniaPayroll.js` | 2026 gross→net: income tax 20%, tiered funded pension, flat military stamp duty, mandatory health insurance. |

## Consumed by

This repo is the **source of truth**; products consume it by **vendoring** (copy
`index.js` + `src/` into a `vendor/` dir, require by relative path — not an npm
dependency, to keep the local-first / self-hostable model). See
[INTEGRATION.md](./INTEGRATION.md) for the recipe.

| Product | Status |
|---------|--------|
| **A1 Suite** (`A1-Suite-Local`) | ✅ Vendored at `server/vendor/a1-localization-am/`; seven `server/<engine>.js` re-export shims; mounted via `server/localizationRoutes.js`. |
| **HayHashvapah** (`A1-SMB-HH-HY`) | ⏳ Convergence target — still on its in-tree UMD `*.shared.js` lineage. Needs a UMD/browser build first (its fiscal modules load in the browser PWA). Server-side adoption can land behind a thin payroll adapter. |
| Future A1 products | Vendor as above. |

> **Fixes land here first**, then re-vendor into consumers — patching a vendored copy
> re-introduces the drift this extraction removed.

## Official sources

- **Chart of accounts** — RA MoF order, [arlis.am/acts/75961](https://www.arlis.am/hy/acts/75961) (commercial orgs). 623 accounts / 9 classes.
- **VAT return** — SRC decree **N 298-Ն**, [arlis.am/acts/136996](https://www.arlis.am/hy/acts/136996). Output/credit lines 7–16 (7 = 20%, 9 = 16.67% imputed, 12 = 0% art.65, 13 = exempt art.64, 16 = total credit); input/debit 17–23 (17 imports, 18 domestic, 21 total debit, 23 = net). Whole AMD; empty cell = 0.
- **E-invoicing** — SRC [User Guide PDF](https://e-invoice.taxservice.am/help/eInvoicingUserGuide.pdf); system at [e-invoice.taxservice.am](https://e-invoice.taxservice.am/invoice-homepage/). `Գործարքի տեսակ` mandatory since 2025-03-01. No public XSD — build a structured export and map client-side.
- **Payroll (2026)** — income tax flat 20%; funded pension ≤500k → 5%, ≤1,125,000 → 10%−25,000, else 87,500 cap; military stamp duty **flat 1,000/mo** (the Dec-2025 revision replacing the old 1,500/3,000/5,500/8,500 tiers); mandatory health insurance premium 10,800/mo.

## Known seams

- **Payroll — social-package employees.** Health-insurance deduction lines
  model the general case (4,800 net for 200,001–500,000 gross, = 10,800 premium
  − ~6,000 state reimbursement; 10,800 above 500k). State "social-package"
  staff (education/culture/social-protection) receive **no** reimbursement and
  therefore net lower. This case is **not modeled** — confirm against
  arlis.am ՀՕ-459-Ն with an accountant before relying on it for that cohort.
- **E-invoice XSD.** RA publishes no public schema; `buildEInvoiceXml`
  produces a structured pre-upload draft, not a signed final document.

## Testing

```
npm test
```

Pure-function unit tests via the Node built-in runner (capped concurrency to
stay light on constrained machines). No server boot, no database, no network.

## Karpathy evals

This repo can run A1 product-research eval lanes through the shared
`../../A1-AI-Core` runner in the local Armosphera workspace:

```
node scripts/karpathy-eval.mjs --list
node scripts/karpathy-eval.mjs --program vat-return-contract
node scripts/karpathy-eval.mjs --run vat-return-contract
```

The `vat-return-contract` lane verifies the Armenian VAT-return engine:
period totals, official form-line mapping, payable/recoverable reconciliation,
fail-closed form validation, whole-dram constraints, and rate-sanity guards.
