import { z } from 'zod'
import {
  audienceContextValues,
  conversionValues,
  currencySchema,
  launchInputSchema,
  workshopDurationValues,
  type LaunchInputs,
} from './schema'
import {
  moneyInputError,
  offerEconomicsErrors,
  offerEconomicsLimits,
  type OfferEconomicsResult,
} from './offerEconomics'
import {
  currencyCodeError,
  type CurrencyCode,
  type CurrencySelectValue,
} from './currency'

export const beginnerResearchValues = ['yes', 'not-yet'] as const
export const beginnerYesNoValues = ['yes', 'no'] as const
export const EMAIL_LIST_SIZE_MAX = 100_000_000
export const ORGANIC_SIGNUP_RATE_DEFAULT = 10
export const ORGANIC_SIGNUP_RATE_MAX = 50
export const BEGINNER_SHOW_UP_RATE_DEFAULT = 20
export const EMAIL_REACH_SOURCE_ID = 'SIGRUN-REACH-2026-08-11' as const

export type EmailReachTrace = {
  id: 'EMAIL-REACH-ESTIMATE'
  label: 'Estimated registrations from your email list'
  expression: string
  result: number
  source: 'derived'
  emailListSize: number
  signupRatePercent: number
  rounding: 'nearest whole registration'
  sourceId: typeof EMAIL_REACH_SOURCE_ID
}

export type BeginnerResearch = (typeof beginnerResearchValues)[number]
export type BeginnerYesNo = (typeof beginnerYesNoValues)[number]

export const beginnerGoalFallbackErrors = (
  currency: CurrencySelectValue,
  economics: OfferEconomicsResult | null,
) => {
  const currencyError = currencyCodeError(currency)
  return [
    ...(currencyError ? [currencyError] : []),
    ...offerEconomicsErrors(economics),
  ]
}

export type BeginnerDraft = {
  currency: CurrencySelectValue
  price: string
  spotsToSell: string
  revenueGoal: string
  emailListSize: string
  organicSignupRatePercent: string
  audienceContext: LaunchInputs['audienceContext'] | ''
  workshopDurationDays: LaunchInputs['workshopDurationDays'] | ''
  showUpRatePercent: string
  replayOffered: BeginnerYesNo | ''
  showUpBonusPlanned: BeginnerYesNo | ''
  conversionRatePercent: LaunchInputs['conversionRatePercent'] | ''
  recentResearch: BeginnerResearch | ''
  surveyResponses: string
}

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

const requiredPercent = (label: string, maximum: number, minimum = 1) =>
  z
    .string()
    .trim()
    .refine((value) => value !== '', { message: `Enter ${label}.` })
    .refine(
      (value) =>
        value === '' ||
        (Number.isFinite(Number(value)) && Number(value) >= minimum && Number(value) <= maximum),
      { message: `Enter ${label} between ${minimum}% and ${maximum}%.` },
    )
    .transform(Number)

export const createEmailReachTrace = (
  emailListSize: number,
  signupRatePercent: number,
): EmailReachTrace => {
  if (
    !Number.isFinite(emailListSize) ||
    !Number.isInteger(emailListSize) ||
    emailListSize < 0 ||
    emailListSize > EMAIL_LIST_SIZE_MAX ||
    !Number.isFinite(signupRatePercent) ||
    signupRatePercent < 0 ||
    signupRatePercent > ORGANIC_SIGNUP_RATE_MAX
  ) {
    throw new Error('Email reach requires a valid list size and a signup rate from 0% to 50%.')
  }

  const result = Math.round(emailListSize * (signupRatePercent / 100))

  return {
    id: 'EMAIL-REACH-ESTIMATE',
    label: 'Estimated registrations from your email list',
    expression: `round(${emailListSize} × ${signupRatePercent}%)`,
    result,
    source: 'derived',
    emailListSize,
    signupRatePercent,
    rounding: 'nearest whole registration',
    sourceId: EMAIL_REACH_SOURCE_ID,
  }
}

export const estimateOrganicRegistrationsFromEmailList = (
  emailListSize: number,
  signupRatePercent: number,
) => createEmailReachTrace(emailListSize, signupRatePercent).result

const beginnerGoalShape = {
  currency: currencySchema,
  price: z.string(),
  revenueGoal: z.string(),
} satisfies z.ZodRawShape

const beginnerReachShape = {
  emailListSize: requiredWholeNumber(
    'the number of people on your email list',
    EMAIL_LIST_SIZE_MAX,
  ),
  organicSignupRatePercent: requiredPercent(
    'an expected email registration rate',
    ORGANIC_SIGNUP_RATE_MAX,
    0,
  ),
} satisfies z.ZodRawShape

const beginnerWorkshopShape = {
  audienceContext: z.enum(audienceContextValues, {
    error: 'Choose the audience type that fits best.',
  }),
  workshopDurationDays: z.union(
    [z.literal(workshopDurationValues[0]), z.literal(workshopDurationValues[1])],
    { error: 'Choose a one-day or three-day workshop.' },
  ),
} satisfies z.ZodRawShape

const beginnerAttendanceShape = {
  showUpRatePercent: requiredPercent('an expected live show-up rate', 100),
  replayOffered: z
    .enum(beginnerYesNoValues, { error: 'Choose whether a replay will be offered.' })
    .transform((value) => value === 'yes'),
  showUpBonusPlanned: z
    .enum(beginnerYesNoValues, { error: 'Choose whether a show-up bonus is planned.' })
    .transform((value) => value === 'yes'),
} satisfies z.ZodRawShape

const beginnerSalesShape = {
  conversionRatePercent: z.union(
    [
      z.literal(conversionValues[0]),
      z.literal(conversionValues[1]),
      z.literal(conversionValues[2]),
    ],
    { error: 'Choose a 1%, 2% or 3% sales case.' },
  ),
} satisfies z.ZodRawShape

const beginnerAnswerShape = {
  recentResearch: z
    .enum(beginnerResearchValues, {
      error: 'Choose Yes or Not yet for recent client research.',
    })
    .transform((value) => value === 'yes'),
  surveyResponses: requiredWholeNumber('survey responses collected', 100_000),
} satisfies z.ZodRawShape

type BeginnerGoalDraft = {
  currency: CurrencyCode
  price: string
  revenueGoal: string
}

const createBeginnerSchema = <Shape extends z.ZodRawShape>(shape: Shape) =>
  z
    .object({ ...beginnerGoalShape, ...shape })
    .superRefine((value, context) => {
      const goal = value as BeginnerGoalDraft
      const priceError = moneyInputError(
        goal.price,
        'what one client will pay',
        offerEconomicsLimits.price,
        goal.currency,
      )
      const revenueError = moneyInputError(
        goal.revenueGoal,
        'your revenue goal',
        offerEconomicsLimits.revenueGoal,
        goal.currency,
      )

      if (priceError) {
        context.addIssue({ code: 'custom', path: ['price'], message: priceError })
      }
      if (revenueError) {
        context.addIssue({ code: 'custom', path: ['revenueGoal'], message: revenueError })
      }
    })
    .transform((value) => {
      const goal = value as BeginnerGoalDraft
      return {
        ...value,
        price: Number(goal.price),
        revenueGoal: Number(goal.revenueGoal),
      }
    })

export const beginnerGoalSchema = createBeginnerSchema({})

export const beginnerReachSchema = createBeginnerSchema({
  ...beginnerReachShape,
})

export const beginnerWorkshopSchema = createBeginnerSchema({
  ...beginnerReachShape,
  ...beginnerWorkshopShape,
})

export const beginnerAttendanceSchema = createBeginnerSchema({
  ...beginnerReachShape,
  ...beginnerWorkshopShape,
  ...beginnerAttendanceShape,
})

export const beginnerSalesSchema = createBeginnerSchema({
  ...beginnerReachShape,
  ...beginnerWorkshopShape,
  ...beginnerAttendanceShape,
  ...beginnerSalesShape,
})

export const beginnerAnswerSchema = createBeginnerSchema({
  ...beginnerReachShape,
  ...beginnerWorkshopShape,
  ...beginnerAttendanceShape,
  ...beginnerSalesShape,
  ...beginnerAnswerShape,
})

export type BeginnerAnswers = z.output<typeof beginnerAnswerSchema>

export const beginnerBlank: BeginnerDraft = {
  currency: 'EUR',
  price: '',
  spotsToSell: '',
  revenueGoal: '',
  emailListSize: '',
  organicSignupRatePercent: String(ORGANIC_SIGNUP_RATE_DEFAULT),
  audienceContext: '',
  workshopDurationDays: '',
  showUpRatePercent: String(BEGINNER_SHOW_UP_RATE_DEFAULT),
  replayOffered: '',
  showUpBonusPlanned: '',
  conversionRatePercent: '',
  recentResearch: '',
  surveyResponses: '',
}

export const toBeginnerLaunchInputs = (answers: BeginnerAnswers): LaunchInputs =>
  launchInputSchema.parse({
    offerName: 'My launch plan',
    offerType: 'undecided',
    currency: answers.currency,
    price: answers.price,
    revenueGoal: answers.revenueGoal,
    organicRegistrations: estimateOrganicRegistrationsFromEmailList(
      answers.emailListSize,
      answers.organicSignupRatePercent,
    ),
    costPerLead: 0,
    adBudget: 0,
    audienceContext: answers.audienceContext,
    workshopDurationDays: answers.workshopDurationDays,
    replayOffered: answers.replayOffered,
    showUpBonusPlanned: answers.showUpBonusPlanned,
    recentResearch: answers.recentResearch,
    surveyResponses: answers.surveyResponses,
    workshopGroup: 'none',
    conversionRatePercent: answers.conversionRatePercent,
    showUpRatePercent: answers.showUpRatePercent,
    groupJoinRatePercent: null,
  })
