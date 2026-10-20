# Source conventions

## Responsibilities and imports

- `app/` owns providers, shell layout and page composition. It imports a feature's public entry (`@/features/swap`).
- `features/swap/model/` owns input state, query policy and conversion rules; `api/` validates external data; `ui/` renders the feature.
- `shared/` contains reusable UI, generic hooks and Sass foundations. It must not import app or feature code. ESLint rejects these reverse imports.
- Use `@/` for cross-layer imports and relative paths within a component/feature. Import order and type-only imports are enforced by ESLint.
- Components use PascalCase filenames, hooks start with `use`, functions use camelCase. Props use TypeScript `type` declarations; use discriminated unions where modes have different required props.

## React and state

- Store input state and the submitted conversion snapshot. Do not compute receive amounts or USD equivalents during render or in an input-change effect.
- `useSwapForm` coordinates the form; `useTokenPrices` owns the shared query key and cache policy. UI components do not call fetch directly.
- Editing amount/pair or refreshing prices invalidates the displayed result. A changed server price/date invalidates its old snapshot too.
- Use Effects for external synchronization and cleanup, not derived form values. Do not add memoization without a useful identity/computation boundary.
- Suspense handles the selector's dynamic import. Query owns request loading/errors. A local ErrorBoundary prevents a selector download/render error from replacing the form.

## Styling and accessibility

- Co-locate `Component.module.scss` with its owner and use camelCase local classes. Only reset and foundation styles belong in global Sass.
- Consume semantic palette and spacing tokens. Breakpoint/spacing helpers reject unknown keys at build time. Decorative artwork coordinates may remain explicit.
- Keep responsive rules in the owning stylesheet, ordered desktop → tablet → mobile. Declare fixed icon dimensions and respect reduced motion.
- Use explicit input labels, semantic output, button types, visible focus and error announcements. Dialogs use native focus trapping, Escape, and an explicit close button.
- The icon is decorative; its text fallback must not repeat the token name for screen readers.

## Verification

Run `npm run check` inside problem2. Tests assert user behavior and policy boundaries, not generated CSS class names. Browser QA verifies layout and native modal behavior that jsdom cannot emulate. Avoid fabricated waiting states for synchronous arithmetic.
