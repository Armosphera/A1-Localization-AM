#!/usr/bin/env node
/**
 * evals/karpathy/pension-am-tier-boundary/check.js
 *
 * Locks the Armenian funded pension tier-boundary contract per RA Tax Code
 * Art. 156 + Government Decree N 1332-Ն. Fails if:
 *   - PENSION_AM_2026 constants (LOW_CEIL, CAP_THRESHOLD, CAP, LOW_RATE, HIGH_RATE) change
 *   - pensionAmTier() returns wrong values at the 3 tier boundaries
 *   - pensionAmTier() returns wrong values in the middle of each tier
 *   - pensionAmTier() is not continuous at the tier boundaries
 *   - pensionAmMonthly() / pensionAmAnnual() don't match pensionAmTier()
 *
 * Sources:
 *   - RA Tax Code, Art. 156 (mandatory funded pension contributions)
 *   - RA Government Decree N 1332-Ն (18.09.2014) — pension reform
 *   - arlis.am / profin.am 2026 payroll updates
 *
 * Exit 0 = pass. Non-zero = contract drift.
 *
 * Run:
 *   node evals/karpathy/pension-am-tier-boundary/check.js
 */

"use strict";

const path = require("path");
const {
  PENSION_AM_2026,
  pensionAmTier,
  pensionAmMonthly,
  pensionAmAnnual,
} = require(path.join(__dirname, "..", "..", "..", "src", "pension_am"));

let failed = false;
function check(name, expected, actual) {
  if (expected === actual) {
    console.log(`✓ ${name}: ${expected}`);
    return true;
  }
  console.error(`✗ ${name}: expected ${expected}, got ${actual}`);
  failed = true;
  return false;
}

// ─── 1. Tier constants (per RA Tax Code Art. 156) ───────────────

check("PENSION_AM_2026.LOW_CEIL", 500_000, PENSION_AM_2026.LOW_CEIL);
check("PENSION_AM_2026.CAP_THRESHOLD", 1_125_000, PENSION_AM_2026.CAP_THRESHOLD);
check("PENSION_AM_2026.CAP", 87_500, PENSION_AM_2026.CAP);
check("PENSION_AM_2026.LOW_RATE", 5, PENSION_AM_2026.LOW_RATE);
check("PENSION_AM_2026.HIGH_RATE", 10, PENSION_AM_2026.HIGH_RATE);
check("PENSION_AM_2026.HIGH_OFFSET", 25_000, PENSION_AM_2026.HIGH_OFFSET);

// CAP_THRESHOLD must be 15x minimum wage (75,000 × 15 = 1,125,000)
const minWage = PENSION_AM_2026.CAP_THRESHOLD / 15;
check("CAP_THRESHOLD is 15x minimum wage (75,000)", 75_000, minWage);

// Tier sum: 22+5.1+2.9 = 30 (RA unified social insurance)
const tierSum = PENSION_AM_2026.LOW_RATE + PENSION_AM_2026.HIGH_RATE;
check("tier sum (sanity)", 15, tierSum); // not 30 — pension is 22% of 30%, but pension_am only stores 5% low + 10% high

// ─── 2. pensionAmTier at boundaries ──────────────────────────────

// Zero / negative
check("pensionAmTier(0) = 0 (zero gross)", 0, pensionAmTier(0));
check("pensionAmTier(-1) = 0 (negative gross)", 0, pensionAmTier(-1));
check("pensionAmTier(NaN) = 0 (NaN gross)", 0, pensionAmTier(NaN));

// Low tier (≤ 500,000) = 5%
check("pensionAmTier(100_000) = 5% of 100k = 5,000", 5_000, pensionAmTier(100_000));
check("pensionAmTier(300_000) = 5% of 300k = 15,000", 15_000, pensionAmTier(300_000));
check("pensionAmTier(500_000) = 5% at low ceiling = 25,000", 25_000, pensionAmTier(500_000));

// Middle tier (500k < g ≤ 1.125M) = 10% - 25,000
check("pensionAmTier(500_001) ≈ 25,000 (just above low ceiling)", 25_000, pensionAmTier(500_001));
check("pensionAmTier(800_000) = 80,000 - 25,000 = 55,000", 55_000, pensionAmTier(800_000));
check("pensionAmTier(1_000_000) = 100,000 - 25,000 = 75,000", 75_000, pensionAmTier(1_000_000));
check("pensionAmTier(1_125_000) = at cap threshold = 87,500", 87_500, pensionAmTier(1_125_000));

// High tier (> 1.125M) = capped at 87,500
check("pensionAmTier(1_125_001) = just above cap = 87,500", 87_500, pensionAmTier(1_125_001));
check("pensionAmTier(2_000_000) = capped at 87,500", 87_500, pensionAmTier(2_000_000));
check("pensionAmTier(10_000_000) = capped at 87,500", 87_500, pensionAmTier(10_000_000));

// ─── 3. pensionAmTier continuity at boundaries ─────────────────

// At LOW_CEIL: low tier (5% × 500_000 = 25,000)
// At LOW_CEIL + 1: middle tier (10% × 500_001 / 100 - 25,000 = 25_000.1 → rounded 25_000)
const lowAtCeil = pensionAmTier(500_000);
const justAboveLow = pensionAmTier(500_001);
if (Math.abs(justAboveLow - lowAtCeil) > 1) {
  console.error(`✗ pensionAmTier discontinuity at 500k: ${lowAtCeil} → ${justAboveLow}`);
  failed = true;
} else {
  console.log(`✓ pensionAmTier continuous at 500k boundary (${lowAtCeil} → ${justAboveLow}, diff ≤ 1)`);
}

// At CAP_THRESHOLD: middle tier (10% × 1_125_000 / 100 - 25_000 = 87,500)
// At CAP_THRESHOLD + 1: high tier (capped 87,500)
const atCap = pensionAmTier(1_125_000);
const justAboveCap = pensionAmTier(1_125_001);
if (atCap !== justAboveCap) {
  console.error(`✗ pensionAmTier discontinuity at 1.125M: ${atCap} → ${justAboveCap}`);
  failed = true;
} else {
  console.log(`✓ pensionAmTier continuous at 1.125M cap (${atCap} = ${justAboveCap})`);
}

// ─── 4. pensionAmMonthly matches pensionAmTier ──────────────────

check("pensionAmMonthly({g:300k}) == pensionAmTier(300k)", pensionAmTier(300_000), pensionAmMonthly({ monthlyGross: 300_000 }));
check("pensionAmMonthly({g:800k}) == pensionAmTier(800k)", pensionAmTier(800_000), pensionAmMonthly({ monthlyGross: 800_000 }));
check("pensionAmMonthly({g:2M}) == pensionAmTier(2M)", pensionAmTier(2_000_000), pensionAmMonthly({ monthlyGross: 2_000_000 }));

// ─── 5. pensionAmAnnual aggregation ────────────────────────────

check("pensionAmAnnual(300k, 12) = 12 × 5% × 300k = 180,000", 180_000, pensionAmAnnual(300_000, 12));
check("pensionAmAnnual(2M, 12) = 12 × 87,500 = 1,050,000", 1_050_000, pensionAmAnnual(2_000_000, 12));

// Variable monthly pay
const variable = pensionAmAnnual([100_000, 100_000, 500_000, 500_000], 4);
// 2 × 5% × 100k = 10,000
// 2 × (10% × 500k - 25,000) = 2 × 25,000 = 50,000
// Total: 60,000
check("pensionAmAnnual([100k, 100k, 500k, 500k]) = 60,000", 60_000, variable);

// ─── 6. Sovereignty constraint (offline) ────────────────────────

// pensionAm has no I/O, no network, no filesystem
// The fact that it requires only the math is the contract.
const src = require("fs").readFileSync(
  path.join(__dirname, "..", "..", "..", "src", "pension_am.js"),
  "utf8"
);
const hasNetwork = /\brequire\s*\(\s*['"](http|https|net|fetch)['"]/i.test(src);
if (hasNetwork) {
  console.error(`✗ pension_am.js has forbidden network require`);
  failed = true;
} else {
  console.log("✓ pension_am.js has no network require (sovereign/offline-capable)");
}

const hasFs = /\brequire\s*\(\s*['"]fs['"]/i.test(src);
if (hasFs) {
  console.error(`✗ pension_am.js has fs require (should be pure)`);
  failed = true;
} else {
  console.log("✓ pension_am.js has no fs require (pure functions only)");
}

// ─── Result ────────────────────────────────────────────────────────

if (failed) {
  console.log("\n✗ pension-am-tier-boundary contract violations detected.");
  process.exit(1);
} else {
  console.log("\n✓ All pension-am-tier-boundary contract checks pass.");
  process.exit(0);
}
