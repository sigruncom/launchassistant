import { launchInputSchema, type LaunchInputs } from './schema'
import { currencyMinorUnitDigits, currencyMinorUnitScale } from './currency'

export const CALCULATOR_VERSION = 'prototype-0.5.0'
export const SALES_CONVERSION_BASIS = 'all-workshop-signups' as const

export type ScenarioKey = 'cautious' | 'planning' | 'benchmark'

export type FormulaTrace = {
  id: string
  label: string
  expression: string
  result: number
  source: 'derived' | 'user input'
}

export type LaunchScenario = {
  key: ScenarioKey
  label: string
  conversionRatePercent: 1 | 2 | 3
  buyersRequired: number
  registrationsRequired: number
  attendeesExpected: number
  projectedAttendeesExpected: number
  groupJoinsExpected: number | null
  paidRegistrationGap: number
  requiredAdSpendMinorUnits: bigint
  budgetSupportedPaidRegistrations: number
  projectedRegistrations: number
  projectedBuyers: number
  projectedRevenueMinorUnits: bigint
  registrationGapAfterBudget: number
  trace: FormulaTrace[]
}

export type LaunchCalculation = {
  calculatorVersion: string
  salesConversionBasis: typeof SALES_CONVERSION_BASIS
  minorUnitDigits: number
  minorUnitScale: number
  goalMinorUnits: bigint
  priceMinorUnits: bigint
  costPerLeadMinorUnits: bigint
  adBudgetMinorUnits: bigint
  scenarios: LaunchScenario[]
  selected: LaunchScenario
}

const scenarios: Array<{
  key: ScenarioKey
  label: string
  conversionRatePercent: 1 | 2 | 3
}> = [
  { key: 'cautious', label: 'Cautious', conversionRatePercent: 1 },
  { key: 'planning', label: 'Planning', conversionRatePercent: 2 },
  { key: 'benchmark', label: 'Sigrun benchmark', conversionRatePercent: 3 },
]

const toMinorUnits = (value: number, scale: number) =>
  BigInt(Math.round(value * scale))

const ceilDivideBigInt = (numerator: bigint, denominator: bigint) =>
  (numerator + denominator - 1n) / denominator

export const ceilDivide = (numerator: number, denominator: number) => {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator <= 0) {
    throw new Error('ceilDivide requires finite values and a positive denominator.')
  }

  return Math.ceil(numerator / denominator)
}

export const calculateLaunch = (rawInputs: LaunchInputs): LaunchCalculation => {
  const inputs = launchInputSchema.parse(rawInputs)
  const minorUnitDigits = currencyMinorUnitDigits(inputs.currency)
  const minorUnitScale = currencyMinorUnitScale(inputs.currency)
  const goalMinorUnits = toMinorUnits(inputs.revenueGoal, minorUnitScale)
  const priceMinorUnits = toMinorUnits(inputs.price, minorUnitScale)
  const costPerLeadMinorUnits = toMinorUnits(inputs.costPerLead, minorUnitScale)
  const adBudgetMinorUnits = toMinorUnits(inputs.adBudget, minorUnitScale)
  const buyersRequiredExact = ceilDivideBigInt(goalMinorUnits, priceMinorUnits)
  if (buyersRequiredExact > 100_000_000n) {
    throw new Error('The required buyer target is too large for this prototype.')
  }
  const buyersRequired = Number(buyersRequiredExact)

  const calculatedScenarios = scenarios.map<LaunchScenario>((scenario) => {
    const conversionBasisPoints = scenario.conversionRatePercent * 100
    const registrationsRequired = ceilDivide(buyersRequired * 10_000, conversionBasisPoints)
    const attendeesExpected = Math.round(
      registrationsRequired * (inputs.showUpRatePercent / 100),
    )
    const groupJoinsExpected =
      inputs.workshopGroup !== 'none' && inputs.groupJoinRatePercent !== null
        ? Math.round(registrationsRequired * (inputs.groupJoinRatePercent / 100))
        : null
    const paidRegistrationGap = Math.max(
      0,
      registrationsRequired - inputs.organicRegistrations,
    )
    const requiredAdSpendMinorUnits = BigInt(paidRegistrationGap) * costPerLeadMinorUnits
    const budgetSupportedPaidRegistrations =
      costPerLeadMinorUnits > 0n
        ? Number(adBudgetMinorUnits / costPerLeadMinorUnits)
        : 0
    const projectedRegistrations =
      inputs.organicRegistrations + budgetSupportedPaidRegistrations
    const projectedAttendeesExpected = Math.round(
      projectedRegistrations * (inputs.showUpRatePercent / 100),
    )
    const projectedBuyers = Math.floor(
      projectedRegistrations * (scenario.conversionRatePercent / 100),
    )
    const projectedRevenueMinorUnits = BigInt(projectedBuyers) * priceMinorUnits
    const registrationGapAfterBudget = Math.max(
      0,
      registrationsRequired - projectedRegistrations,
    )

    return {
      ...scenario,
      buyersRequired,
      registrationsRequired,
      attendeesExpected,
      projectedAttendeesExpected,
      groupJoinsExpected,
      paidRegistrationGap,
      requiredAdSpendMinorUnits,
      budgetSupportedPaidRegistrations,
      projectedRegistrations,
      projectedBuyers,
      projectedRevenueMinorUnits,
      registrationGapAfterBudget,
      trace: [
        {
          id: 'FORMULA-BUYERS-001',
          label: 'Required buyers',
          expression: `ceil(${goalMinorUnits} / ${priceMinorUnits})`,
          result: buyersRequired,
          source: 'derived',
        },
        {
          id: 'FORMULA-REGISTRATIONS-001',
          label: 'Required workshop signups',
          expression: `ceil(${buyersRequired} / ${scenario.conversionRatePercent}%)`,
          result: registrationsRequired,
          source: 'derived',
        },
        {
          id: 'FORMULA-ATTENDANCE-001',
          label: 'Expected live attendance',
          expression: `${registrationsRequired} × ${inputs.showUpRatePercent}%`,
          result: attendeesExpected,
          source: 'user input',
        },
        {
          id: 'FORMULA-PAID-GAP-001',
          label: 'Paid registration gap',
          expression: `max(0, ${registrationsRequired} − ${inputs.organicRegistrations})`,
          result: paidRegistrationGap,
          source: 'derived',
        },
      ],
    }
  })

  const selected = calculatedScenarios.find(
    (scenario) => scenario.conversionRatePercent === inputs.conversionRatePercent,
  )

  if (!selected) {
    throw new Error('The selected scenario could not be calculated.')
  }

  return {
    calculatorVersion: CALCULATOR_VERSION,
    salesConversionBasis: SALES_CONVERSION_BASIS,
    minorUnitDigits,
    minorUnitScale,
    goalMinorUnits,
    priceMinorUnits,
    costPerLeadMinorUnits,
    adBudgetMinorUnits,
    scenarios: calculatedScenarios,
    selected,
  }
}

export const calculateReviewMetrics = (values: {
  launchListSize: number
  paidRegistrations: number
  adSpend: number
  buyers: number
  price: number
}) => {
  const revenue = values.buyers * values.price

  return {
    conversionRatePercent: (values.buyers / values.launchListSize) * 100,
    costPerLead: values.adSpend / values.paidRegistrations,
    revenue,
    earningsPerLead: revenue / values.launchListSize,
  }
}
