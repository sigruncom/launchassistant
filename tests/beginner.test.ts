import { describe, expect, it } from 'vitest'
import { calculateLaunch } from '../src/domain/calculator'
import {
  calculateOfferEconomics,
  type OfferEconomicsField,
} from '../src/domain/offerEconomics'
import {
  beginnerAnswerSchema,
  beginnerBlank,
  toBeginnerLaunchInputs,
} from '../src/domain/beginner'
import { composeStrategy } from '../src/domain/strategy'
import {
  appVariantHref,
  resolveAppVariant,
} from '../src/variants/appVariant'

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
  it('uses the URL choice before the configured default', () => {
    expect(resolveAppVariant('beginner', 'complete')).toBe('beginner')
    expect(resolveAppVariant('complete', 'beginner')).toBe('complete')
  })

  it('falls back safely when the URL choice is missing or invalid', () => {
    expect(resolveAppVariant(undefined, 'beginner')).toBe('beginner')
    expect(resolveAppVariant(undefined)).toBe('complete')
    expect(resolveAppVariant('unexpected')).toBe('complete')
  })

  it('creates shareable links containing only the selected planner version', () => {
    expect(appVariantHref('beginner')).toBe('?planner=beginner')
    expect(appVariantHref('complete')).toBe('?planner=complete')
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
    expect(
      beginnerAnswerSchema.safeParse(answerDraft({ price: '9'.repeat(400) })).success,
    ).toBe(false)
  })

  it.each(['spotsToSell', 'revenueGoal', 'price'] as OfferEconomicsField[])(
    'maps a %s cross-calculation into a consistent beginner plan',
    (calculatedField) => {
      const economics = calculateOfferEconomics(
        { price: '997', spotsToSell: '13', revenueGoal: '12000' },
        calculatedField,
      )
      expect(economics.success).toBe(true)
      if (!economics.success) throw new Error('Expected valid beginner economics.')

      const answers = beginnerAnswerSchema.parse(
        answerDraft({
          price: economics.values.price,
          revenueGoal: economics.values.revenueGoal,
        }),
      )
      const inputs = toBeginnerLaunchInputs(answers)

      expect(calculateLaunch(inputs).selected.buyersRequired).toBe(
        economics.numbers.spotsToSell,
      )
    },
  )

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
