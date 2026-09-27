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
  workshopGroup: 'facebook',
  ...overrides,
})

const economics = calculateOfferEconomics(
  { price: '997', spotsToSell: '', revenueGoal: '12000' },
  'spotsToSell',
)

describe('complete planner draft', () => {
  it('starts with EUR as the only participant-answer default', () => {
    expect(completeBlank.currency).toBe('EUR')
    expect(
      Object.entries(completeBlank)
        .filter(([key]) => key !== 'currency')
        .every(([, value]) => value === ''),
    ).toBe(true)
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

  it('supports no workshop group without treating not-applicable as zero percent', () => {
    const draft = completeDraft({ workshopGroup: 'none', groupJoinRatePercent: '' })
    const parsed = parseCompleteDraft(draft, economics)

    expect(completeStepErrors(5, draft, economics)).toEqual([])
    expect(parsed?.success).toBe(true)
    if (!parsed?.success) throw new Error('Expected a no-group complete draft.')
    expect(parsed.data.workshopGroup).toBe('none')
    expect(parsed.data.groupJoinRatePercent).toBeNull()
  })

  it('accepts a planned group with an unknown rate or a supplied 30% reference', () => {
    const unknown = completeDraft({ workshopGroup: 'other', groupJoinRatePercent: '' })
    const supplied = completeDraft({ workshopGroup: 'facebook', groupJoinRatePercent: '30' })
    const parsedUnknown = parseCompleteDraft(unknown, economics)
    const parsedSupplied = parseCompleteDraft(supplied, economics)

    expect(completeStepErrors(5, unknown, economics)).toEqual([])
    expect(parsedUnknown?.success).toBe(true)
    expect(parsedSupplied?.success).toBe(true)
    if (!parsedUnknown?.success || !parsedSupplied?.success) {
      throw new Error('Expected planned-group drafts to parse.')
    }
    expect(parsedUnknown.data.groupJoinRatePercent).toBeNull()
    expect(parsedSupplied.data.groupJoinRatePercent).toBe(30)
  })

  it('accepts an international currency and rejects an unsupported code on its own step', () => {
    const parsed = parseCompleteDraft(completeDraft({ currency: 'CAD' }), economics)

    expect(parsed?.success).toBe(true)
    if (!parsed?.success) throw new Error('Expected an international complete draft.')
    expect(parsed.data.currency).toBe('CAD')
    expect(
      completeStepErrors(
        1,
        completeDraft({ currency: 'BTC' as CompleteDraft['currency'] }),
        economics,
      ),
    ).toContain(
      'Choose a currency from the international list.',
    )
  })

  it('validates paid-promotion amounts at the selected currency precision', () => {
    const yenDraft = completeDraft({
      currency: 'JPY',
      paidPromotionPlanned: 'yes',
      costPerLead: '10.5',
      adBudget: '500',
    })
    const dinarDraft = completeDraft({
      currency: 'KWD',
      paidPromotionPlanned: 'yes',
      costPerLead: '0.001',
      adBudget: '500.001',
    })

    expect(completeStepErrors(6, yenDraft, economics)).toContain(
      'Enter a valid cost per paid registration as a whole amount with no decimals.',
    )
    expect(completeStepErrors(6, dinarDraft, economics)).toEqual([])
  })

  it('parses three-decimal paid amounts without losing the currency contract', () => {
    const dinarEconomics = calculateOfferEconomics(
      { price: '997.001', spotsToSell: '', revenueGoal: '12000.001' },
      'spotsToSell',
      'KWD',
    )
    const parsed = parseCompleteDraft(
      completeDraft({
        currency: 'KWD',
        paidPromotionPlanned: 'yes',
        costPerLead: '0.001',
        adBudget: '500.001',
      }),
      dinarEconomics,
    )

    expect(parsed?.success).toBe(true)
    if (!parsed?.success) throw new Error('Expected a three-decimal complete draft.')
    expect(parsed.data.currency).toBe('KWD')
    expect(parsed.data.costPerLead).toBe(0.001)
    expect(parsed.data.adBudget).toBe(500.001)
  })

  it('accepts safe high-denomination paid inputs at the widened nominal limit', () => {
    const draft = completeDraft({
      currency: 'VND',
      paidPromotionPlanned: 'yes',
      costPerLead: '1000000000000',
      adBudget: '1000000000000',
    })

    expect(completeStepErrors(6, draft, economics)).toEqual([])
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
