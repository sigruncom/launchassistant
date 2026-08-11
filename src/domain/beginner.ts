import { z } from 'zod'
import {
  audienceContextValues,
  conversionValues,
  currencyValues,
  launchInputSchema,
  workshopDurationValues,
  type LaunchInputs,
} from './schema'
import { offerEconomicsLimits } from './offerEconomics'

export const beginnerResearchValues = ['yes', 'not-yet'] as const
export const beginnerYesNoValues = ['yes', 'no'] as const

export type BeginnerResearch = (typeof beginnerResearchValues)[number]
export type BeginnerYesNo = (typeof beginnerYesNoValues)[number]

export type BeginnerDraft = {
  currency: LaunchInputs['currency'] | ''
  price: string
  spotsToSell: string
  revenueGoal: string
  organicRegistrations: string
  audienceContext: LaunchInputs['audienceContext'] | ''
  workshopDurationDays: LaunchInputs['workshopDurationDays'] | ''
  showUpRatePercent: string
  replayOffered: BeginnerYesNo | ''
  showUpBonusPlanned: BeginnerYesNo | ''
  conversionRatePercent: LaunchInputs['conversionRatePercent'] | ''
  groupJoinRatePercent: string
  recentResearch: BeginnerResearch | ''
  surveyResponses: string
  facebookGroupFit: BeginnerYesNo | ''
}

const requiredMoney = (label: string, maximum: number) =>
  z
    .string()
    .trim()
    .refine((value) => value !== '', { message: `Enter ${label}.` })
    .refine(
      (value) => value === '' || /^\d+(?:\.\d{1,2})?$/.test(value),
      { message: `Enter a valid ${label} with no more than two decimals.` },
    )
    .refine(
      (value) => value === '' || !/^\d+(?:\.\d{1,2})?$/.test(value) || Number(value) >= 0.01,
      { message: `Enter ${label} of at least 0.01.` },
    )
    .refine(
      (value) =>
        value === '' ||
        !/^\d+(?:\.\d{1,2})?$/.test(value) ||
        (Number.isFinite(Number(value)) && Number(value) <= maximum),
      { message: `${label[0].toUpperCase()}${label.slice(1)} is too large for this prototype.` },
    )
    .transform(Number)

const requiredWholeNumber = (label: string, maximum: number) =>
  z
    .string()
    .trim()
    .refine((value) => value !== '', { message: `Enter ${label}.` })
    .refine(
      (value) =>
        value === '' ||
        (Number.isFinite(Number(value)) && Number.isInteger(Number(value)) && Number(value) >= 0),
      { message: `Enter a whole number for ${label}.` },
    )
    .refine(
      (value) => value === '' || !Number.isFinite(Number(value)) || Number(value) <= maximum,
      { message: `${label[0].toUpperCase()}${label.slice(1)} is too large for this prototype.` },
    )
    .transform(Number)

const requiredPercent = (label: string, maximum: number) =>
  z
    .string()
    .trim()
    .refine((value) => value !== '', { message: `Enter ${label}.` })
    .refine(
      (value) =>
        value === '' ||
        (Number.isFinite(Number(value)) && Number(value) >= 1 && Number(value) <= maximum),
      { message: `Enter ${label} between 1% and ${maximum}%.` },
    )
    .transform(Number)

export const beginnerGoalSchema = z.object({
  currency: z.enum(currencyValues, { error: 'Choose a currency.' }),
  price: requiredMoney('what one client will pay', offerEconomicsLimits.price),
  revenueGoal: requiredMoney('your revenue goal', offerEconomicsLimits.revenueGoal),
})

export const beginnerReachSchema = beginnerGoalSchema.extend({
  organicRegistrations: requiredWholeNumber(
    'your expected registrations without ads',
    100_000_000,
  ),
})

export const beginnerWorkshopSchema = beginnerReachSchema.extend({
  audienceContext: z.enum(audienceContextValues, {
    error: 'Choose the audience type that fits best.',
  }),
  workshopDurationDays: z.union(
    [z.literal(workshopDurationValues[0]), z.literal(workshopDurationValues[1])],
    { error: 'Choose a one-day or three-day workshop.' },
  ),
})

export const beginnerAttendanceSchema = beginnerWorkshopSchema.extend({
  showUpRatePercent: requiredPercent('an expected live show-up rate', 100),
  replayOffered: z
    .enum(beginnerYesNoValues, { error: 'Choose whether a replay will be offered.' })
    .transform((value) => value === 'yes'),
  showUpBonusPlanned: z
    .enum(beginnerYesNoValues, { error: 'Choose whether a show-up bonus is planned.' })
    .transform((value) => value === 'yes'),
})

export const beginnerSalesSchema = beginnerAttendanceSchema.extend({
  conversionRatePercent: z.union(
    [
      z.literal(conversionValues[0]),
      z.literal(conversionValues[1]),
      z.literal(conversionValues[2]),
    ],
    { error: 'Choose a 1%, 2% or 3% sales case.' },
  ),
  groupJoinRatePercent: requiredPercent('an expected workshop-group join rate', 100),
})

export const beginnerAnswerSchema = beginnerSalesSchema.extend({
  recentResearch: z
    .enum(beginnerResearchValues, {
      error: 'Choose Yes or Not yet for recent client research.',
    })
    .transform((value) => value === 'yes'),
  surveyResponses: requiredWholeNumber('survey responses collected', 100_000),
  facebookGroupFit: z
    .enum(beginnerYesNoValues, {
      error: 'Choose whether an online workshop group fits this audience.',
    })
    .transform((value) => value === 'yes'),
})

export type BeginnerAnswers = z.output<typeof beginnerAnswerSchema>

export const beginnerBlank: BeginnerDraft = {
  currency: '',
  price: '',
  spotsToSell: '',
  revenueGoal: '',
  organicRegistrations: '',
  audienceContext: '',
  workshopDurationDays: '',
  showUpRatePercent: '',
  replayOffered: '',
  showUpBonusPlanned: '',
  conversionRatePercent: '',
  groupJoinRatePercent: '',
  recentResearch: '',
  surveyResponses: '',
  facebookGroupFit: '',
}

export const toBeginnerLaunchInputs = (answers: BeginnerAnswers): LaunchInputs =>
  launchInputSchema.parse({
    offerName: 'My launch plan',
    offerType: 'undecided',
    currency: answers.currency,
    price: answers.price,
    revenueGoal: answers.revenueGoal,
    organicRegistrations: answers.organicRegistrations,
    costPerLead: 0,
    adBudget: 0,
    audienceContext: answers.audienceContext,
    workshopDurationDays: answers.workshopDurationDays,
    replayOffered: answers.replayOffered,
    showUpBonusPlanned: answers.showUpBonusPlanned,
    recentResearch: answers.recentResearch,
    surveyResponses: answers.surveyResponses,
    facebookGroupFit: answers.facebookGroupFit,
    conversionRatePercent: answers.conversionRatePercent,
    showUpRatePercent: answers.showUpRatePercent,
    groupJoinRatePercent: answers.groupJoinRatePercent,
  })
