import { z } from 'zod'

export const currencyValues = ['EUR', 'USD', 'GBP'] as const
export const offerTypeValues = ['one-to-one', 'group', 'course', 'undecided'] as const
export const experienceValues = ['first', 'some', 'experienced'] as const
export const warmthValues = ['cold', 'mixed', 'warm'] as const
export const awarenessValues = ['curious', 'aware', 'ready'] as const
export const conversionValues = [1, 2, 3] as const

export const launchInputSchema = z
  .object({
    offerName: z.string().trim().min(1).max(80),
    offerType: z.enum(offerTypeValues),
    currency: z.enum(currencyValues),
    price: z.number().finite().positive().max(1_000_000),
    revenueGoal: z.number().finite().positive().max(100_000_000),
    emailListSize: z.number().int().nonnegative().max(100_000_000),
    socialFollowers: z.number().int().nonnegative().max(100_000_000),
    organicRegistrations: z.number().int().nonnegative().max(100_000_000),
    costPerLead: z.number().finite().nonnegative().max(100_000),
    adBudget: z.number().finite().nonnegative().max(100_000_000),
    launchExperience: z.enum(experienceValues),
    audienceWarmth: z.enum(warmthValues),
    problemAwareness: z.enum(awarenessValues),
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
  emailListSize: 650,
  socialFollowers: 1_200,
  organicRegistrations: 180,
  costPerLead: 2,
  adBudget: 500,
  launchExperience: 'some',
  audienceWarmth: 'mixed',
  problemAwareness: 'aware',
  recentResearch: false,
  surveyResponses: 12,
  facebookGroupFit: true,
  conversionRatePercent: 2,
  showUpRatePercent: 30,
  groupJoinRatePercent: 60,
}

export const blankInputs: LaunchInputs = {
  ...demoInputs,
  offerName: 'My signature offer',
  emailListSize: 0,
  socialFollowers: 0,
  organicRegistrations: 0,
  adBudget: 0,
  launchExperience: 'first',
  audienceWarmth: 'cold',
  problemAwareness: 'curious',
  surveyResponses: 0,
}
