export const offerEconomicsFieldValues = [
  'price',
  'spotsToSell',
  'revenueGoal',
] as const

export type OfferEconomicsField = (typeof offerEconomicsFieldValues)[number]

export type OfferEconomicsDraft = Record<OfferEconomicsField, string>

export type OfferEconomicsErrors = Partial<Record<OfferEconomicsField, string>>

export type OfferEconomicsEditorState = {
  draft: OfferEconomicsDraft
  pendingCalculatedField?: OfferEconomicsField
  sourceOrder: OfferEconomicsField[]
}

export type ResolvedOfferEconomicsEditor = {
  calculatedField: OfferEconomicsField | null
  result: OfferEconomicsResult | null
  values: OfferEconomicsDraft
}

export const offerEconomicsLimits = {
  price: 1_000_000,
  spotsToSell: 100_000_000,
  revenueGoal: 100_000_000,
} as const

export const hasSupportedCentPrecision = (value: number) =>
  Number.isFinite(value) && Number(value.toFixed(2)) === value

type OfferEconomicsValues = {
  priceCents: bigint
  spotsToSell: bigint
  revenueGoalCents: bigint
  impliedRevenueCents: bigint
  overGoalCents: bigint
}

export type OfferEconomicsResult =
  | {
      success: true
      calculatedField: OfferEconomicsField
      values: OfferEconomicsDraft
      errors: OfferEconomicsErrors
      numbers: {
        price: number
        spotsToSell: number
        revenueGoal: number
      }
      exact: OfferEconomicsValues
    }
  | {
      success: false
      calculatedField: OfferEconomicsField
      values: OfferEconomicsDraft
      errors: OfferEconomicsErrors
    }

const CENTS_PER_UNIT = 100n
const MAX_PRICE_CENTS = BigInt(offerEconomicsLimits.price) * CENTS_PER_UNIT
const MAX_REVENUE_CENTS = BigInt(offerEconomicsLimits.revenueGoal) * CENTS_PER_UNIT
const MAX_SPOTS = BigInt(offerEconomicsLimits.spotsToSell)

const ceilDivide = (numerator: bigint, denominator: bigint) =>
  (numerator + denominator - 1n) / denominator

const formatCentsForInput = (cents: bigint) => {
  const whole = cents / CENTS_PER_UNIT
  const fraction = cents % CENTS_PER_UNIT

  return fraction === 0n
    ? whole.toString()
    : `${whole}.${fraction.toString().padStart(2, '0')}`
}

const parseMoney = (
  rawValue: string,
  field: 'price' | 'revenueGoal',
): { value?: bigint; error?: string } => {
  const value = rawValue.trim()
  const label = field === 'price' ? 'price per client' : 'revenue goal'

  if (value === '') {
    return { error: `Enter a ${label}.` }
  }

  const match = /^(\d+)(?:\.(\d{1,2}))?$/.exec(value)
  if (!match) {
    return { error: `Enter a positive ${label} with no more than two decimals.` }
  }

  const cents = BigInt(match[1]) * CENTS_PER_UNIT + BigInt((match[2] ?? '').padEnd(2, '0'))
  if (cents <= 0n) {
    return { error: `Enter a ${label} of at least 0.01.` }
  }

  const maximum = field === 'price' ? MAX_PRICE_CENTS : MAX_REVENUE_CENTS
  if (cents > maximum) {
    return {
      error:
        field === 'price'
          ? 'Price per client is too large for this prototype.'
          : 'Revenue goal is too large for this prototype.',
    }
  }

  return { value: cents }
}

const parseSpots = (rawValue: string): { value?: bigint; error?: string } => {
  const value = rawValue.trim()

  if (value === '') {
    return { error: 'Enter the number of client spots.' }
  }

  if (!/^\d+$/.test(value)) {
    return { error: 'Enter a positive whole number of client spots.' }
  }

  const spots = BigInt(value)
  if (spots <= 0n) {
    return { error: 'Enter at least one client spot.' }
  }

  if (spots > MAX_SPOTS) {
    return { error: 'Client spots are too large for this prototype.' }
  }

  return { value: spots }
}

const offerEconomicsFieldError = (
  field: OfferEconomicsField,
  value: string,
) => field === 'spotsToSell'
  ? parseSpots(value).error
  : parseMoney(value, field).error

const invalidResult = (
  draft: OfferEconomicsDraft,
  calculatedField: OfferEconomicsField,
  errors: OfferEconomicsErrors,
): OfferEconomicsResult => ({
  success: false,
  calculatedField,
  values: { ...draft, [calculatedField]: '' },
  errors,
})

const successfulResult = (
  calculatedField: OfferEconomicsField,
  exact: OfferEconomicsValues,
): OfferEconomicsResult => ({
  success: true,
  calculatedField,
  values: {
    price: formatCentsForInput(exact.priceCents),
    spotsToSell: exact.spotsToSell.toString(),
    revenueGoal: formatCentsForInput(exact.revenueGoalCents),
  },
  errors: {},
  numbers: {
    price: Number(exact.priceCents) / 100,
    spotsToSell: Number(exact.spotsToSell),
    revenueGoal: Number(exact.revenueGoalCents) / 100,
  },
  exact,
})

export const calculateOfferEconomics = (
  draft: OfferEconomicsDraft,
  calculatedField: OfferEconomicsField,
): OfferEconomicsResult => {
  if (calculatedField === 'spotsToSell') {
    const price = parseMoney(draft.price, 'price')
    const goal = parseMoney(draft.revenueGoal, 'revenueGoal')
    const errors: OfferEconomicsErrors = {
      ...(price.error ? { price: price.error } : {}),
      ...(goal.error ? { revenueGoal: goal.error } : {}),
    }

    if (price.value === undefined || goal.value === undefined) {
      return invalidResult(draft, calculatedField, errors)
    }

    const spotsToSell = ceilDivide(goal.value, price.value)
    if (spotsToSell > MAX_SPOTS) {
      return invalidResult(draft, calculatedField, {
        spotsToSell: 'The calculated client-spots target is too large for this prototype.',
      })
    }

    const impliedRevenueCents = price.value * spotsToSell
    if (impliedRevenueCents > MAX_REVENUE_CENTS) {
      return invalidResult(draft, calculatedField, {
        spotsToSell: 'The calculated plan exceeds the revenue limit for this prototype.',
      })
    }

    return successfulResult(calculatedField, {
      priceCents: price.value,
      spotsToSell,
      revenueGoalCents: goal.value,
      impliedRevenueCents,
      overGoalCents: impliedRevenueCents - goal.value,
    })
  }

  if (calculatedField === 'revenueGoal') {
    const price = parseMoney(draft.price, 'price')
    const spots = parseSpots(draft.spotsToSell)
    const errors: OfferEconomicsErrors = {
      ...(price.error ? { price: price.error } : {}),
      ...(spots.error ? { spotsToSell: spots.error } : {}),
    }

    if (price.value === undefined || spots.value === undefined) {
      return invalidResult(draft, calculatedField, errors)
    }

    const revenueGoalCents = price.value * spots.value
    if (revenueGoalCents > MAX_REVENUE_CENTS) {
      return invalidResult(draft, calculatedField, {
        revenueGoal: 'The calculated revenue goal is too large for this prototype.',
      })
    }

    return successfulResult(calculatedField, {
      priceCents: price.value,
      spotsToSell: spots.value,
      revenueGoalCents,
      impliedRevenueCents: revenueGoalCents,
      overGoalCents: 0n,
    })
  }

  const goal = parseMoney(draft.revenueGoal, 'revenueGoal')
  const spots = parseSpots(draft.spotsToSell)
  const errors: OfferEconomicsErrors = {
    ...(goal.error ? { revenueGoal: goal.error } : {}),
    ...(spots.error ? { spotsToSell: spots.error } : {}),
  }

  if (goal.value === undefined || spots.value === undefined) {
    return invalidResult(draft, calculatedField, errors)
  }

  const priceCents = ceilDivide(goal.value, spots.value)
  if (priceCents > MAX_PRICE_CENTS) {
    return invalidResult(draft, calculatedField, {
      price: 'The calculated price per client is too large for this prototype.',
    })
  }

  const requiredSpotsAtRoundedPrice = ceilDivide(goal.value, priceCents)
  if (requiredSpotsAtRoundedPrice !== spots.value) {
    return invalidResult(draft, calculatedField, {
      spotsToSell:
        'That goal is too small for this many client spots at whole-cent prices. Lower the spots or raise the goal.',
    })
  }

  const impliedRevenueCents = priceCents * spots.value
  if (impliedRevenueCents > MAX_REVENUE_CENTS) {
    return invalidResult(draft, calculatedField, {
      price: 'The calculated plan exceeds the revenue limit for this prototype.',
    })
  }

  return successfulResult(calculatedField, {
    priceCents,
    spotsToSell: spots.value,
    revenueGoalCents: goal.value,
    impliedRevenueCents,
    overGoalCents: impliedRevenueCents - goal.value,
  })
}

const initialSourcePriority: OfferEconomicsField[] = [
  'revenueGoal',
  'price',
  'spotsToSell',
]

export const createOfferEconomicsEditor = (
  draft: OfferEconomicsDraft,
): OfferEconomicsEditorState => ({
  draft: { ...draft },
  sourceOrder: initialSourcePriority
    .filter((field) => draft[field].trim() !== '')
    .slice(-2),
})

export const resolveOfferEconomicsEditor = (
  editor: OfferEconomicsEditorState,
): ResolvedOfferEconomicsEditor => {
  if (editor.sourceOrder.length < 2) {
    return {
      calculatedField: null,
      result: null,
      values: { ...editor.draft },
    }
  }

  const calculatedField = offerEconomicsFieldValues.find(
    (field) => !editor.sourceOrder.includes(field),
  )

  if (!calculatedField) {
    throw new Error('Offer economics requires two distinct source fields.')
  }

  if (editor.pendingCalculatedField === calculatedField) {
    const error = offerEconomicsFieldError(calculatedField, editor.draft[calculatedField])
    if (error) {
      return {
        calculatedField,
        result: {
          success: false,
          calculatedField,
          values: { ...editor.draft },
          errors: { [calculatedField]: error },
        },
        values: { ...editor.draft },
      }
    }
  }

  const result = calculateOfferEconomics(editor.draft, calculatedField)
  return {
    calculatedField,
    result,
    values: result.values,
  }
}

export const editOfferEconomics = (
  editor: OfferEconomicsEditorState,
  field: OfferEconomicsField,
  value: string,
): OfferEconomicsEditorState => {
  const current = resolveOfferEconomicsEditor(editor)
  const editingCalculatedField = current.calculatedField === field
    && !editor.sourceOrder.includes(field)

  if (editingCalculatedField && offerEconomicsFieldError(field, value)) {
    return {
      draft: {
        ...current.values,
        [field]: value,
      },
      pendingCalculatedField: field,
      sourceOrder: [...editor.sourceOrder],
    }
  }

  const sourceOrder = [
    ...editor.sourceOrder.filter((sourceField) => sourceField !== field),
    field,
  ].slice(-2)

  return {
    draft: {
      ...current.values,
      [field]: value,
    },
    pendingCalculatedField: undefined,
    sourceOrder,
  }
}

export const offerEconomicsDraftFromNumbers = (
  price: number,
  revenueGoal: number,
): OfferEconomicsDraft => ({
  price: formatCentsForInput(BigInt(Math.round(price * 100))),
  spotsToSell: '',
  revenueGoal: formatCentsForInput(BigInt(Math.round(revenueGoal * 100))),
})

export const offerEconomicsErrors = (result: OfferEconomicsResult | null) =>
  result
    ? result.success
      ? []
      : [...new Set(Object.values(result.errors))]
    : ['Enter values in any two fields so the third can be calculated.']
