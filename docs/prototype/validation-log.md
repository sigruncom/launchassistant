# Phase 0 validation log

## 2026-08-09 — Sigrun prototype review

**Source:** Slack reply from Sigrun in the Launch Assistant update thread at timestamp `1786299194.487609`.

### Approved

- The deterministic prototype formulas are right.
- A participant must choose between a one-day and a three-day workshop.
- Typical live show-up cases are 10%, 20% and 30%, with 20% as the expected planning case.
- A warm audience without replay has produced show-up rates as high as 70%.
- No replay and a good show-up bonus were each identified as factors that tend to lift attendance.

### UX corrections

- The first screen was too dense for the typical participant.
- Use more, smaller steps with only a few questions on each screen.
- Start every participant-entered field blank.
- Do not display calculations or audience assumptions before the participant has entered the relevant information.

### Workshop guidance supplied

- One-day workshops can be a better fit for B2B audiences with less time and for hobby audiences with lower-priced offers.
- Three-day workshops can be a better fit for offers above €1,000.
- These are guidance signals, not an automatic override of the participant’s selected format.
- This dated participant-choice guidance supersedes the outline’s earlier automatic one-day eligibility rule.

### Clarification later resolved

- The 1–3% sales-conversion base was still open at this review. Sigrun resolved it on 2026-08-16: conversion applies to all workshop signups.

## 2026-08-11 — Sigrun email-reach correction

**Source:** Slack reply from Sigrun in the Launch Assistant update thread at timestamp `1786442416.278279`.

### Method guidance supplied

- Beginner Screen 2 asks for the number of people on the participant’s email list.
- It asks what percentage is expected to register organically.
- The visible starting rate is 10% and the participant can adjust it, with a hard ceiling of 50%.
- A 50,000-person list producing 2,000 registrations is a 4% example.
- Signup percentages tend to fall as lists grow.

### Prototype treatment

- The participant controls the percentage; no automatic list-size curve is inferred without defined bands.
- The resulting registration estimate feeds the existing approved funnel formulas unchanged.
- Fractional estimates round to the nearest whole registration as a visible provisional convention.

### Remaining clarification

- Confirm the authoritative whole-person rounding rule and whether list-size bands should suggest lower starting rates.

## 2026-08-16 — Conversion, reach, flow and lifecycle confirmation

**Source:** Slack DM channel `D03F510JB`, Launch Assistant thread `1786272628.614009`, reply from Sigrun at timestamp `1786895999.683269`.

### Method decisions

- The 1–3% sales conversion always applies to all workshop signups, not only live attendees.
- Ten percent is the default organic signup rate for most email lists.
- The hard ceiling remains 50%.
- Bigger or older lists should use a lower expected signup rate.
- No list-size thresholds, list-age definitions or suggested lower rates were supplied, so the prototype keeps the rate participant-selected and does not infer a curve.

### UX and validation decisions

- The remaining Beginner flow was approved as presented.
- Sigrun approved starting the proposed five-category historical validation pass.
- No historical case inputs, source links or approved expected outputs were included in the reply. The pass therefore remains at zero executable cases and the Phase 0 gate has not passed.

### Membership data policy

- Phase 1 may save plans and allow export while Advantage membership is active.
- Membership exit ends access and triggers deletion; there is no post-membership export or archive.
- The disposable Phase 0 prototype remains browser-memory-only and does not persist participant inputs.

### Inputs still required

- Five historical launches with original calculator inputs and Sigrun-approved outputs, recommendation, red flags and any coach override.
- Exact guidance for what counts as a bigger or older list and which lower rates should be suggested.

## 2026-08-16 — Global currency coverage

**Source:** Slack DM channel `D03F510JB`, Launch Assistant thread `1786272628.614009`, reply from Sigrun at timestamp `1786916169.808439`.

### Product decision

- Advantage serves participants across roughly 70 countries.
- Keep EUR and the euro symbol available.
- Add broader currency support rather than removing the currency choice.

### Prototype treatment

- EUR remains the first option in a compact common-currency selector. “More currencies” progressively reveals a versioned international ISO-currency catalogue.
- The initial static catalogue is `iso-4217-list-one-v1-2026-08-17` (92 participant-facing codes), checked against the official [SIX ISO 4217 current and historical lists](https://www.six-group.com/en/products-services/financial-information/market-reference-data/data-standards.html) on 2026-08-17. It is stored in source control so accepted inputs do not vary by browser data; historical BGN, fund codes and metals are excluded.
- The common-currency shortcuts are a provisional UX choice until Advantage usage data defines the best ordering.
- One currency labels every amount in a plan. Changing it never converts price, revenue, ad-budget or cost inputs; calculated amounts round only to the selected currency’s official smallest unit.
- Euro-only methodology thresholds remain limited to EUR. Other currencies continue to route those decisions to coach review.
