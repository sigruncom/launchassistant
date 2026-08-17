import { z } from 'zod'
import {
  hasSupportedCurrencyPrecision,
  offerEconomicsLimits,
} from './offerEconomics'
import {
  currencyMinorUnitDigits,
  currencyValues,
  normalizeCurrencyCode,
  type CurrencyCode,
} from './currency'

export const offerTypeValues = ['one-to-one', 'group', 'course', 'undecided'] as const
export const audienceContextValues = ['b2b', 'hobby', 'other'] as const
export const workshopDurationValues = [1, 3] as const
export const conversionValues = [1, 2, 3] as const

export const currencySchema = z.preprocess(
  (value) => typeof value === 'string' ? normalizeCurrencyCode(value) : value,
  z.enum(currencyValues, { error: 'Choose a currency from the international list.' }),
)

export const monetaryInputLimit = offerEconomicsLimits.revenueGoal

const currencyPrecisionMessage = (label: string, currency: CurrencyCode) => {
  const digits = currencyMinorUnitDigits(currency)
  return digits === 0
    ? `${label} must be a whole amount in ${currency}.`
    : `${label} can have no more than ${digits} decimal places in ${currency}.`
}

export const launchInputSchema = z
  .object({
    offerName: z.string().trim().min(1).max(80),
    offerType: z.enum(offerTypeValues),
    currency: currencySchema,
    price: z
      .number()
      .finite()
      .positive()
      .max(offerEconomicsLimits.price),
    revenueGoal: z
      .number()
      .finite()
      .positive()
      .max(offerEconomicsLimits.revenueGoal),
    organicRegistrations: z.number().int().nonnegative().max(100_000_000),
    costPerLead: z.number().finite().nonnegative().max(monetaryInputLimit),
    adBudget: z.number().finite().nonnegative().max(monetaryInputLimit),
    audienceContext: z.enum(audienceContextValues),
    workshopDurationDays: z.union([
      z.literal(workshopDurationValues[0]),
      z.literal(workshopDurationValues[1]),
    ]),
    replayOffered: z.boolean(),
    showUpBonusPlanned: z.boolean(),
    recentResearch: z.boolean(),
    surveyResponses: z.number().int().nonnegative().max(100_000),
    facebookGroupFit: z.boolean(),
    conversionRatePercent: z.union([
      z.literal(conversionValues[0]),
      z.literal(conversionValues[1]),
      z.literal(conversionValues[2]),
    ]),
    showUpRatePercent: z.number().finite().min(1).max(100),
    groupJoinRatePercent: z.number().finite().min(1).max(100),
  })
  .superRefine((value, context) => {
    const precisionFields = [
      ['price', 'Price'],
      ['revenueGoal', 'Revenue goal'],
      ['costPerLead', 'Cost per paid registration'],
      ['adBudget', 'Ad budget'],
    ] as const

    for (const [field, label] of precisionFields) {
      if (!hasSupportedCurrencyPrecision(value[field], value.currency)) {
        context.addIssue({
          code: 'custom',
          path: [field],
          message: currencyPrecisionMessage(label, value.currency),
        })
      }
    }

    if (value.adBudget > 0 && value.costPerLead <= 0) {
      context.addIssue({
        code: 'custom',
        path: ['costPerLead'],
        message: 'Add a cost per lead when an ad budget is planned.',
      })
    }
  })

export type LaunchInputs = z.infer<typeof launchInputSchema>

export const demoInputs: LaunchInputs = {
  offerName: 'Signature group program',
  offerType: 'group',
  currency: 'EUR',
  price: 997,
  revenueGoal: 12_000,
  organicRegistrations: 180,
  costPerLead: 2,
  adBudget: 500,
  audienceContext: 'other',
  workshopDurationDays: 3,
  replayOffered: true,
  showUpBonusPlanned: false,
  recentResearch: false,
  surveyResponses: 12,
  facebookGroupFit: true,
  conversionRatePercent: 2,
  showUpRatePercent: 20,
  groupJoinRatePercent: 60,
}
