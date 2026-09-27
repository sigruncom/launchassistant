import { describe, expect, it } from 'vitest'
import { calculateLaunch } from '../src/domain/calculator'
import {
  calculateOfferEconomics,
  createOfferEconomicsEditor,
  editOfferEconomics,
  offerEconomicsDraftFromNumbers,
  resolveOfferEconomicsEditor,
  type OfferEconomicsDraft,
  type OfferEconomicsEditorState,
  type OfferEconomicsField,
} from '../src/domain/offerEconomics'
import { demoInputs } from '../src/domain/schema'

const calculate = (
  calculatedField: OfferEconomicsField,
  overrides: Partial<OfferEconomicsDraft> = {},
  currency: 'EUR' | 'JPY' | 'KWD' | 'VND' = 'EUR',
) =>
  calculateOfferEconomics(
    {
      price: '997',
      spotsToSell: '13',
      revenueGoal: '12000',
      ...overrides,
    },
    calculatedField,
    currency,
  )

const expectSuccess = (result: ReturnType<typeof calculateOfferEconomics>) => {
  expect(result.success).toBe(true)
  if (!result.success) throw new Error('Expected a successful offer-economics result.')
  return result
}

const expectEditorSuccess = (editor: OfferEconomicsEditorState) => {
  const resolved = resolveOfferEconomicsEditor(editor)
  expect(resolved.result?.success).toBe(true)
  if (!resolved.result?.success) {
    throw new Error('Expected a successful offer-economics editor result.')
  }
  return { ...resolved, result: resolved.result }
}

describe('offer economics cross-calculator', () => {
  it('calculates whole client spots upward from price and revenue goal', () => {
    const result = expectSuccess(calculate('spotsToSell'))

    expect(result.values).toEqual({
      price: '997',
      spotsToSell: '13',
      revenueGoal: '12000',
    })
    expect(result.exact.impliedRevenueMinorUnits).toBe(1_296_100n)
    expect(result.exact.overGoalMinorUnits).toBe(96_100n)
  })

  it('calculates revenue exactly from price and client spots', () => {
    const result = expectSuccess(calculate('revenueGoal'))

    expect(result.values.revenueGoal).toBe('12961')
    expect(result.exact.overGoalMinorUnits).toBe(0n)
  })

  it('rounds a calculated EUR price upward to the nearest minor unit', () => {
    const result = expectSuccess(calculate('price'))

    expect(result.values.price).toBe('923.08')
    expect(result.exact.impliedRevenueMinorUnits).toBe(1_200_004n)
    expect(result.exact.overGoalMinorUnits).toBe(4n)
  })

  it('keeps decimal multiplication exact', () => {
    const result = expectSuccess(
      calculate('revenueGoal', { price: '0.10', spotsToSell: '3' }),
    )

    expect(result.values.revenueGoal).toBe('0.30')
    expect(result.exact.impliedRevenueMinorUnits).toBe(30n)
  })

  it('reports no overage for exact division', () => {
    const result = expectSuccess(
      calculate('spotsToSell', { price: '1000', revenueGoal: '12000' }),
    )

    expect(result.values.spotsToSell).toBe('12')
    expect(result.exact.overGoalMinorUnits).toBe(0n)
  })

  it.each([
    ['blank price', 'spotsToSell', { price: '' }],
    ['zero price', 'spotsToSell', { price: '0' }],
    ['negative price', 'spotsToSell', { price: '-1' }],
    ['over-precise EUR amount', 'spotsToSell', { price: '12.345' }],
    ['exponent notation', 'spotsToSell', { price: '1e3' }],
    ['fractional spots', 'revenueGoal', { spotsToSell: '2.5' }],
    ['zero spots', 'revenueGoal', { spotsToSell: '0' }],
  ] as const)('rejects %s', (_label, calculatedField, overrides) => {
    expect(calculate(calculatedField, overrides).success).toBe(false)
  })

  it('rejects derived values outside prototype limits', () => {
    expect(
      calculate('revenueGoal', { price: '1000000000000', spotsToSell: '2' }).success,
    ).toBe(false)
    expect(
      calculate('spotsToSell', { price: '0.01', revenueGoal: '1000000000000' }).success,
    ).toBe(false)
    expect(
      calculate('spotsToSell', {
        price: '999999999999.99',
        revenueGoal: '1000000000000',
      }).success,
    ).toBe(false)
  })

  it('rejects a client target that the currency minor unit cannot represent', () => {
    const result = calculate('price', { revenueGoal: '0.01', spotsToSell: '100' })

    expect(result.success).toBe(false)
    expect(result.errors.spotsToSell).toContain('smallest currency unit')
  })

  it('rounds calculated JPY prices to whole currency units', () => {
    const result = expectSuccess(
      calculate('price', { revenueGoal: '12000', spotsToSell: '13' }, 'JPY'),
    )

    expect(result.values.price).toBe('924')
    expect(result.exact.priceMinorUnits).toBe(924n)
    expect(result.exact.overGoalMinorUnits).toBe(12n)
    expect(calculate('spotsToSell', { price: '997.5' }, 'JPY').success).toBe(false)
  })

  it('rounds calculated KWD prices to three decimal places', () => {
    const result = expectSuccess(
      calculate('price', { revenueGoal: '12000', spotsToSell: '13' }, 'KWD'),
    )

    expect(result.values.price).toBe('923.077')
    expect(result.exact.priceMinorUnits).toBe(923_077n)
    expect(result.exact.overGoalMinorUnits).toBe(1n)
    expect(
      calculate('spotsToSell', { price: '923.0777' }, 'KWD').success,
    ).toBe(false)
  })

  it('supports high-denomination VND offer values', () => {
    const result = expectSuccess(
      calculate(
        'spotsToSell',
        { price: '25000000', revenueGoal: '300000000' },
        'VND',
      ),
    )

    expect(result.values.spotsToSell).toBe('12')
    expect(result.exact.impliedRevenueMinorUnits).toBe(300_000_000n)
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

describe('fluid offer economics editor', () => {
  const blankDraft: OfferEconomicsDraft = {
    price: '',
    spotsToSell: '',
    revenueGoal: '',
  }

  it('waits for any two fields, then calculates the remaining field', () => {
    let editor = createOfferEconomicsEditor(blankDraft)
    expect(resolveOfferEconomicsEditor(editor).calculatedField).toBeNull()

    editor = editOfferEconomics(editor, 'price', '997')
    expect(resolveOfferEconomicsEditor(editor).calculatedField).toBeNull()

    editor = editOfferEconomics(editor, 'revenueGoal', '12000')
    const resolved = expectEditorSuccess(editor)

    expect(resolved.calculatedField).toBe('spotsToSell')
    expect(resolved.values.spotsToSell).toBe('13')
  })

  it.each([
    ['price', 'spotsToSell', 'revenueGoal', '12961'],
    ['spotsToSell', 'price', 'revenueGoal', '12961'],
    ['price', 'revenueGoal', 'spotsToSell', '13'],
    ['revenueGoal', 'price', 'spotsToSell', '13'],
    ['spotsToSell', 'revenueGoal', 'price', '923.08'],
    ['revenueGoal', 'spotsToSell', 'price', '923.08'],
  ] as const)(
    'editing %s then %s calculates %s',
    (first, second, calculatedField, expectedValue) => {
      const sourceValues: OfferEconomicsDraft = {
        price: '997',
        spotsToSell: '13',
        revenueGoal: '12000',
      }
      let editor = createOfferEconomicsEditor(blankDraft)
      editor = editOfferEconomics(editor, first, sourceValues[first])
      editor = editOfferEconomics(editor, second, sourceValues[second])
      const resolved = expectEditorSuccess(editor)

      expect(resolved.calculatedField).toBe(calculatedField)
      expect(resolved.values[calculatedField]).toBe(expectedValue)
    },
  )

  it('editing the auto-calculated value makes the oldest input the new result', () => {
    const initial = createOfferEconomicsEditor(
      offerEconomicsDraftFromNumbers(997, 12000),
    )
    expect(initial.sourceOrder).toEqual(['revenueGoal', 'price'])
    expect(expectEditorSuccess(initial).calculatedField).toBe('spotsToSell')

    const edited = editOfferEconomics(initial, 'spotsToSell', '14')
    const resolved = expectEditorSuccess(edited)

    expect(edited.sourceOrder).toEqual(['price', 'spotsToSell'])
    expect(resolved.calculatedField).toBe('revenueGoal')
    expect(resolved.values.revenueGoal).toBe('13958')
  })

  it('keeps the same result field while either existing input is edited', () => {
    const initial = createOfferEconomicsEditor(
      offerEconomicsDraftFromNumbers(997, 12000),
    )
    const olderEdited = editOfferEconomics(initial, 'revenueGoal', '12001')
    const newerEdited = editOfferEconomics(initial, 'price', '1000')

    expect(olderEdited.sourceOrder).toEqual(['price', 'revenueGoal'])
    expect(expectEditorSuccess(olderEdited).calculatedField).toBe('spotsToSell')
    expect(newerEdited.sourceOrder).toEqual(['revenueGoal', 'price'])
    expect(expectEditorSuccess(newerEdited).calculatedField).toBe('spotsToSell')
  })

  it('keeps existing inputs while an edited calculated value is temporarily invalid', () => {
    const initial = createOfferEconomicsEditor(
      offerEconomicsDraftFromNumbers(997, 12000),
    )
    const cleared = editOfferEconomics(initial, 'spotsToSell', '')
    const waiting = resolveOfferEconomicsEditor(cleared)

    expect(cleared.sourceOrder).toEqual(['revenueGoal', 'price'])
    expect(waiting.calculatedField).toBe('spotsToSell')
    expect(waiting.result?.success).toBe(false)
    expect(waiting.values).toEqual({
      price: '997',
      spotsToSell: '',
      revenueGoal: '12000',
    })
    expect(waiting.result?.errors.spotsToSell).toBe(
      'Enter the number of client spots.',
    )

    const recovered = expectEditorSuccess(
      editOfferEconomics(cleared, 'spotsToSell', '14'),
    )
    expect(recovered.calculatedField).toBe('revenueGoal')
    expect(recovered.values.revenueGoal).toBe('13958')
  })

  it('makes the next recalculated field explicit through the ordered inputs', () => {
    const demoHistory = createOfferEconomicsEditor(
      offerEconomicsDraftFromNumbers(997, 12000),
    )
    let enteredHistory = createOfferEconomicsEditor(blankDraft)
    enteredHistory = editOfferEconomics(enteredHistory, 'price', '997')
    enteredHistory = editOfferEconomics(enteredHistory, 'revenueGoal', '12000')

    expect(demoHistory.sourceOrder).toEqual(['revenueGoal', 'price'])
    expect(enteredHistory.sourceOrder).toEqual(['price', 'revenueGoal'])

    const demoEdit = expectEditorSuccess(
      editOfferEconomics(demoHistory, 'spotsToSell', '14'),
    )
    const enteredEdit = expectEditorSuccess(
      editOfferEconomics(enteredHistory, 'spotsToSell', '14'),
    )

    expect(demoEdit.calculatedField).toBe('revenueGoal')
    expect(demoEdit.values.revenueGoal).toBe('13958')
    expect(enteredEdit.calculatedField).toBe('price')
    expect(enteredEdit.values.price).toBe('857.15')
  })

  it('supports repeated role changes without reviving old calculated values', () => {
    let editor = createOfferEconomicsEditor(
      offerEconomicsDraftFromNumbers(997, 12000),
    )
    editor = editOfferEconomics(editor, 'spotsToSell', '14')
    editor = editOfferEconomics(editor, 'revenueGoal', '14000')
    let resolved = expectEditorSuccess(editor)
    expect(resolved.calculatedField).toBe('price')
    expect(resolved.values.price).toBe('1000')

    editor = editOfferEconomics(editor, 'price', '900')
    resolved = expectEditorSuccess(editor)
    expect(resolved.calculatedField).toBe('spotsToSell')
    expect(resolved.values.spotsToSell).toBe('16')
  })

  it('recalculates the derived field when the selected currency unit changes', () => {
    let editor = createOfferEconomicsEditor(blankDraft)
    editor = editOfferEconomics(editor, 'revenueGoal', '12000')
    editor = editOfferEconomics(editor, 'spotsToSell', '13')

    expect(expectEditorSuccess(editor).values.price).toBe('923.08')
    expect(resolveOfferEconomicsEditor(editor, 'JPY').values.price).toBe('924')
    expect(resolveOfferEconomicsEditor(editor, 'KWD').values.price).toBe('923.077')
  })

  it('is deterministic and does not mutate editor state', () => {
    const initial = createOfferEconomicsEditor(blankDraft)
    const original = structuredClone(initial)
    const first = editOfferEconomics(initial, 'price', '997')
    const second = editOfferEconomics(initial, 'price', '997')

    expect(initial).toEqual(original)
    expect(first).toEqual(second)
  })
})
