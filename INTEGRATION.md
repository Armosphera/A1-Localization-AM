# Integrating `a1-localization-am` into an A1 product

`a1-localization-am` is the shared, dependency-free Armenian (RA) fiscal core for
the A1 product family. Every module is a pure function library — no network, no
filesystem, no framework. See [README.md](./README.md) for the API + official sources.

This guide is the per-product consumption recipe used by the A1 suite.

## 1. Vendor it (current approach)

The family products are separate repos (no monorepo) and are local-first /
self-hostable, so this package is **vendored** rather than installed from a
registry — mirroring `a1-ai`. This avoids touching a shared `node_modules` and
keeps deploys self-contained.

```bash
mkdir -p <repo>/<server|lib|src>/vendor/a1-localization-am/src
cp A1-Localization-AM/index.js  <repo>/.../vendor/a1-localization-am/index.js
cp A1-Localization-AM/src/*.js  <repo>/.../vendor/a1-localization-am/src/
```

Record the source commit in a `VENDOR.md` next to it; re-vendor (copy + bump the
commit) when this package changes. **Do not edit the vendored copy in place — fix
upstream here and re-vendor**, or the drift this package exists to remove comes back.

> Alternative for a future ESM/bundled product: `npm install` from git, or generate a
> UMD/browser build (see the HayHashvapah note below).

## 2. Use it (namespaces)

```js
const loc = require("./vendor/a1-localization-am");        // server / CommonJS
const { vatReturn, einvoice, payroll } = loc;
```

| Need | Call |
|------|------|
| Validate a taxpayer ՀՎՀՀ | `loc.localization.validateHvhh(id)` |
| Round / parse / format AMD | `loc.localization.{roundAmd, parseAmd, formatAmd}` |
| Marz lookup | `loc.regions.findRegion(codeOrName)` |
| Phone validate / normalize | `loc.phone.{isValidArmenianPhone, e164, formatPhone}` |
| Chart-of-accounts lookup | `loc.chartOfAccounts.{accountByCode, normalBalance, ACCOUNT_CLASSES, STANDARD_ACCOUNTS}` |
| Gross→net payroll (2026) | `loc.payroll.computePayroll(gross)` |
| VAT return + official form | `loc.vatReturn.{computeVatReturn, vatReturnForm, validateVatReturnForm}` |
| SRC e-invoice | `loc.einvoice.{buildEInvoiceXml, validateEInvoice}` |

**Recommended shim pattern.** Make each `<repo>/server/<engine>.js` a one-liner
`module.exports = require("./vendor/a1-localization-am").<namespace>;` so existing
relative requires keep working with zero churn. Add a wiring test asserting each shim
`===` the vendored namespace (catches a broken/partial re-vendor).

### Notes that bite

- **Server / CommonJS only.** Every module is CommonJS with no browser global. To use
  it client-side (e.g. HayHashvapah's PWA, which loads `*.shared.js` via `<script>` +
  service-worker precache and calls `window.HHV*`), first produce a UMD/bundled build
  that re-exposes the expected globals — the raw `src/*.js` cannot be `<script>`-loaded.
- **Payroll API shape.** `computePayroll(gross)` returns `{ …, net, totalWithholdings }`
  and is not configurable. Products with a per-tenant config or a different field shape
  (e.g. HayHashvapah's `calculatePayroll(gross, { config })` → `totalDeductions`) need a
  thin adapter; the underlying 2026 values are identical.
- **Fix upstream first.** The hardening backlog + audit findings are reconciled **here**,
  not in each consumer's copy.

## Consumers

- **A1 Suite** (`A1-Suite-Local`) — vendored at `server/vendor/a1-localization-am/`;
  seven `server/<engine>.js` shims; HTTP surface via `server/localizationRoutes.js`.
- **HayHashvapah** (`A1-SMB-HH-HY`) — convergence target; still on its in-tree UMD
  `*.shared.js` lineage pending a browser build of this package (see note above).
