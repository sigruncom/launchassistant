import { describe, expect, it } from 'vitest'
import {
  calculateLaunch,
  calculateReviewMetrics,
  ceilDivide,
} from '../src/domain/calculator'
import { demoInputs } from '../src/domain/schema'

describe('launch calculator', () => {
  it('calculates the synthetic planning case exactly', () => {
    const result = calculateLaunch(demoInputs)

    expect(result.selected.conversionRatePercent).toBe(2)
    expect(result.selected.buyersRequired).toBe(13)
    expect(result.selected.registrationsRequired).toBe(650)
    expect(result.selected.attendeesExpected).toBe(195)
    expect(result.selected.groupJoinsExpected).toBe(390)
    expect(result.selected.paidRegistrationGap).toBe(470)
    expect(result.selected.requiredAdSpendCents).toBe(94_000)
    expect(result.selected.budgetSupportedPaidRegistrations).toBe(250)
    expect(result.selected.projectedRegistrations).toBe(430)
    expect(result.selected.projectedBuyers).toBe(8)
    expect(result.selected.projectedRevenueCents).toBe(797_600)
    expect(result.selected.registrationGapAfterBudget).toBe(220)
  })

  it('compares only the source-backed 1%, 2%, and 3% scenarios', () => {
    const result = calculateLaunch(demoInputs)

    expect(
      result.scenarios.map((scenario) => ({
        rate: scenario.conversionRatePercent,
        registrations: scenario.registrationsRequired,
      })),
    ).toEqual([
      { rate: 1, registrations: 1_300 },
      { rate: 2, registrations: 650 },
      { rate: 3, registrations: 434 },
    ])
  })

  it('reproduces the worked launch-review example', () => {
    const review = calculateReviewMetrics({
      launchListSize: 500,
      paidRegistrations: 250,
      adSpend: 500,
      buyers: 37,
      price: 397,
    })

    expect(review.conversionRatePercent).toBeCloseTo(7.4)
    expect(review.costPerLead).toBe(2)
    expect(review.revenue).toBe(14_689)
    expect(review.earningsPerLead).toBeCloseTo(29.378)
  })

  it('rounds required funnel quantities up', () => {
    expect(ceilDivide(12_000_00, 997_00)).toBe(13)
    expect(ceilDivide(13 * 10_000, 300)).toBe(434)
  })

  it('does not mutate the input object', () => {
    const original = structuredClone(demoInputs)
    calculateLaunch(demoInputs)
    expect(demoInputs).toEqual(original)
  })

  it('rejects an ad budget without a cost per lead', () => {
    expect(() => calculateLaunch({ ...demoInputs, costPerLead: 0 })).toThrow()
  })

  it('returns identical output for identical input', () => {
    expect(calculateLaunch(demoInputs)).toEqual(calculateLaunch(demoInputs))
  })
})
