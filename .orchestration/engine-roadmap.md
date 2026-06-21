# Engine roadmap — a1-localization-am

Status checklist. `[x]` = shipped + tests green + SOURCES.md updated + README.md
updated + `.orchestration/<engine>-done` touched.

## Engines shipped (already in src/)

- [x] `localization.js` — ՀՎՀհ validation + AMD money round/format/parse
- [x] `armeniaRegions.js` — 11 marzer
- [x] `armeniaPhone.js` — phone validation, E.164
- [x] `armeniaChartOfAccounts.js` + `.data.js` — 623 accounts / 9 classes
- [x] `einvoice.js` — SRC e-invoice (build XML + validate)
- [x] `vatReturn.js` — VAT return compute + form
- [x] `armeniaPayroll.js` — 2026 gross→net

## Engines to add (roadmap)

- [ ] `pension_am` — dedicated pension fund calculator (currently inside
      armeniaPayroll.js; consider extracting if complexity grows)
- [ ] `insurance_am` — health insurance + military stamp (also inside payroll)
- [ ] `social_contribution_am` — separate from pension
- [ ] `currency_fx.js` — AMD ↔ foreign currency conversion rates (CB RA source)
- [ ] `tax_id_lookup.js` — ՀՎՀհ → entity-name lookup (SRC public registry)

## Tests to add

- [ ] Cross-year rate bump test (2026 → 2027 hypothetical) — both fixtures pass
- [ ] Edge cases for `parseAmd` — locale-tolerant boundary parsing
- [ ] `einvoice.buildEInvoiceXml` schema validation against published XSD samples

## Coordination

- Sibling `A1-Localization-RU` has a parallel roadmap — port both engines when one
  is added.
- `A1-Suite-Local-ANT`, `A1-Suite-Local-MAX`, `A1-AI-ERP-SBOS-MSTUDIO-sovereign`
  vendor this repo under `vendor/a1-localization-am/`. Notify them on
  public-API changes.