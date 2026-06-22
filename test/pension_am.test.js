"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const {
  PENSION_AM_2026,
  pensionAmMonthly,
  pensionAmAnnual,
  pensionAmTier,
} = require("../src/pension_am");

test("PENSION_AM_2026: tier constants match armeniaPayroll.js", () => {
  // Per RA Government Decree N 1332-Ն (2014) and RA Tax Code amendments
  // (effective 2023-2026), funded pension is tiered:
  //   - 5% if monthly gross ≤ 500,000 AMD
  //   - 10% - 25,000 if monthly gross ∈ (500,000, 1,125,000]
  //   - 87,500 (capped) if monthly gross > 1,125,000 AMD
  //
  // Sources:
  //   - RA Tax Code, Article 156 (mandatory funded pension contributions)
  //   - RA Government Decree N 1332-Ն (18.09.2014) — pension reform
  //   - arlis.am / profin.am 2026 updates
  //
  // The 2026 numbers are unchanged from 2023-2025. The 1,125,000 threshold
  // is 15× minimum wage (75,000 AMD × 15).
  assert.equal(PENSION_AM_2026.LOW_CEIL, 500_000);
  assert.equal(PENSION_AM_2026.CAP_THRESHOLD, 1_125_000);
  assert.equal(PENSION_AM_2026.CAP, 87_500);
  assert.equal(PENSION_AM_2026.LOW_RATE, 5);     // %
  assert.equal(PENSION_AM_2026.HIGH_RATE, 10);   // %
  assert.equal(PENSION_AM_2026.HIGH_OFFSET, 25_000);
});

test("pensionAmTier: low tier (≤ 500k) = 5%", () => {
  assert.equal(pensionAmTier(0), 0);
  assert.equal(pensionAmTier(100_000), 5_000);   // 5% of 100k
  assert.equal(pensionAmTier(500_000), 25_000);  // 5% at low ceiling
});

test("pensionAmTier: middle tier (500k < g ≤ 1.125M) = 10% - 25k", () => {
  assert.equal(pensionAmTier(500_001), 25_000);  // ≈ 10%*500001/100 - 25k = 25000.1 → rounded
  assert.equal(pensionAmTier(800_000), 55_000);  // 80k - 25k
  assert.equal(pensionAmTier(1_125_000), 87_500); // at cap threshold
});

test("pensionAmTier: high tier (> 1.125M) capped at 87,500", () => {
  assert.equal(pensionAmTier(1_125_001), 87_500);
  assert.equal(pensionAmTier(2_000_000), 87_500);
  assert.equal(pensionAmTier(10_000_000), 87_500);
});

test("pensionAmTier: continuous at 500k boundary", () => {
  // Per Decree N 1332-Ն, the boundary should be smooth (no jump)
  const low = pensionAmTier(500_000);
  const justAbove = pensionAmTier(500_001);
  // Difference should be ≤ 1 AMD (rounding tolerance)
  assert.ok(Math.abs(justAbove - low) <= 1, `jump: ${low} → ${justAbove}`);
});

test("pensionAmMonthly: matches armeniaPayroll.pension() for 6 fixtures", () => {
  // Mirrors the existing armeniaPayroll test fixtures
  assert.equal(pensionAmMonthly({ monthlyGross: 300_000 }), 15_000);
  assert.equal(pensionAmMonthly({ monthlyGross: 500_000 }), 25_000);
  assert.equal(pensionAmMonthly({ monthlyGross: 800_000 }), 55_000);
  assert.equal(pensionAmMonthly({ monthlyGross: 1_000_000 }), 75_000);
  assert.equal(pensionAmMonthly({ monthlyGross: 1_125_000 }), 87_500);
  assert.equal(pensionAmMonthly({ monthlyGross: 2_000_000 }), 87_500);
});

test("pensionAmMonthly: handles zero / negative", () => {
  assert.equal(pensionAmMonthly({ monthlyGross: 0 }), 0);
  assert.equal(pensionAmMonthly({ monthlyGross: -1 }), 0);
});

test("pensionAmMonthly: throws on invalid input", () => {
  assert.throws(() => pensionAmMonthly(null), /opts must be an object/);
  assert.throws(() => pensionAmMonthly({ monthlyGross: "abc" }), /finite number/);
});

test("pensionAmAnnual: 12 × monthly + cap behavior", () => {
  // For a constant monthly pay, pension = 12 × monthly amount
  const annual = pensionAmAnnual(300_000, 12);
  assert.equal(annual, 15_000 * 12); // 180,000

  // For low-pay 12 months, total annual pension is 12 × 5% × 300,000
  const annualLow = pensionAmAnnual(100_000, 12);
  assert.equal(annualLow, 5_000 * 12); // 60,000
});

test("pensionAmAnnual: handles variable monthly pay", () => {
  // 6 months @ 100k + 6 months @ 200k → annual
  const annual = pensionAmAnnual([100_000, 100_000, 100_000, 100_000, 100_000, 100_000, 200_000, 200_000, 200_000, 200_000, 200_000, 200_000], 12);
  // Low tier: 6 * 5% * 100k = 30,000
  // Low tier: 6 * 5% * 200k = 60,000
  // Total: 90,000
  assert.equal(annual, 90_000);
});
