import { describe, expect, it } from 'vitest'
import {
  CALCULATOR_VERSION,
  SALES_CONVERSION_BASIS,
  calculateLaunch,
  calculateReviewMetrics,
  ceilDivide,
} from '../src/domain/calculator'
import { demoInputs } from '../src/domain/schema'

describe('launch calculator', () => {
  it('calculates the synthetic planning case exactly', () => {
    const result = calculateLaunch(demoInputs)

    expect(result.calculatorVersion).toBe(CALCULATOR_VERSION)
    expect(result.calculatorVersion).toBe('prototype-0.5.0')
    expect(result.salesConversionBasis).toBe(SALES_CONVERSION_BASIS)
    expect(result.salesConversionBasis).toBe('all-workshop-signups')
    expect(result.selected.conversionRatePercent).toBe(2)
    expect(result.selected.buyersRequired).toBe(13)
    expect(result.selected.registrationsRequired).toBe(650)
    expect(result.selected.attendeesExpected).toBe(130)
    expect(result.selected.projectedAttendeesExpected).toBe(86)
    expect(result.selected.groupJoinsExpected).toBe(390)
    expect(result.selected.paidRegistrationGap).toBe(470)
    expect(result.selected.requiredAdSpendMinorUnits).toBe(94_000n)
    expect(result.selected.budgetSupportedPaidRegistrations).toBe(250)
    expect(result.selected.projectedRegistrations).toBe(430)
    expect(result.selected.projectedBuyers).toBe(8)
    expect(result.selected.projectedRevenueMinorUnits).toBe(797_600n)
    expect(result.selected.registrationGapAfterBudget).toBe(220)
    expect(
      result.selected.trace.find((item) => item.id === 'FORMULA-REGISTRATIONS-001'),
    ).toMatchObject({
      label: 'Required workshop signups',
      expression: 'ceil(13 / 2%)',
      result: 650,
    })
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

  it.each([
    [10, 65],
    [20, 130],
    [30, 195],
    [70, 455],
  ])('uses an explicit %s%% show-up rate for target attendance', (rate, attendees) => {
    const result = calculateLaunch({ ...demoInputs, showUpRatePercent: rate })

    expect(result.selected.attendeesExpected).toBe(attendees)
  })

  it('uses all workshop signups as the sales-conversion base', () => {
    const low = calculateLaunch({ ...demoInputs, showUpRatePercent: 10 }).selected
    const high = calculateLaunch({ ...demoInputs, showUpRatePercent: 70 }).selected

    expect(high.buyersRequired).toBe(low.buyersRequired)
    expect(high.registrationsRequired).toBe(low.registrationsRequired)
    expect(high.projectedRevenueMinorUnits).toBe(low.projectedRevenueMinorUnits)
    expect(high.attendeesExpected).toBeGreaterThan(low.attendeesExpected)
    expect(low.projectedBuyers).toBe(
      Math.floor(low.projectedRegistrations * (low.conversionRatePercent / 100)),
    )
    expect(low.projectedBuyers).not.toBe(
      Math.floor(low.projectedAttendeesExpected * (low.conversionRatePercent / 100)),
    )
  })

  it('does not estimate group joins without both a group and a supplied rate', () => {
    const noGroup = calculateLaunch({
      ...demoInputs,
      workshopGroup: 'none',
      groupJoinRatePercent: null,
    })
    const unknownRate = calculateLaunch({
      ...demoInputs,
      workshopGroup: 'other',
      groupJoinRatePercent: null,
    })
    const knownRate = calculateLaunch({
      ...demoInputs,
      workshopGroup: 'facebook',
      groupJoinRatePercent: 30,
    })

    expect(noGroup.selected.groupJoinsExpected).toBeNull()
    expect(unknownRate.selected.groupJoinsExpected).toBeNull()
    expect(knownRate.selected.groupJoinsExpected).toBe(195)
  })

  it('allows a participant rate above the recorded high without exceeding 100%', () => {
    expect(calculateLaunch({ ...demoInputs, showUpRatePercent: 71 }).selected.attendeesExpected).toBe(462)
    expect(() => calculateLaunch({ ...demoInputs, showUpRatePercent: 101 })).toThrow()
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

  it('rejects prices below the selected currency precision', () => {
    expect(() => calculateLaunch({ ...demoInputs, price: 0.001 })).toThrow()
  })

  it('rejects over-precise EUR values instead of silently rounding them', () => {
    expect(() => calculateLaunch({ ...demoInputs, price: 12.345 })).toThrow()
    expect(() => calculateLaunch({ ...demoInputs, revenueGoal: 0.015 })).toThrow()
  })

  it('uses whole minor units for zero-decimal currencies', () => {
    const result = calculateLaunch({
      ...demoInputs,
      currency: 'JPY',
      price: 1_000,
      revenueGoal: 12_000,
      costPerLead: 2,
      adBudget: 500,
    })

    expect(result.minorUnitDigits).toBe(0)
    expect(result.priceMinorUnits).toBe(1_000n)
    expect(result.goalMinorUnits).toBe(12_000n)
    expect(result.selected.buyersRequired).toBe(12)
    expect(() => calculateLaunch({ ...demoInputs, currency: 'JPY', price: 997.5 })).toThrow()
  })

  it('retains three-decimal currency precision', () => {
    const result = calculateLaunch({
      ...demoInputs,
      currency: 'KWD',
      price: 923.077,
      revenueGoal: 12_000,
      costPerLead: 2.125,
      adBudget: 500,
    })

    expect(result.minorUnitDigits).toBe(3)
    expect(result.priceMinorUnits).toBe(923_077n)
    expect(result.selected.buyersRequired).toBe(13)
    expect(() => calculateLaunch({ ...demoInputs, currency: 'KWD', price: 1.2345 })).toThrow()
  })

  it('supports high-denomination plans within the widened safe limits', () => {
    const result = calculateLaunch({
      ...demoInputs,
      currency: 'VND',
      price: 25_000_000,
      revenueGoal: 300_000_000,
      costPerLead: 50_000,
      adBudget: 10_000_000,
    })

    expect(result.priceMinorUnits).toBe(25_000_000n)
    expect(result.selected.buyersRequired).toBe(12)
  })

  it('returns identical output for identical input', () => {
    expect(calculateLaunch(demoInputs)).toEqual(calculateLaunch(demoInputs))
  })
})
