import type { OfferEconomicsResult } from './offerEconomics'
import { offerEconomicsErrors } from './offerEconomics'
import { launchInputSchema, type LaunchInputs } from './schema'

export type YesNoAnswer = 'yes' | 'no'
export type ResearchAnswer = 'yes' | 'not-yet'

export type CompleteDraft = {
  offerName: string
  offerType: LaunchInputs['offerType'] | ''
  currency: LaunchInputs['currency'] | ''
  organicRegistrations: string
  audienceContext: LaunchInputs['audienceContext'] | ''
  workshopDurationDays: LaunchInputs['workshopDurationDays'] | ''
  showUpRatePercent: string
  replayOffered: YesNoAnswer | ''
  showUpBonusPlanned: YesNoAnswer | ''
  conversionRatePercent: LaunchInputs['conversionRatePercent'] | ''
  groupJoinRatePercent: string
  paidPromotionPlanned: YesNoAnswer | ''
  costPerLead: string
  adBudget: string
  recentResearch: ResearchAnswer | ''
  surveyResponses: string
  facebookGroupFit: YesNoAnswer | ''
}

export const completeBlank: CompleteDraft = {
  offerName: '',
  offerType: '',
  currency: '',
  organicRegistrations: '',
  audienceContext: '',
  workshopDurationDays: '',
  showUpRatePercent: '',
  replayOffered: '',
  showUpBonusPlanned: '',
  conversionRatePercent: '',
  groupJoinRatePercent: '',
  paidPromotionPlanned: '',
  costPerLead: '',
  adBudget: '',
  recentResearch: '',
  surveyResponses: '',
  facebookGroupFit: '',
}

const wholeNumberError = (
  value: string,
  label: string,
  maximum: number,
  required = true,
) => {
  const trimmed = value.trim()
  if (!trimmed) return required ? `Enter ${label}.` : null
  const parsed = Number(trimmed)
  if (!Number.isFinite(parsed) || !Number.isInteger(parsed) || parsed < 0) {
    return `Enter a whole number for ${label}.`
  }
  if (parsed > maximum) return `${label[0].toUpperCase()}${label.slice(1)} is too large.`
  return null
}

const decimalError = (
  value: string,
  label: string,
  maximum: number,
  required = true,
) => {
  const trimmed = value.trim()
  if (!trimmed) return required ? `Enter ${label}.` : null
  if (!/^\d+(?:\.\d{1,2})?$/.test(trimmed)) {
    return `Enter a valid ${label} with no more than two decimals.`
  }
  const parsed = Number(trimmed)
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > maximum) {
    return `Enter ${label} between 0 and ${maximum.toLocaleString()}.`
  }
  return null
}

const percentError = (value: string, label: string, maximum: number) => {
  const trimmed = value.trim()
  if (!trimmed) return `Enter ${label}.`
  const parsed = Number(trimmed)
  if (!Number.isFinite(parsed) || parsed < 1 || parsed > maximum) {
    return `Enter ${label} between 1% and ${maximum}%.`
  }
  return null
}

const compact = (errors: Array<string | null>) => errors.filter((error): error is string => Boolean(error))

export const completeStepErrors = (
  step: number,
  draft: CompleteDraft,
  economics: OfferEconomicsResult | null,
): string[] => {
  switch (step) {
    case 0:
      return compact([
        draft.offerName.trim() ? null : 'Enter a working offer name.',
        draft.offerType ? null : 'Choose an offer format.',
      ])
    case 1:
      return compact([
        draft.currency ? null : 'Choose a currency.',
        ...offerEconomicsErrors(economics),
      ])
    case 2:
      return compact([
        wholeNumberError(
          draft.organicRegistrations,
          'your expected registrations without ads',
          100_000_000,
        ),
      ])
    case 3:
      return compact([
        draft.audienceContext ? null : 'Choose the audience type that fits best.',
        draft.workshopDurationDays ? null : 'Choose a one-day or three-day workshop.',
      ])
    case 4:
      return compact([
        percentError(draft.showUpRatePercent, 'an expected live show-up rate', 100),
        draft.replayOffered ? null : 'Choose whether a replay will be offered.',
        draft.showUpBonusPlanned ? null : 'Choose whether a show-up bonus is planned.',
      ])
    case 5:
      return compact([
        draft.conversionRatePercent ? null : 'Choose a 1%, 2% or 3% sales case.',
        percentError(draft.groupJoinRatePercent, 'a workshop-group join rate', 100),
      ])
    case 6:
      return compact([
        draft.paidPromotionPlanned ? null : 'Choose whether paid promotion is planned.',
        draft.paidPromotionPlanned === 'yes'
          ? decimalError(draft.costPerLead, 'cost per paid registration', 100_000)
          : null,
        draft.paidPromotionPlanned === 'yes'
          ? decimalError(draft.adBudget, 'available ad budget', 100_000_000)
          : null,
        draft.paidPromotionPlanned === 'yes' &&
        Number(draft.adBudget) > 0 &&
        Number(draft.costPerLead) <= 0
          ? 'Add a cost per paid registration when an ad budget is planned.'
          : null,
      ])
    case 7:
      return compact([
        draft.recentResearch ? null : 'Choose Yes or Not yet for recent client research.',
        draft.recentResearch === 'not-yet'
          ? wholeNumberError(draft.surveyResponses, 'survey responses collected', 100_000)
          : null,
        draft.facebookGroupFit
          ? null
          : 'Choose whether an online workshop group fits this audience.',
      ])
    default:
      return []
  }
}

export const parseCompleteDraft = (
  draft: CompleteDraft,
  economics: OfferEconomicsResult | null,
) => {
  if (!economics?.success) return null

  return launchInputSchema.safeParse({
    offerName: draft.offerName,
    offerType: draft.offerType,
    currency: draft.currency,
    price: economics.numbers.price,
    revenueGoal: economics.numbers.revenueGoal,
    organicRegistrations: Number(draft.organicRegistrations),
    costPerLead: draft.paidPromotionPlanned === 'yes' ? Number(draft.costPerLead) : 0,
    adBudget: draft.paidPromotionPlanned === 'yes' ? Number(draft.adBudget) : 0,
    audienceContext: draft.audienceContext,
    workshopDurationDays: draft.workshopDurationDays,
    replayOffered: draft.replayOffered === 'yes',
    showUpBonusPlanned: draft.showUpBonusPlanned === 'yes',
    recentResearch: draft.recentResearch === 'yes',
    surveyResponses: draft.recentResearch === 'not-yet' ? Number(draft.surveyResponses) : 0,
    facebookGroupFit: draft.facebookGroupFit === 'yes',
    conversionRatePercent: draft.conversionRatePercent,
    showUpRatePercent: Number(draft.showUpRatePercent),
    groupJoinRatePercent: Number(draft.groupJoinRatePercent),
  })
}
