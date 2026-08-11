import { describe, expect, it } from 'vitest'
import {
  completeBlank,
  completeStepErrors,
  parseCompleteDraft,
  type CompleteDraft,
} from '../src/domain/complete'
import { calculateOfferEconomics } from '../src/domain/offerEconomics'

const completeDraft = (overrides: Partial<CompleteDraft> = {}): CompleteDraft => ({
  offerName: 'Signature group program',
  offerType: 'group',
  currency: 'EUR',
  organicRegistrations: '180',
  audienceContext: 'other',
  workshopDurationDays: 3,
  showUpRatePercent: '20',
  replayOffered: 'yes',
  showUpBonusPlanned: 'no',
  conversionRatePercent: 2,
  groupJoinRatePercent: '60',
  paidPromotionPlanned: 'no',
  costPerLead: '',
  adBudget: '',
  recentResearch: 'not-yet',
  surveyResponses: '12',
  facebookGroupFit: 'yes',
  ...overrides,
})

const economics = calculateOfferEconomics(
  { price: '997', spotsToSell: '', revenueGoal: '12000' },
  'spotsToSell',
)

describe('complete planner draft', () => {
  it('starts with every participant answer blank', () => {
    expect(Object.values(completeBlank).every((value) => value === '')).toBe(true)
    expect(parseCompleteDraft(completeBlank, null)).toBeNull()
  })

  it('validates only the current step', () => {
    expect(completeStepErrors(0, completeBlank, null)).toEqual([
      'Enter a working offer name.',
      'Choose an offer format.',
    ])
    expect(completeStepErrors(2, completeDraft({ organicRegistrations: '' }), economics)).toEqual([
      'Enter your expected registrations without ads.',
    ])
  })

  it('maps explicit answers into final launch inputs', () => {
    const parsed = parseCompleteDraft(
      completeDraft({
        workshopDurationDays: 1,
        audienceContext: 'b2b',
        showUpRatePercent: '30',
        conversionRatePercent: 1,
        groupJoinRatePercent: '70',
      }),
      economics,
    )

    expect(parsed?.success).toBe(true)
    if (!parsed?.success) throw new Error('Expected a complete draft.')
    expect(parsed.data.workshopDurationDays).toBe(1)
    expect(parsed.data.audienceContext).toBe('b2b')
    expect(parsed.data.showUpRatePercent).toBe(30)
    expect(parsed.data.conversionRatePercent).toBe(1)
    expect(parsed.data.groupJoinRatePercent).toBe(70)
  })

  it('treats an explicit no to paid promotion as zero spend', () => {
    const parsed = parseCompleteDraft(completeDraft(), economics)

    expect(parsed?.success).toBe(true)
    if (!parsed?.success) throw new Error('Expected a complete draft.')
    expect(parsed.data.costPerLead).toBe(0)
    expect(parsed.data.adBudget).toBe(0)
  })

  it('requires paid inputs only when paid promotion is selected', () => {
    const draft = completeDraft({ paidPromotionPlanned: 'yes' })

    expect(completeStepErrors(6, draft, economics)).toEqual([
      'Enter cost per paid registration.',
      'Enter available ad budget.',
    ])
  })

  it('catches a paid budget without a positive cost on the promotion step', () => {
    const draft = completeDraft({
      paidPromotionPlanned: 'yes',
      costPerLead: '0',
      adBudget: '500',
    })

    expect(completeStepErrors(6, draft, economics)).toContain(
      'Add a cost per paid registration when an ad budget is planned.',
    )
  })
})
