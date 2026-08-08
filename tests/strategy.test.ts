import { describe, expect, it } from 'vitest'
import { calculateLaunch } from '../src/domain/calculator'
import { demoInputs, type LaunchInputs } from '../src/domain/schema'
import { composeStrategy } from '../src/domain/strategy'

const strategyFor = (overrides: Partial<LaunchInputs> = {}) => {
  const inputs = { ...demoInputs, ...overrides }
  return composeStrategy(inputs, calculateLaunch(inputs))
}

describe('document-only strategy composer', () => {
  it('defaults a mixed audience to a three-day workshop', () => {
    const strategy = strategyFor()

    expect(strategy.workshopFormat).toBe('Three-day workshop')
    expect(strategy.recommendedOffer).toBe('Group coaching')
  })

  it('uses a one-day workshop only when all narrow readiness conditions are met', () => {
    const strategy = strategyFor({
      launchExperience: 'experienced',
      audienceWarmth: 'warm',
      problemAwareness: 'ready',
    })

    expect(strategy.workshopFormat).toBe('One-day workshop')
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

  it('uses a discovery-call CTA for high-priced euro offers', () => {
    const strategy = strategyFor({ currency: 'EUR', price: 1_500 })

    expect(strategy.recommendations.some((item) => item.id === 'REC-CTA')).toBe(true)
  })

  it('sends non-euro price thresholds to coach review instead of converting silently', () => {
    const strategy = strategyFor({ currency: 'USD', price: 1_500, offerType: 'group' })

    expect(strategy.recommendations.some((item) => item.id === 'REC-CTA')).toBe(false)
    expect(strategy.coachDecisions).toContain(
      'The source defines the discovery-call price threshold only in euros; no conversion rule is defined for this currency.',
    )
  })

  it('keeps inferred formulas visible as a coach decision', () => {
    const strategy = strategyFor()

    expect(strategy.coachDecisions[0]).toContain('inferred reverse-funnel formulas')
  })
})
