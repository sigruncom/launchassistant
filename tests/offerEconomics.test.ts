import { describe, expect, it } from 'vitest'
import { calculateLaunch } from '../src/domain/calculator'
import {
  calculateOfferEconomics,
  type OfferEconomicsDraft,
  type OfferEconomicsField,
} from '../src/domain/offerEconomics'
import { demoInputs } from '../src/domain/schema'

const calculate = (
  calculatedField: OfferEconomicsField,
  overrides: Partial<OfferEconomicsDraft> = {},
) =>
  calculateOfferEconomics(
    {
      price: '997',
      spotsToSell: '13',
      revenueGoal: '12000',
      ...overrides,
    },
    calculatedField,
  )

const expectSuccess = (result: ReturnType<typeof calculateOfferEconomics>) => {
  expect(result.success).toBe(true)
  if (!result.success) throw new Error('Expected a successful offer-economics result.')
  return result
}

describe('offer economics cross-calculator', () => {
  it('calculates whole client spots upward from price and revenue goal', () => {
    const result = expectSuccess(calculate('spotsToSell'))

    expect(result.values).toEqual({
      price: '997',
      spotsToSell: '13',
      revenueGoal: '12000',
    })
    expect(result.exact.impliedRevenueCents).toBe(1_296_100n)
    expect(result.exact.overGoalCents).toBe(96_100n)
  })

  it('calculates revenue exactly from price and client spots', () => {
    const result = expectSuccess(calculate('revenueGoal'))

    expect(result.values.revenueGoal).toBe('12961')
    expect(result.exact.overGoalCents).toBe(0n)
  })

  it('rounds a calculated price upward to the nearest cent', () => {
    const result = expectSuccess(calculate('price'))

    expect(result.values.price).toBe('923.08')
    expect(result.exact.impliedRevenueCents).toBe(1_200_004n)
    expect(result.exact.overGoalCents).toBe(4n)
  })

  it('keeps decimal multiplication exact', () => {
    const result = expectSuccess(
      calculate('revenueGoal', { price: '0.10', spotsToSell: '3' }),
    )

    expect(result.values.revenueGoal).toBe('0.30')
    expect(result.exact.impliedRevenueCents).toBe(30n)
  })

  it('reports no overage for exact division', () => {
    const result = expectSuccess(
      calculate('spotsToSell', { price: '1000', revenueGoal: '12000' }),
    )

    expect(result.values.spotsToSell).toBe('12')
    expect(result.exact.overGoalCents).toBe(0n)
  })

  it.each([
    ['blank price', 'spotsToSell', { price: '' }],
    ['zero price', 'spotsToSell', { price: '0' }],
    ['negative price', 'spotsToSell', { price: '-1' }],
    ['fractional cent', 'spotsToSell', { price: '12.345' }],
    ['exponent notation', 'spotsToSell', { price: '1e3' }],
    ['fractional spots', 'revenueGoal', { spotsToSell: '2.5' }],
    ['zero spots', 'revenueGoal', { spotsToSell: '0' }],
  ] as const)('rejects %s', (_label, calculatedField, overrides) => {
    expect(calculate(calculatedField, overrides).success).toBe(false)
  })

  it('rejects derived values outside prototype limits', () => {
    expect(
      calculate('revenueGoal', { price: '1000000', spotsToSell: '101' }).success,
    ).toBe(false)
    expect(
      calculate('spotsToSell', { price: '0.01', revenueGoal: '100000000' }).success,
    ).toBe(false)
    expect(
      calculate('spotsToSell', {
        price: '999999.99',
        revenueGoal: '100000000',
      }).success,
    ).toBe(false)
  })

  it('rejects a client target that whole-cent pricing cannot represent', () => {
    const result = calculate('price', { revenueGoal: '0.01', spotsToSell: '100' })

    expect(result.success).toBe(false)
    expect(result.errors.spotsToSell).toContain('whole-cent prices')
  })

  it('supports deterministic switching between calculated fields', () => {
    const spotsResult = expectSuccess(calculate('spotsToSell'))
    const priceResult = expectSuccess(calculateOfferEconomics(spotsResult.values, 'price'))
    const revenueResult = expectSuccess(
      calculateOfferEconomics(priceResult.values, 'revenueGoal'),
    )

    expect(priceResult.values).toEqual({
      price: '923.08',
      spotsToSell: '13',
      revenueGoal: '12000',
    })
    expect(revenueResult.values.revenueGoal).toBe('12000.04')
  })

  it.each(['spotsToSell', 'revenueGoal', 'price'] as const)(
    'keeps downstream required buyers aligned when calculating %s',
    (calculatedField) => {
      const result = expectSuccess(calculate(calculatedField))
      const launch = calculateLaunch({
        ...demoInputs,
        price: result.numbers.price,
        revenueGoal: result.numbers.revenueGoal,
      })

      expect(launch.selected.buyersRequired).toBe(result.numbers.spotsToSell)
    },
  )

  it('does not mutate the draft', () => {
    const draft: OfferEconomicsDraft = {
      price: '997',
      spotsToSell: '',
      revenueGoal: '12000',
    }
    const original = structuredClone(draft)

    calculateOfferEconomics(draft, 'spotsToSell')

    expect(draft).toEqual(original)
  })
})
