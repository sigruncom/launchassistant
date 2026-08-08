import { describe, expect, it } from 'vitest'
import { calculateLaunch } from '../src/domain/calculator'
import {
  beginnerAnswerSchema,
  beginnerBlank,
  toBeginnerLaunchInputs,
} from '../src/domain/beginner'
import { composeStrategy } from '../src/domain/strategy'
import { resolveAppVariant } from '../src/variants/appVariant'

const answerDraft = (overrides: Record<string, unknown> = {}) => ({
    currency: 'EUR',
    price: '997',
    revenueGoal: '12000',
    organicRegistrations: '180',
    readiness: 'building',
    recentResearch: 'not-yet',
    ...overrides,
  })

const parsedAnswers = (overrides: Record<string, unknown> = {}) =>
  beginnerAnswerSchema.parse(answerDraft(overrides))

describe('beginner variant', () => {
  it('defaults every missing or invalid variant name to the complete app', () => {
    expect(resolveAppVariant(undefined)).toBe('complete')
    expect(resolveAppVariant('unexpected')).toBe('complete')
    expect(resolveAppVariant('beginner')).toBe('beginner')
  })

  it('does not accept an unanswered beginner form', () => {
    expect(beginnerAnswerSchema.safeParse(beginnerBlank).success).toBe(false)
  })

  it('rejects values outside the safe bounds of the shared calculator', () => {
    expect(beginnerAnswerSchema.safeParse(answerDraft({ price: '1000001' })).success).toBe(false)
    expect(
      beginnerAnswerSchema.safeParse(answerDraft({ revenueGoal: '100000001' })).success,
    ).toBe(false)
    expect(
      beginnerAnswerSchema.safeParse(answerDraft({ organicRegistrations: '100000001' })).success,
    ).toBe(false)
  })

  it('maps beginner answers to disclosed organic-only planning defaults', () => {
    const inputs = toBeginnerLaunchInputs(parsedAnswers())

    expect(inputs.offerType).toBe('undecided')
    expect(inputs.conversionRatePercent).toBe(2)
    expect(inputs.showUpRatePercent).toBe(30)
    expect(inputs.groupJoinRatePercent).toBe(60)
    expect(inputs.adBudget).toBe(0)
    expect(inputs.costPerLead).toBe(0)
    expect(inputs.recentResearch).toBe(false)
  })

  it('produces the expected beginner starting plan', () => {
    const inputs = toBeginnerLaunchInputs(parsedAnswers())
    const calculation = calculateLaunch(inputs)

    expect(calculation.selected.buyersRequired).toBe(13)
    expect(calculation.selected.registrationsRequired).toBe(650)
    expect(calculation.selected.attendeesExpected).toBe(195)
    expect(calculation.selected.paidRegistrationGap).toBe(470)
  })

  it('uses a one-day workshop only for the explicitly ready situation', () => {
    const readyInputs = toBeginnerLaunchInputs(parsedAnswers({ readiness: 'ready' }))
    const buildingInputs = toBeginnerLaunchInputs(parsedAnswers())

    expect(composeStrategy(readyInputs, calculateLaunch(readyInputs)).workshopFormat).toBe(
      'One-day workshop',
    )
    expect(composeStrategy(buildingInputs, calculateLaunch(buildingInputs)).workshopFormat).toBe(
      'Three-day workshop',
    )
  })
})
