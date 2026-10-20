/**
 * Sum of integers from 1 through n (inclusive).
 * Assumption: n <= 0 denotes an empty range and returns 0.
 * All implementations share the same contract and reject unsafe results.
 */
const MAX_N = 134_217_727;
function assertInput(n) {
  if (!Number.isSafeInteger(n)) throw new TypeError('n must be a safe integer.');
  if (n > MAX_N) throw new RangeError('The sum must be a safe integer.');
}

/** Iteration: O(n) time, O(1) additional space. */
export function sum_to_n_a(n) {
  assertInput(n);
  let total = 0;
  for (let value = 1; value <= n; value += 1) total += value;
  return total;
}

/** Arithmetic progression: O(1) time and space. Divide first for safe intermediates. */
export function sum_to_n_b(n) {
  assertInput(n);
  if (n <= 0) return 0;
  return n % 2 === 0 ? (n / 2) * (n + 1) : n * ((n + 1) / 2);
}

/**
 * Divide and conquer: O(log n) time and stack space.
 * S(2k) = 2*S(k) + k*k; S(2k+1) = S(2k) + 2k+1.
 * Only one recursive call per level; no array allocation or linear-depth recursion.
 */
export function sum_to_n_c(n) {
  assertInput(n);
  function sum(value) {
    if (value <= 0) return 0;
    const half = Math.floor(value / 2);
    const evenSum = 2 * sum(half) + half * half;
    return value % 2 === 0 ? evenSum : evenSum + value;
  }
  return sum(n);
}
