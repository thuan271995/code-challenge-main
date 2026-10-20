# Problem 2: Fancy Form

This is a standalone Vite application. Install and run commands **inside this folder**:

```sh
cd problem2
npm ci
npm run dev
npm run check
```

This folder owns `package.json`, its lockfile, HTML, TypeScript, Vite, ESLint, Prettier, dependencies and tests. HTML loads `/src/main.tsx`; production output goes to `dist/`.

`npm run build`, `npm run preview`, `npm run typecheck` and `npm test` also run here. Nothing depends on a root package or on the other problems.

The supplied vanilla template is replaced as permitted by the brief. The form retains the original purpose: choose currencies and specify an amount to send, then see the estimated amount to receive. Price data comes from `https://interview.switcheo.com/prices.json`, and icons from the Switcheo token icon repository.

The receive amount starts blank. Entering a number validates the input but does not calculate a conversion. **Calculate swap** (or Enter) computes and displays the result once. Changing the amount/pair or refreshing prices clears that result until the next calculation. There is no simulated transaction, confirmation screen, fake network delay or wallet connection.

The reference price date is shown because this public endpoint can contain historical data. Request loading/error/retry feedback remains real and is handled separately from the synchronous calculation.

`src/app/layout` contains the shell components. `features/swap/model/useSwapForm.ts` owns the form logic and `useTokenPrices.ts` owns query policy. UI styles are co-located SCSS Modules; shared Sass contains only reset, palette/spacing tokens and mixins. See `CONVENTIONS.md` for source and styling rules.
