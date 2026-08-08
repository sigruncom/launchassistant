# Launch Assistant

Private product repository for Sigrun's launch calculator and methodology-grounded strategy builder.

## Current phase

The repository contains two disposable internal prototypes for validating the Launch & Sell methodology before production architecture is introduced:

- **Beginner:** two short input steps with advanced assumptions fixed and disclosed.
- **Complete:** the full calculator and methodology-review surface.

The prototype:

- keeps all inputs in browser memory only;
- makes no API, analytics, authentication, storage, or LLM calls;
- calculates the funnel deterministically;
- selects strategy from source-mapped Launch & Sell knowledge cards;
- labels inferred formulas and unresolved methodology decisions explicitly.

Use synthetic or anonymized values only. Refreshing the browser clears everything.

## Run locally

```bash
npm install
npm run dev
```

Run the beginner version locally with:

```bash
npm run dev:beginner
```

Open the local URL printed by Vite. To verify the complete prototype:

```bash
npm run check
```

The two hosted builds use the same source and shared calculation engine. `VITE_APP_VARIANT=beginner` selects the beginner interface; every other value safely defaults to the complete interface.

## Documentation

- [Product scoping plan](docs/product-scoping-plan.md)
- [Prototype source map](docs/prototype/source-map.md)
- [Methodology questions to confirm](docs/prototype/open-questions.md)
