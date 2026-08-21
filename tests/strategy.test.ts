import { describe, expect, it } from 'vitest'
import { calculateLaunch } from '../src/domain/calculator'
import { demoInputs, type LaunchInputs } from '../src/domain/schema'
import { composeStrategy } from '../src/domain/strategy'

const strategyFor = (overrides: Partial<LaunchInputs> = {}) => {
  const inputs = { ...demoInputs, ...overrides }
  return composeStrategy(inputs, calculateLaunch(inputs))
}

describe('document-only strategy composer', () => {
  it('uses the participant-selected three-day workshop', () => {
    const strategy = strategyFor()

    expect(strategy.workshopFormat).toBe('Three-day workshop')
    expect(strategy.recommendedOffer).toBe('Group coaching')
  })

  it('uses the participant-selected one-day workshop', () => {
    const strategy = strategyFor({
      workshopDurationDays: 1,
    })
    const workshop = strategy.recommendations.find((item) => item.id === 'REC-WORKSHOP')

    expect(strategy.workshopFormat).toBe('One-day workshop')
    expect(workshop?.sourceIds).toContain('SIGRUN-WORKSHOP-2026-08-09')
    expect(workshop?.sourceIds).not.toContain('LS-WORKSHOP-001')
  })

  it('sends a one-day high-ticket euro choice to coach review', () => {
    const strategy = strategyFor({ workshopDurationDays: 1, price: 1_500 })

    expect(strategy.workshopFormat).toBe('One-day workshop')
    expect(strategy.coachDecisions.some((decision) => decision.includes('above €1,000'))).toBe(true)
  })

  it('sends a three-day B2B choice to coach review without overriding it', () => {
    const strategy = strategyFor({ workshopDurationDays: 3, audienceContext: 'b2b' })

    expect(strategy.workshopFormat).toBe('Three-day workshop')
    expect(strategy.coachDecisions.some((decision) => decision.includes('one day can be'))).toBe(true)
  })

  it('does not invent a lower-price cutoff for a three-day hobby offer', () => {
    const strategy = strategyFor({
      workshopDurationDays: 3,
      audienceContext: 'hobby',
      price: 5_000,
    })

    expect(
      strategy.coachDecisions.some((decision) =>
        decision.includes('audience where Sigrun said one day can be a better fit'),
      ),
    ).toBe(false)
  })

  it('uses replay and bonus answers only as attendance context', () => {
    const plan = strategyFor({
      showUpRatePercent: 30,
      replayOffered: false,
      showUpBonusPlanned: true,
    })
    const attendance = plan.recommendations.find((item) => item.id === 'REC-ATTENDANCE')

    expect(attendance?.body).toContain('no replay is planned')
    expect(attendance?.body).toContain('a show-up bonus is planned')
  })

  it('blocks weak audience evidence below ten survey responses', () => {
    const strategy = strategyFor({ recentResearch: false, surveyResponses: 4 })

    expect(strategy.nextMoves.some((move) => move.id === 'MOVE-RESEARCH-BLOCK')).toBe(true)
  })

  it('does not recommend paid ads before organic registrations exist', () => {
    const strategy = strategyFor({ organicRegistrations: 0, adBudget: 500 })

    expect(strategy.nextMoves.some((move) => move.id === 'MOVE-ADS-BLOCK')).toBe(true)
  })

  it('flags a low-priced offer with limited projected reach', () => {
    const strategy = strategyFor({ currency: 'EUR', price: 250, revenueGoal: 3_000 })

    expect(strategy.recommendations.some((item) => item.id === 'REC-ECONOMICS')).toBe(true)
  })

  it('does not silently apply the euro price guideline to another currency', () => {
    const strategy = strategyFor({ currency: 'USD', price: 250, revenueGoal: 3_000 })

    expect(strategy.recommendations.some((item) => item.id === 'REC-ECONOMICS')).toBe(false)
    expect(strategy.coachDecisions).toContain(
      'The source gives the workshop-economics threshold only in euros; no conversion rule is defined for this currency.',
    )
  })

  it('keeps the euro-only price guideline out of a newly supported currency', () => {
    const strategy = strategyFor({ currency: 'JPY', price: 250, revenueGoal: 3_000 })

    expect(strategy.coachDecisions).toContain(
      'The source gives the workshop-economics threshold only in euros; no conversion rule is defined for this currency.',
    )
  })

  it('uses a discovery-call CTA for high-priced euro offers', () => {
    const strategy = strategyFor({ currency: 'EUR', price: 1_500 })

    expect(strategy.recommendations.some((item) => item.id === 'REC-CTA')).toBe(true)
  })

  it.each([250, 1_500])(
    'sends the euro-only discovery-call threshold to coach review for a non-euro price of %s',
    (price) => {
      const strategy = strategyFor({ currency: 'USD', price, offerType: 'group' })

      expect(strategy.recommendations.some((item) => item.id === 'REC-CTA')).toBe(false)
      expect(strategy.coachDecisions).toContain(
        'The source defines the discovery-call price threshold only in euros; no conversion rule is defined for this currency.',
      )
    },
  )

  it('keeps the direct discovery-call CTA for a non-euro one-to-one offer', () => {
    const strategy = strategyFor({ currency: 'JPY', price: 250, offerType: 'one-to-one' })

    expect(strategy.recommendations.some((item) => item.id === 'REC-CTA')).toBe(true)
    expect(strategy.coachDecisions).not.toContain(
      'The source defines the discovery-call price threshold only in euros; no conversion rule is defined for this currency.',
    )
  })

  it('does not ask a coach to resolve the confirmed sales-conversion base', () => {
    const strategy = strategyFor()

    expect(
      strategy.coachDecisions.some((decision) => decision.includes('live attendees')),
    ).toBe(false)
    expect(strategy.summary).toContain('workshop-signup-to-sale conversion')
  })

  it('does not undermine a three-day workshop when no workshop group is planned', () => {
    const strategy = strategyFor({
      workshopDurationDays: 3,
      workshopGroup: 'none',
      groupJoinRatePercent: null,
    })

    expect(strategy.workshopFormat).toBe('Three-day workshop')
    expect(
      strategy.coachDecisions.some((decision) => decision.includes('Facebook group')),
    ).toBe(false)
  })
})
