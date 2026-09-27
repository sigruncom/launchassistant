# Prototype source map

## Source

**Document:** `Outlines Launch & Sell - AI Launch Assistant copy - July 2025.pdf`

**Verified length:** 37 pages
**Prototype knowledge release:** `launch-and-sell-outline-2025-07+sigrun-feedback-2026-08-21-r3`

The source PDF remains outside the repository. The prototype contains short paraphrased knowledge cards and page references, not the full program text. Dated methodology-owner feedback is stored as a separate source type and is never presented as if it came from a PDF page.

## Scope of this prototype

The prototype tests one promise:

> Work backwards from a revenue goal to required buyers, workshop registrations, attendance and paid-registration budget, then recommend a launch shape using the current Launch & Sell rules.

It intentionally excludes authentication, persistence, participant data, CRM integration, open-ended chat, content generation and real model calls.

## Source-backed references and rules

| Knowledge | Prototype treatment | Source |
|---|---|---|
| Plan currency | EUR is preselected. Currency changing is a secondary control that retains the international ISO catalogue. It never converts entered values, and euro-only methodology thresholds remain EUR-only | Sigrun feedback, 2026-08-16 and 2026-08-20; [SIX ISO 4217 List One](https://www.six-group.com/en/products-services/financial-information/market-reference-data/data-standards.html), accessed 2026-08-17 |
| Email-list registrations | Beginner asks for list size and an editable signup percentage. The visible starting rate is 10%, the hard ceiling is 50%, and the 50,000 → 2,000 example corresponds to 4%. Bigger or older lists should use lower rates, but no automatic bands are inferred without defined thresholds | Sigrun feedback, 2026-08-11 and 2026-08-16 |
| Workshop-signup-to-sale conversion | Compare 1%, 2% and 3%; 3% is the stated average. The rate applies to all workshop signups, not only live attendees | pp. 19, 22, 24 plus Sigrun feedback, 2026-08-16 |
| Live attendance | Beginner starts at 20% and allows a lower or higher choice. Complete keeps an explicit selection. Typical cases are 10%, 20% and 30%; 70% is a recorded high for a warm audience without replay. No replay and a good show-up bonus can each lift attendance | pp. 19, 22 plus Sigrun feedback, 2026-08-09 and 2026-08-21 |
| Workshop-group planning and joining | Beginner omits community planning entirely and maps to no group with no join estimate. Complete retains its platform choice and optional participant-supplied join rate. The outline’s 60% and 70% join examples and Sigrun’s recent 30% observation remain historical source facts, not active Beginner defaults | p. 22 plus Sigrun feedback, 2026-08-20 and 2026-08-21 |
| Community and sales conversion | Sigrun said community may have a slightly positive influence on conversion but should not make or break a launch; a June community launch converted at 0.69%. No validated coefficient or complete comparison case was supplied, so the prototype does not adjust conversion for community use and does not add 0.69% to the approved 1%, 2% and 3% planning choices | Sigrun feedback, 2026-08-21 |
| Planner layout | Keep the active calculator step above the fold on a laptop, make currency secondary, maintain a stable viewport position between steps and align the shared offer-economics fields consistently wherever they appear | Sigrun feedback, 2026-08-20 and 2026-08-21 |
| Research evidence | Fewer than 10 survey responses is insufficient; 100 is the goal | pp. 5–6, 9–10 |
| Workshop format | Participant chooses one or three days. One day can suit B2B/time-constrained and lower-priced hobby audiences; three days can suit offers above €1,000. Sigrun’s dated guidance supersedes the outline’s earlier automatic selection rule | Sigrun feedback, 2026-08-09 |
| Offer format | `<200` registrations: 1:1; `200–500`: group; `>500`: group/course | p. 21 |
| Workshop economics | Offers below €297 generally do not justify a free workshop unless expected registrations exceed 500 | p. 21 |
| Paid ads | Organic registrations first; start cautiously; €500 is a first-test example | pp. 18–19, 24 |
| Discovery calls | Use a calendar for 1:1; personally invite hot leads for offers above €1,000 | pp. 26, 31–32 |
| Promotion cadence | Working schedule: 30, 15, 10, five and one day before the workshop | p. 24 |

## Approved prototype formulas

The PDF points to a separate Launch Calculator but does not contain its specification. Sigrun confirmed on 2026-08-09 that the formulas used by this prototype are right:

```text
required buyers = ceil(revenue goal / offer price)
required registrations = ceil(required buyers / workshop-signup-to-sale conversion applied to all signups)
expected group joins = round(required registrations × group-join rate)
  only when a workshop group is planned and a rate is supplied;
  otherwise group joins are not estimated
expected live attendees = round(required registrations × show-up rate)
expected live attendees from current reach = round(projected registrations × show-up rate)
paid registration gap = max(0, required registrations − organic registrations)
required ad spend = paid registration gap × cost per paid registration
budget-supported registrations = floor(ad budget / cost per paid registration)
```

Every calculated plan retains a formula trace, calculator version and machine-readable sales-conversion basis. Beginner plans also retain the email-list size, selected signup rate, derived whole-person result, rounding rule and dated method-owner source in an email-reach trace. Sigrun’s denominator confirmation was versioned as calculator `prototype-0.3.1`; international minor-unit handling is versioned as `prototype-0.4.0`; the nullable workshop-group output contract is versioned as `prototype-0.5.0`. The later 2026-08-21 Beginner direction removes community planning and maps Beginner to the existing no-group branch. It does not add a community conversion uplift or change the calculator version. Buyer, registration, sales-conversion, attendance, reach-gap and paid-spend formulas are unchanged.

For the guided Beginner input, the email-list estimate is calculated before the approved funnel engine runs:

```text
estimated registrations from email = round(email-list size × selected signup percentage)
```

The multiplication follows Sigrun’s 2026-08-11 feedback. Nearest-whole-person rounding is a visible prototype convention pending confirmation. The participant controls the percentage; the prototype does not invent an automatic decline curve for bigger or older lists because the thresholds and suggested rates have not been supplied.

## Five-case validation status

Sigrun approved the proposed validation categories on 2026-08-16. No complete case sources, original inputs or approved expected outputs were supplied, so zero of five cases are currently executable. Reply `1787325821.911649` supplied Beginner defaults and question-design corrections. Replies `1787329580.840629` and `1787329961.144849` supplied a June 0.69% conversion observation and the final decision to omit community from Beginner, but not the other case inputs or approved outputs. The case set is tracked in [golden-cases.md](golden-cases.md), and Phase 0 remains open until the cases are run and explicitly approved.

## Worked-case verification

The automated tests reproduce the launch review on p. 35:

- `37 / 500 = 7.4%` sales conversion;
- `$500 / 250 = $2` cost per paid registration;
- `37 × $397 = $14,689` revenue;
- `$14,689 / 500 = $29.378` earnings per registration, displayed as `$29` in the document.
