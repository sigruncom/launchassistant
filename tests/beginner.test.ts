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
import { appVariantHref, resolveAppVariant } from '../src/variants/appVariant'

const answerDraft = (overrides: Record<string, unknown> = {}) => ({
  currency: 'EUR',
  price: '997',
  revenueGoal: '12000',
  organicRegistrations: '180',
  audienceContext: 'other',
  workshopDurationDays: 3,
  showUpRatePercent: '20',
  replayOffered: 'yes',
  showUpBonusPlanned: 'no',
  conversionRatePercent: 2,
  groupJoinRatePercent: '60',
  recentResearch: 'not-yet',
  surveyResponses: '12',
  facebookGroupFit: 'yes',
  ...overrides,
})

const parsedAnswers = (overrides: Record<string, unknown> = {}) =>
  beginnerAnswerSchema.parse(answerDraft(overrides))

describe('beginner variant', () => {
  it('uses the URL choice before the configured default', () => {
    expect(resolveAppVariant('beginner', 'complete')).toBe('beginner')
    expect(resolveAppVariant('complete', 'beginner')).toBe('complete')
  })

  it('opens the guided beginner path when no valid variant is configured', () => {
    expect(resolveAppVariant(undefined, 'beginner')).toBe('beginner')
    expect(resolveAppVariant(undefined)).toBe('beginner')
    expect(resolveAppVariant('unexpected')).toBe('beginner')
  })

  it('creates shareable links containing only the selected planner version', () => {
    expect(appVariantHref('beginner')).toBe('?planner=beginner')
    expect(appVariantHref('complete')).toBe('?planner=complete')
  })

  it('starts with every participant answer blank', () => {
    expect(Object.values(beginnerBlank).every((value) => value === '')).toBe(true)
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

  it.each([10, 20, 30, 70])('accepts an explicitly selected %s%% show-up rate', (rate) => {
    const inputs = toBeginnerLaunchInputs(
      parsedAnswers({ showUpRatePercent: String(rate) }),
    )
    expect(inputs.showUpRatePercent).toBe(rate)
  })

  it('does not turn the recorded 70% high into an invented maximum', () => {
    expect(
      beginnerAnswerSchema.safeParse(answerDraft({ showUpRatePercent: '100' })).success,
    ).toBe(true)
    expect(
      beginnerAnswerSchema.safeParse(answerDraft({ showUpRatePercent: '101' })).success,
    ).toBe(false)
  })

  it('maps every displayed planning input instead of inserting rate defaults', () => {
    const inputs = toBeginnerLaunchInputs(
      parsedAnswers({
        conversionRatePercent: 1,
        showUpRatePercent: '30',
        groupJoinRatePercent: '70',
        workshopDurationDays: 1,
        audienceContext: 'b2b',
        replayOffered: 'no',
        showUpBonusPlanned: 'yes',
      }),
    )

    expect(inputs.conversionRatePercent).toBe(1)
    expect(inputs.showUpRatePercent).toBe(30)
    expect(inputs.groupJoinRatePercent).toBe(70)
    expect(inputs.workshopDurationDays).toBe(1)
    expect(inputs.audienceContext).toBe('b2b')
    expect(inputs.replayOffered).toBe(false)
    expect(inputs.showUpBonusPlanned).toBe(true)
  })

  it('produces the expected starting plan at the selected 20% show-up rate', () => {
    const inputs = toBeginnerLaunchInputs(parsedAnswers())
    const calculation = calculateLaunch(inputs)

    expect(calculation.selected.buyersRequired).toBe(13)
    expect(calculation.selected.registrationsRequired).toBe(650)
    expect(calculation.selected.attendeesExpected).toBe(130)
    expect(calculation.selected.projectedAttendeesExpected).toBe(36)
    expect(calculation.selected.paidRegistrationGap).toBe(470)
  })

  it('always respects the participant workshop choice', () => {
    const oneDayInputs = toBeginnerLaunchInputs(
      parsedAnswers({ workshopDurationDays: 1, audienceContext: 'other' }),
    )
    const threeDayInputs = toBeginnerLaunchInputs(
      parsedAnswers({ workshopDurationDays: 3, audienceContext: 'b2b' }),
    )

    expect(composeStrategy(oneDayInputs, calculateLaunch(oneDayInputs)).workshopFormat).toBe(
      'One-day workshop',
    )
    expect(composeStrategy(threeDayInputs, calculateLaunch(threeDayInputs)).workshopFormat).toBe(
      'Three-day workshop',
    )
  })
})
