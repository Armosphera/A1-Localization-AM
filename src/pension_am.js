"use strict";

/**
 * pension_am.js — Armenian funded pension contribution engine
 *
 * Pure functions for calculating the mandatory funded pension contribution
 * (կուտակային վճար) per RA Tax Code Article 156 + Government Decree N 1332-Ն.
 *
 * PRIMARY SOURCES:
 *   - RA Tax Code, Article 156 (mandatory funded pension contributions)
 *   - RA Government Decree N 1332-Ն (18.09.2014) — pension reform
 *   - arlis.am / profin.am 2026 payroll updates
 *
 * TIERED STRUCTURE (unchanged 2023-2026):
 *   - Low tier (gross ≤ 500,000 AMD/month): 5% of gross
 *   - Middle tier (500,000 < gross ≤ 1,125,000): 10% × gross - 25,000
 *   - High tier (gross > 1,125,000): capped at 87,500 AMD/month
 *
 * The 1,125,000 threshold is 15× the minimum wage (75,000 × 15 = 1,125,000).
 * The cap ensures high earners don't pay disproportionate pension.
 *
 * This module is a clean extraction from src/armeniaPayroll.js::pension()
 * for clarity and to enable pension-specific testing. The original function
 * in armeniaPayroll.js is preserved for backward compatibility; it now
 * delegates to this module.
 */

// ─── 2026 constants ────────────────────────────────────────────────

const PENSION_AM_2026 = Object.freeze({
  // Tier boundaries
  LOW_CEIL: 500_000,         // Low tier ≤ 500k AMD
  CAP_THRESHOLD: 1_125_000,  // Middle tier ≤ 1.125M AMD (15× minimum wage)
  CAP: 87_500,               // High tier capped

  // Tier rates
  LOW_RATE: 5,        // % for low tier
  HIGH_RATE: 10,      // % for middle tier
  HIGH_OFFSET: 25_000, // subtracted in middle tier formula

  // Source citations
  SOURCE: "RA Tax Code Art. 156 + Decree N 1332-Ն (2014) + arlis.am 2026",
});

/**
 * Determine pension contribution for a given monthly gross.
 * Mirrors the original armeniaPayroll.pension() function exactly.
 *
 * @param {number} monthlyGross - monthly gross pay in AMD
 * @returns {number} - monthly pension contribution in AMD (whole AMD)
 */
function pensionAmTier(monthlyGross) {
  const g = Number(monthlyGross);
  if (!Number.isFinite(g) || g <= 0) return 0;
  if (g <= PENSION_AM_2026.LOW_CEIL) {
    // Low tier: 5% of gross
    return Math.round(g * PENSION_AM_2026.LOW_RATE) / 100;
  }
  if (g <= PENSION_AM_2026.CAP_THRESHOLD) {
    // Middle tier: 10% × g - 25,000 (Math.round to whole AMD per ARLIS rules)
    return Math.round((g * PENSION_AM_2026.HIGH_RATE) / 100) - PENSION_AM_2026.HIGH_OFFSET;
  }
  // High tier: capped
  return PENSION_AM_2026.CAP;
}

/**
 * Compute monthly pension contribution. Same as pensionAmTier but with
 * explicit input validation.
 *
 * @param {object} opts
 * @param {number} opts.monthlyGross - monthly gross pay in AMD
 * @returns {number} - monthly pension contribution in AMD
 */
function pensionAmMonthly(opts) {
  if (!opts || typeof opts !== "object") {
    throw new TypeError("pension_am: opts must be an object");
  }
  const g = Number(opts.monthlyGross);
  if (!Number.isFinite(g)) {
    throw new TypeError("pension_am: monthlyGross must be a finite number");
  }
  return pensionAmTier(g);
}

/**
 * Compute annual pension contribution over N months.
 *
 * @param {number|number[]} monthlyGross - monthly gross pay (or array of N monthly pays)
 * @param {number} [months=12] - number of months (when monthlyGross is a single value)
 * @returns {number} - total annual pension contribution in AMD
 */
function pensionAmAnnual(monthlyGross, months) {
  // If array, sum over all entries
  if (Array.isArray(monthlyGross)) {
    return monthlyGross.reduce((sum, g) => sum + pensionAmTier(g), 0);
  }
  // Single value × months
  const m = months !== undefined ? months : 12;
  if (!Number.isFinite(m) || m < 0) {
    throw new RangeError("pension_am: months must be a non-negative number");
  }
  return pensionAmTier(monthlyGross) * m;
}

module.exports = {
  PENSION_AM_2026,
  pensionAmTier,
  pensionAmMonthly,
  pensionAmAnnual,
};