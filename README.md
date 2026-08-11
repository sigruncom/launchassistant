# Launch Assistant

Private product repository for Sigrun's launch calculator and methodology-grounded strategy builder.

## Current phase

The repository contains one disposable internal demo with two selectable planner experiences for validating the Launch & Sell methodology before production architecture is introduced:

- **Beginner:** six short input steps with no prefilled participant answers.
- **Complete:** eight topic-based input steps followed by the full methodology-review surface.

The prototype:

- keeps all inputs in browser memory only;
- makes no API, analytics, authentication, storage, or LLM calls;
- calculates the funnel deterministically;
- selects strategy from source-mapped Launch & Sell knowledge cards;
- records whether guidance comes from the July 2025 outline or Sigrun’s dated feedback;
- labels the remaining sales-rate denominator question explicitly.

Use synthetic or anonymized values only. Refreshing the browser clears everything.

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. The bare URL opens the guided Beginner planner. Use the top navigation—or open `?planner=beginner` or `?planner=complete` directly—to switch experiences. Switching versions reloads the page and clears the in-memory form.

To verify the complete demo:

```bash
npm run check
```

Both experiences are shipped in one build and use the same shared calculation engine. `VITE_APP_VARIANT` remains available as an optional queryless default; an explicit `planner` query value takes priority.

## Documentation

- [Product scoping plan](docs/product-scoping-plan.md)
- [Prototype source map](docs/prototype/source-map.md)
- [Phase 0 validation log](docs/prototype/validation-log.md)
- [Methodology questions to confirm](docs/prototype/open-questions.md)
