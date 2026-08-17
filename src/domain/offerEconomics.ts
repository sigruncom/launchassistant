import {
  currencyMinorUnitDigits,
  currencyMinorUnitScale,
  type CurrencyCode,
} from './currency'

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
  price: 1_000_000_000_000,
  spotsToSell: 100_000_000,
  revenueGoal: 1_000_000_000_000,
} as const

export const hasSupportedCurrencyPrecision = (
  value: number,
  currency: CurrencyCode,
) => Number.isFinite(value)
  && Number(value.toFixed(currencyMinorUnitDigits(currency))) === value

type OfferEconomicsValues = {
  priceMinorUnits: bigint
  spotsToSell: bigint
  revenueGoalMinorUnits: bigint
  impliedRevenueMinorUnits: bigint
  overGoalMinorUnits: bigint
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

const MAX_SPOTS = BigInt(offerEconomicsLimits.spotsToSell)

const ceilDivide = (numerator: bigint, denominator: bigint) =>
  (numerator + denominator - 1n) / denominator

export const formatMinorUnitsForInput = (
  minorUnits: bigint,
  currency: CurrencyCode,
) => {
  const digits = currencyMinorUnitDigits(currency)
  const scale = BigInt(currencyMinorUnitScale(currency))
  const whole = minorUnits / scale
  const fraction = minorUnits % scale

  return digits === 0 || fraction === 0n
    ? whole.toString()
    : `${whole}.${fraction.toString().padStart(digits, '0')}`
}

const precisionDescription = (currency: CurrencyCode) => {
  const digits = currencyMinorUnitDigits(currency)
  if (digits === 0) return 'as a whole amount with no decimals'
  return `with no more than ${digits} decimal places`
}

const minimumMoneyInput = (currency: CurrencyCode) => {
  const digits = currencyMinorUnitDigits(currency)
  return digits === 0 ? '1' : `0.${'0'.repeat(digits - 1)}1`
}

export const moneyInputError = (
  rawValue: string,
  label: string,
  maximum: number,
  currency: CurrencyCode,
  options: { allowZero?: boolean } = {},
) => {
  const value = rawValue.trim()
  if (value === '') return `Enter ${label}.`

  const digits = currencyMinorUnitDigits(currency)
  const pattern = digits === 0
    ? /^\d+$/
    : new RegExp(`^\\d+(?:\\.\\d{1,${digits}})?$`)
  if (!pattern.test(value)) {
    return `Enter a valid ${label} ${precisionDescription(currency)}.`
  }

  const scale = BigInt(currencyMinorUnitScale(currency))
  const [whole, fraction = ''] = value.split('.')
  const minorUnits = BigInt(whole) * scale
    + BigInt(fraction.padEnd(digits, '0') || '0')
  const minimum = options.allowZero ? 0n : 1n
  if (minorUnits < minimum) {
    return options.allowZero
      ? `Enter ${label} of 0 or more.`
      : `Enter ${label} of at least ${minimumMoneyInput(currency)}.`
  }
  if (minorUnits > BigInt(maximum) * scale) {
    return `${label[0].toUpperCase()}${label.slice(1)} is too large for this prototype.`
  }
  return null
}

const parseMoney = (
  rawValue: string,
  field: 'price' | 'revenueGoal',
  currency: CurrencyCode,
): { value?: bigint; error?: string } => {
  const value = rawValue.trim()
  const label = field === 'price' ? 'price per client' : 'revenue goal'
  const maximum = offerEconomicsLimits[field]
  const error = moneyInputError(value, label, maximum, currency)
  if (error) return { error }

  const digits = currencyMinorUnitDigits(currency)
  const scale = BigInt(currencyMinorUnitScale(currency))
  const [whole, fraction = ''] = value.split('.')
  return {
    value: BigInt(whole) * scale + BigInt(fraction.padEnd(digits, '0') || '0'),
  }
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
  currency: CurrencyCode,
) => field === 'spotsToSell'
  ? parseSpots(value).error
  : parseMoney(value, field, currency).error

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
  currency: CurrencyCode,
): OfferEconomicsResult => ({
  success: true,
  calculatedField,
  values: {
    price: formatMinorUnitsForInput(exact.priceMinorUnits, currency),
    spotsToSell: exact.spotsToSell.toString(),
    revenueGoal: formatMinorUnitsForInput(exact.revenueGoalMinorUnits, currency),
  },
  errors: {},
  numbers: {
    price: Number(exact.priceMinorUnits) / currencyMinorUnitScale(currency),
    spotsToSell: Number(exact.spotsToSell),
    revenueGoal: Number(exact.revenueGoalMinorUnits) / currencyMinorUnitScale(currency),
  },
  exact,
})

export const calculateOfferEconomics = (
  draft: OfferEconomicsDraft,
  calculatedField: OfferEconomicsField,
  currency: CurrencyCode = 'EUR',
): OfferEconomicsResult => {
  const scale = BigInt(currencyMinorUnitScale(currency))
  const maximumPriceMinorUnits = BigInt(offerEconomicsLimits.price) * scale
  const maximumRevenueMinorUnits = BigInt(offerEconomicsLimits.revenueGoal) * scale

  if (calculatedField === 'spotsToSell') {
    const price = parseMoney(draft.price, 'price', currency)
    const goal = parseMoney(draft.revenueGoal, 'revenueGoal', currency)
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

    const impliedRevenueMinorUnits = price.value * spotsToSell
    if (impliedRevenueMinorUnits > maximumRevenueMinorUnits) {
      return invalidResult(draft, calculatedField, {
        spotsToSell: 'The calculated plan exceeds the revenue limit for this prototype.',
      })
    }

    return successfulResult(calculatedField, {
      priceMinorUnits: price.value,
      spotsToSell,
      revenueGoalMinorUnits: goal.value,
      impliedRevenueMinorUnits,
      overGoalMinorUnits: impliedRevenueMinorUnits - goal.value,
    }, currency)
  }

  if (calculatedField === 'revenueGoal') {
    const price = parseMoney(draft.price, 'price', currency)
    const spots = parseSpots(draft.spotsToSell)
    const errors: OfferEconomicsErrors = {
      ...(price.error ? { price: price.error } : {}),
      ...(spots.error ? { spotsToSell: spots.error } : {}),
    }

    if (price.value === undefined || spots.value === undefined) {
      return invalidResult(draft, calculatedField, errors)
    }

    const revenueGoalMinorUnits = price.value * spots.value
    if (revenueGoalMinorUnits > maximumRevenueMinorUnits) {
      return invalidResult(draft, calculatedField, {
        revenueGoal: 'The calculated revenue goal is too large for this prototype.',
      })
    }

    return successfulResult(calculatedField, {
      priceMinorUnits: price.value,
      spotsToSell: spots.value,
      revenueGoalMinorUnits,
      impliedRevenueMinorUnits: revenueGoalMinorUnits,
      overGoalMinorUnits: 0n,
    }, currency)
  }

  const goal = parseMoney(draft.revenueGoal, 'revenueGoal', currency)
  const spots = parseSpots(draft.spotsToSell)
  const errors: OfferEconomicsErrors = {
    ...(goal.error ? { revenueGoal: goal.error } : {}),
    ...(spots.error ? { spotsToSell: spots.error } : {}),
  }

  if (goal.value === undefined || spots.value === undefined) {
    return invalidResult(draft, calculatedField, errors)
  }

  const priceMinorUnits = ceilDivide(goal.value, spots.value)
  if (priceMinorUnits > maximumPriceMinorUnits) {
    return invalidResult(draft, calculatedField, {
      price: 'The calculated price per client is too large for this prototype.',
    })
  }

  const requiredSpotsAtRoundedPrice = ceilDivide(goal.value, priceMinorUnits)
  if (requiredSpotsAtRoundedPrice !== spots.value) {
    return invalidResult(draft, calculatedField, {
      spotsToSell:
        `That goal is too small for this many client spots at ${currency}'s smallest currency unit. Lower the spots or raise the goal.`,
    })
  }

  const impliedRevenueMinorUnits = priceMinorUnits * spots.value
  if (impliedRevenueMinorUnits > maximumRevenueMinorUnits) {
    return invalidResult(draft, calculatedField, {
      price: 'The calculated plan exceeds the revenue limit for this prototype.',
    })
  }

  return successfulResult(calculatedField, {
    priceMinorUnits,
    spotsToSell: spots.value,
    revenueGoalMinorUnits: goal.value,
    impliedRevenueMinorUnits,
    overGoalMinorUnits: impliedRevenueMinorUnits - goal.value,
  }, currency)
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
  currency: CurrencyCode = 'EUR',
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
    const error = offerEconomicsFieldError(
      calculatedField,
      editor.draft[calculatedField],
      currency,
    )
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

  const result = calculateOfferEconomics(editor.draft, calculatedField, currency)
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
  currency: CurrencyCode = 'EUR',
): OfferEconomicsEditorState => {
  const current = resolveOfferEconomicsEditor(editor, currency)
  const editingCalculatedField = current.calculatedField === field
    && !editor.sourceOrder.includes(field)

  if (editingCalculatedField && offerEconomicsFieldError(field, value, currency)) {
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
  currency: CurrencyCode = 'EUR',
): OfferEconomicsDraft => ({
  price: formatMinorUnitsForInput(
    BigInt(Math.round(price * currencyMinorUnitScale(currency))),
    currency,
  ),
  spotsToSell: '',
  revenueGoal: formatMinorUnitsForInput(
    BigInt(Math.round(revenueGoal * currencyMinorUnitScale(currency))),
    currency,
  ),
})

export const offerEconomicsErrors = (result: OfferEconomicsResult | null) =>
  result
    ? result.success
      ? []
      : [...new Set(Object.values(result.errors))]
    : ['Enter values in any two fields so the third can be calculated.']
