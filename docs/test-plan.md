# Verification and test rationale

Problem1 contains only its JavaScript solution; problem2 has its own `npm run check`. Problem3 is a written review with suggested checks, without a test runner.

## Web contracts

| Risk                 | Scenario                                                 | Expected behavior                                          |
| -------------------- | -------------------------------------------------------- | ---------------------------------------------------------- |
| Meaningless submit   | Type/edit amount                                         | No conversion calculation; output stays blank              |
| Explicit calculation | Click Calculate swap or press Enter                      | Receive amount, rate and USD equivalents appear            |
| Stale output         | Edit amount/pair, refresh or update cached prices        | Old result is invalidated; another click is required       |
| Invalid amount       | Empty, negative, exponent, precision overflow            | Validation and disabled calculation                        |
| Dust                 | Amount yields less than 0.00000001 received              | Error only after requesting calculation                    |
| Numeric precision    | Large accepted amount and fractional prices              | Eight-decimal result agrees with independent BigInt oracle |
| Invalid rates        | NaN, infinity, zero, negative                            | No unusable result                                         |
| API data             | Corrupt payload/records, duplicate currencies/timestamps | Latest valid record or explicit error                      |
| Failed request       | Rejection followed by Retry                              | Error recovers without auto-calculation                    |
| Cancellation         | Abort query                                              | Signal reaches fetch adapter                               |
| Debounce             | Rapid input under StrictMode, unmount                    | Final value wins; timer cleared                            |
| Selector             | Case/whitespace search, no matches, opposite token       | Correct list, empty state, duplicate selection disabled    |
| Dialog               | Cancel, close, unmount, padding click                    | Callbacks/focus restoration; no accidental dismissal       |
| Lazy failure         | Selector import rejects                                  | Amount/form remain usable and calculation still works      |
| Icon failure         | Image fails, then symbol changes                         | Text fallback, then new image attempt                      |

Tests verify behavior rather than generated CSS classes. jsdom showModal/close are stubbed only for integration callbacks; this does not establish native focus trapping or layout.

## Browser checklist

- At 320, 390, 768, 1024, 1440px: no page overflow; long output readable; responsive navigation/instructions/footer.
- Initially and after typing: receive and USD fields show “—”. Calculate produces output without a confirmation page or artificial delay. Editing clears it.
- Selector search receives focus, Tab stays inside the native dialog, Escape returns to its opener. Changing token requires another calculation.
- Broken image and reduced motion: stable layout, fallback, usable controls.
- Price fetch failure: Retry works and calculation stays disabled without enough data.
- Selector chunk failure: only its error UI appears; Close preserves the form.

## Other problems

Problem1 tests examples, even/odd identities, input safety and maximum n. Problem3 tests policy, priority/ties, immutability, fractional display, missing versus zero prices, identity and empty state.

Record actual observations separately. Browser results from 19 October covered the previous auto-calculation UI and do not establish the new submit-driven behavior.

## Observed browser results — 20 October 2026

After the SCSS Modules refactor, document width matched viewport width at 320, 390, 768, 1024 and 1440px. Desktop and 320px views were inspected visually.

Typing `999999999999.12345678` left the receive output as “—”. Clicking Calculate swap produced `1662841509844392.45037737` for the endpoint's ETH/USDC reference prices; mobile document width remained 320px. This matches the independently computed integer-arithmetic regression case.

The selector focused search. Searching `wbtc` reduced the list to WBTC after debounce; Tab moved from search to that result. Escape restored focus to the send-token button. Native dialog behavior was observed in Chrome; other browsers still require separate QA.
