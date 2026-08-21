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

## 2026-08-20 — EUR default, compact layout and optional workshop groups

**Source:** Slack DM channel `D03F510JB`, Launch Assistant thread `1786272628.614009`, reply from Sigrun at timestamp `1787242125.523589`.

**Supporting attachments:** `F0BR50H9SS3` and `F0BRJDFPNBY`.

### Confirmed corrections and evidence

- EUR should be selected by default.
- Currency selection remains available but should be a secondary control, not the first prominent question.
- The current headline and overall layout are not user-friendly.
- The current calculator step should fit above the fold on a full-screen laptop.
- Moving between steps should not make the page jump.
- A launch may use no workshop group.
- Sigrun reported that recent workshop-group join rates have fallen to around 30%.
- Some launches skip workshop groups; groups hosted away from Facebook may have lower joining rates.
- Sigrun has no measured workshop-group join rate for her list launch.

### Conservative prototype treatment

- Keep the international currency catalogue, preselect EUR and place currency changing behind a secondary control.
- Keep the active calculator card in a stable laptop-height stage and prevent focus changes from scrolling back to the intro.
- Ask explicitly whether the launch has no group, a Facebook group or a group on another platform.
- Do not calculate or display numeric group joins when no group is planned or no evidence-based rate is supplied.
- Present 30% as a recent sourced reference, not as an authoritative universal default.
- Keep the outline’s 60% and 70% figures as historical source facts rather than current UI defaults.

### Clarification still required

- Sigrun said the current Beginner Screen 6 should either be removed or moved to Screen 1. She did not choose between those alternatives, so this release leaves its placement unchanged pending that choice.

### Phase 0 status

This reply supplies prototype corrections and one updated benchmark. It does not provide a historical golden case, approved expected outputs or explicit Phase 0 gate approval. The validation set remains `0/5` executable and Phase 0 remains open.

## 2026-08-21 — Beginner attendance and launch-community simplification

**Source:** Slack DM channel `D03F510JB`, Launch Assistant thread `1786272628.614009`, reply from Sigrun at timestamp `1787325821.911649`.

**Supporting attachment:** `F0BRDNTPSMD`.

### Confirmed decisions

- Beginner starts live show-up at 20% and still lets the participant choose a higher or lower rate.
- Beginner no longer asks which platform hosts the group or asks the participant to estimate a group-join percentage.
- Beginner asks only whether a launch community exists.
- “Yes” applies a 30% community-join planning rate. “No” leaves group joins unestimated rather than treating the rate as zero.

### Scoped prototype treatment

- Apply this simplification to Beginner because Sigrun explicitly framed the correction around beginner complexity.
- Keep Complete’s richer platform and participant-supplied rate controls unchanged pending separate direction.
- This supersedes the 2026-08-20 “reference only” treatment for the scoped Beginner default. It does not turn 30% into a universal group-join assumption.
- The calculation formulas remain deterministic and unchanged; the Beginner answer is mapped into the existing optional-group contract before calculation.

### Placement still unresolved

This reply changes the launch-community question on Beginner Screen 6 but does not decide whether the audience-research questions should remain there, move to Screen 1 or be removed. Their placement remains unchanged pending Sigrun’s earlier choice.

### Phase 0 status

This is prototype default and question-design guidance, not a historical launch case. It supplies no approved case outputs and no explicit Phase 0 gate approval. The validation set remains `0/5` executable and Phase 0 remains open.

**Superseded later the same day:** replies `1787329580.840629` and `1787329961.144849` led to the community step being omitted from Beginner entirely. The editable 20% show-up starting point remains current.

## 2026-08-21 — Community evidence and final Beginner simplification

**Sources:** Slack DM channel `D03F510JB`, Launch Assistant thread `1786272628.614009`, replies from Sigrun at timestamps `1787329580.840629` and `1787329961.144849`.

### Evidence and decision

- Sigrun said a launch community may have a slightly positive influence on conversion, but should not make or break a launch.
- She reported that a June launch with a community converted at 0.69%.
- No original case inputs, source artifact, approved output set or numeric community-uplift magnitude accompanied that evidence.
- Six minutes later, Sigrun directed the team to skip the community part to keep Beginner simpler. This later direction supersedes the earlier Beginner yes/no community treatment.

### Conservative prototype treatment

- Remove community questions, join-rate defaults and community output from Beginner.
- Map Beginner into the existing optional-group contract as no group and no group-join estimate. This keeps the shared deterministic calculator unchanged.
- Do not infer or apply a community adjustment to the sales-conversion rate. The 0.69% result shows that community presence alone is not enough to define an uplift.
- Keep Complete’s explicit group controls unchanged because Sigrun’s simplification was scoped to the Beginner discussion.
- Keep the audience-research questions in their current position because neither reply resolves whether they should remain on Screen 6, move to Screen 1 or be removed.

### Validation status

The June 0.69% result is partial historical evidence, not an executable golden case. The original price, registrations, buyers or revenue, show-up rate, workshop format, source artifact and approved expected outputs are still required. The validation set remains `0/5` executable and Phase 0 remains open.

## 2026-08-21 — Offer-economics visual alignment

**Source:** Slack DM channel `D03F510JB`, Launch Assistant thread `1786272628.614009`, reply from Sigrun at timestamp `1787333041.552719`.

**Supporting attachment:** `F0BSQEHRA8Y`.

### Confirmed correction

- Visually align the “Planned sales revenue” control with the other offer-economics controls.
- Apply the same alignment wherever the shared offer-economics group appears.

### Scoped prototype treatment

- Make this a presentation-only change in the shared offer-economics styles so Beginner and Complete remain consistent.
- Keep labels, accepted inputs, formulas, rounding and methodology unchanged.

### Phase 0 status

This is interface-presentation feedback, not a historical launch case, approved expected output or Phase 0 gate approval. The validation set remains `0/5` executable and Phase 0 remains open.
