# Prototype source map

## Source

**Document:** `Outlines Launch & Sell - AI Launch Assistant copy - July 2025.pdf`

**Verified length:** 37 pages
**Prototype knowledge release:** `launch-and-sell-outline-2025-07`

The source PDF remains outside the repository. The prototype contains short paraphrased knowledge cards and page references, not the full program text.

## Scope of this prototype

The prototype tests one promise:

> Work backwards from a revenue goal to required buyers, workshop registrations, attendance and paid-registration budget, then recommend a launch shape using the current Launch & Sell rules.

It intentionally excludes authentication, persistence, participant data, CRM integration, open-ended chat, content generation and real model calls.

## Source-backed defaults and rules

| Knowledge | Prototype treatment | Source |
|---|---|---|
| Workshop-signup-to-sale conversion | Compare 1%, 2% and 3%; 3% is the stated average | pp. 19, 22, 24 |
| Live attendance | Editable default of 30%; the stated range is 20–30% | pp. 19, 22 |
| Facebook-group joining | Editable default of 60% | p. 22 |
| Research evidence | Fewer than 10 survey responses is insufficient; 100 is the goal | pp. 5–6, 9–10 |
| Workshop format | One day only for experienced launchers with warm, highly aware audiences; otherwise three days | pp. 12–13 |
| Offer format | `<200` registrations: 1:1; `200–500`: group; `>500`: group/course | p. 21 |
| Workshop economics | Offers below €297 generally do not justify a free workshop unless expected registrations exceed 500 | p. 21 |
| Paid ads | Organic registrations first; start cautiously; €500 is a first-test example | pp. 18–19, 24 |
| Discovery calls | Use a calendar for 1:1; personally invite hot leads for offers above €1,000 | pp. 26, 31–32 |
| Promotion cadence | Working schedule: 30, 15, 10, five and one day before the workshop | p. 24 |

## Prototype-derived formulas

The PDF points to a separate Launch Calculator but does not contain its actual specification. The following formulas are therefore explicit prototype assumptions:

```text
required buyers = ceil(revenue goal / offer price)
required registrations = ceil(required buyers / workshop-to-sale conversion)
expected group joins = round(required registrations × group-join rate)
expected live attendees = round(required registrations × show-up rate)
paid registration gap = max(0, required registrations − organic registrations)
required ad spend = paid registration gap × cost per paid registration
budget-supported registrations = floor(ad budget / cost per paid registration)
```

Every calculated plan retains a formula trace and the calculator version. These formulas must not be treated as Sigrun-approved until the missing calculator or a replacement specification is reviewed.

## Worked-case verification

The automated tests reproduce the launch review on p. 35:

- `37 / 500 = 7.4%` sales conversion;
- `$500 / 250 = $2` cost per paid registration;
- `37 × $397 = $14,689` revenue;
- `$14,689 / 500 = $29.378` earnings per registration, displayed as `$29` in the document.
