import { z } from 'zod'
import {
  currencyValues,
  type LaunchInputs,
} from './schema'

export const beginnerReadinessValues = ['new', 'building', 'ready'] as const
export const beginnerResearchValues = ['yes', 'not-yet'] as const

export type BeginnerReadiness = (typeof beginnerReadinessValues)[number]
export type BeginnerResearch = (typeof beginnerResearchValues)[number]

export type BeginnerDraft = {
  currency: LaunchInputs['currency']
  price: string
  revenueGoal: string
  organicRegistrations: string
  readiness: BeginnerReadiness | ''
  recentResearch: BeginnerResearch | ''
}

const requiredPositiveNumber = (label: string, maximum: number) =>
  z
    .string()
    .trim()
    .refine((value) => value !== '', { message: `Enter ${label}.` })
    .refine(
      (value) => value === '' || (Number.isFinite(Number(value)) && Number(value) > 0),
      { message: `Enter a valid ${label}.` },
    )
    .refine(
      (value) =>
        value === '' || !Number.isFinite(Number(value)) || Number(value) <= maximum,
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
      (value) =>
        value === '' || !Number.isFinite(Number(value)) || Number(value) <= maximum,
      { message: `${label[0].toUpperCase()}${label.slice(1)} is too large for this prototype.` },
    )
    .transform(Number)

export const beginnerGoalSchema = z.object({
  currency: z.enum(currencyValues),
  price: requiredPositiveNumber('what one client will pay', 1_000_000),
  revenueGoal: requiredPositiveNumber('your revenue goal', 100_000_000),
})

export const beginnerAnswerSchema = beginnerGoalSchema.extend({
  organicRegistrations: requiredWholeNumber(
    'your expected registrations without ads',
    100_000_000,
  ),
  readiness: z.enum(beginnerReadinessValues, {
    error: 'Choose the situation that best describes this launch.',
  }),
  recentResearch: z
    .enum(beginnerResearchValues, {
      error: 'Choose Yes or Not yet for recent client research.',
    })
    .transform((value) => value === 'yes'),
})

export type BeginnerAnswers = z.output<typeof beginnerAnswerSchema>

export const beginnerBlank: BeginnerDraft = {
  currency: 'EUR',
  price: '',
  revenueGoal: '',
  organicRegistrations: '',
  readiness: '',
  recentResearch: '',
}

const readinessMapping: Record<
  BeginnerReadiness,
  Pick<LaunchInputs, 'launchExperience' | 'audienceWarmth' | 'problemAwareness'>
> = {
  new: {
    launchExperience: 'first',
    audienceWarmth: 'cold',
    problemAwareness: 'curious',
  },
  building: {
    launchExperience: 'some',
    audienceWarmth: 'mixed',
    problemAwareness: 'aware',
  },
  ready: {
    launchExperience: 'experienced',
    audienceWarmth: 'warm',
    problemAwareness: 'ready',
  },
}

export const toBeginnerLaunchInputs = (answers: BeginnerAnswers): LaunchInputs =>
  ({
    offerName: 'My beginner launch plan',
    offerType: 'undecided',
    currency: answers.currency,
    price: answers.price,
    revenueGoal: answers.revenueGoal,
    emailListSize: 0,
    socialFollowers: 0,
    organicRegistrations: answers.organicRegistrations,
    costPerLead: 0,
    adBudget: 0,
    ...readinessMapping[answers.readiness],
    recentResearch: answers.recentResearch,
    surveyResponses: 0,
    facebookGroupFit: true,
    conversionRatePercent: 2,
    showUpRatePercent: 30,
    groupJoinRatePercent: 60,
  })
