import { describe, expect, it } from 'vitest'
import { createBeginnerPlanCopy } from '../src/components/BeginnerResults'
import { calculateLaunch } from '../src/domain/calculator'
import {
  calculateOfferEconomics,
  type OfferEconomicsField,
} from '../src/domain/offerEconomics'
import {
  beginnerAnswerSchema,
  beginnerBlank,
  beginnerGoalFallbackErrors,
  BEGINNER_SHOW_UP_RATE_DEFAULT,
  createEmailReachTrace,
  estimateOrganicRegistrationsFromEmailList,
  ORGANIC_SIGNUP_RATE_DEFAULT,
  toBeginnerLaunchInputs,
} from '../src/domain/beginner'
import { MORE_CURRENCIES_VALUE } from '../src/domain/currency'
import { composeStrategy } from '../src/domain/strategy'
import { appVariantHref, resolveAppVariant } from '../src/variants/appVariant'

const answerDraft = (overrides: Record<string, unknown> = {}) => ({
  currency: 'EUR',
  price: '997',
  revenueGoal: '12000',
  emailListSize: '1800',
  organicSignupRatePercent: '10',
  audienceContext: 'other',
  workshopDurationDays: 3,
  showUpRatePercent: '20',
  replayOffered: 'yes',
  showUpBonusPlanned: 'no',
  conversionRatePercent: 2,
  recentResearch: 'not-yet',
  surveyResponses: '12',
  ...overrides,
})

const parsedAnswers = (overrides: Record<string, unknown> = {}) =>
  beginnerAnswerSchema.parse(answerDraft(overrides))

describe('beginner variant', () => {
  it('explains that More currencies still needs a specific selection', () => {
    expect(beginnerGoalFallbackErrors(MORE_CURRENCIES_VALUE, null)).toEqual([
      'Choose a currency from the international list.',
      'Enter values in any two fields so the third can be calculated.',
    ])
  })

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

  it('starts with only the approved EUR, email signup and show-up defaults', () => {
    expect(beginnerBlank.currency).toBe('EUR')
    expect(beginnerBlank.organicSignupRatePercent).toBe(String(ORGANIC_SIGNUP_RATE_DEFAULT))
    expect(beginnerBlank.showUpRatePercent).toBe(String(BEGINNER_SHOW_UP_RATE_DEFAULT))
    expect(
      Object.entries(beginnerBlank)
        .filter(
          ([key]) =>
            !['currency', 'organicSignupRatePercent', 'showUpRatePercent'].includes(key),
        )
        .every(([, value]) => value === ''),
    ).toBe(true)
    expect(beginnerAnswerSchema.safeParse(beginnerBlank).success).toBe(false)
  })

  it('rejects values outside the safe bounds of the shared calculator', () => {
    expect(
      beginnerAnswerSchema.safeParse(answerDraft({ price: '1000000000001' })).success,
    ).toBe(false)
    expect(
      beginnerAnswerSchema.safeParse(answerDraft({ revenueGoal: '1000000000001' })).success,
    ).toBe(false)
    expect(
      beginnerAnswerSchema.safeParse(answerDraft({ emailListSize: '100000001' })).success,
    ).toBe(false)
    expect(beginnerAnswerSchema.safeParse(answerDraft({ emailListSize: '1.5' })).success).toBe(false)
    expect(beginnerAnswerSchema.safeParse(answerDraft({ emailListSize: '-1' })).success).toBe(false)
    expect(
      beginnerAnswerSchema.safeParse(answerDraft({ organicSignupRatePercent: '51' })).success,
    ).toBe(false)
    expect(
      beginnerAnswerSchema.safeParse(answerDraft({ organicSignupRatePercent: '-0.1' })).success,
    ).toBe(false)
    expect(
      beginnerAnswerSchema.safeParse(answerDraft({ price: '9'.repeat(400) })).success,
    ).toBe(false)
  })

  it.each(['CAD', 'AUD', 'CHF', 'INR', 'JPY', 'KWD', 'BRL', 'ZAR', 'AED', 'SGD', 'VND'])(
    'maps the international currency %s into the final plan',
    (currency) => {
      const inputs = toBeginnerLaunchInputs(parsedAnswers({ currency }))
      expect(inputs.currency).toBe(currency)
    },
  )

  it('keeps non-EUR methodology abstentions in the copied beginner plan', () => {
    const answers = parsedAnswers({ currency: 'CAD' })
    const inputs = toBeginnerLaunchInputs(answers)
    const calculation = calculateLaunch(inputs)
    const strategy = composeStrategy(inputs, calculation)
    const trace = createEmailReachTrace(
      answers.emailListSize,
      answers.organicSignupRatePercent,
    )
    const copy = createBeginnerPlanCopy(inputs, calculation, strategy, trace)

    expect(copy).toContain('Needs coach review:')
    for (const decision of strategy.coachDecisions) {
      expect(copy).toContain(`- ${decision}`)
    }
  })

  it.each([
    ['EUR', '997.01', '12000.01', true],
    ['EUR', '997.001', '12000', false],
    ['JPY', '997', '12000', true],
    ['JPY', '997.1', '12000', false],
    ['KWD', '997.001', '12000.001', true],
    ['KWD', '997.0001', '12000', false],
  ] as const)(
    'validates %s amounts at the currency smallest-unit precision',
    (currency, price, revenueGoal, expected) => {
      expect(
        beginnerAnswerSchema.safeParse(answerDraft({ currency, price, revenueGoal })).success,
      ).toBe(expected)
    },
  )

  it('accepts safe high-denomination VND amounts at the widened nominal limit', () => {
    expect(
      beginnerAnswerSchema.safeParse(
        answerDraft({
          currency: 'VND',
          price: '1000000000000',
          revenueGoal: '1000000000000',
        }),
      ).success,
    ).toBe(true)
  })

  it('derives the supplied 50,000-list example without changing the funnel engine', () => {
    const inputs = toBeginnerLaunchInputs(
      parsedAnswers({ emailListSize: '50000', organicSignupRatePercent: '4' }),
    )

    expect(inputs.organicRegistrations).toBe(2_000)
  })

  it('accepts email signup rates from zero through the 50% ceiling', () => {
    expect(
      beginnerAnswerSchema.safeParse(answerDraft({ organicSignupRatePercent: '0' })).success,
    ).toBe(true)
    expect(
      beginnerAnswerSchema.safeParse(answerDraft({ organicSignupRatePercent: '4.5' })).success,
    ).toBe(true)
    expect(
      beginnerAnswerSchema.safeParse(answerDraft({ organicSignupRatePercent: '50' })).success,
    ).toBe(true)
  })

  it('rounds the email reach estimate to the nearest whole registration', () => {
    expect(estimateOrganicRegistrationsFromEmailList(3, 50)).toBe(2)
    expect(createEmailReachTrace(50_000, 4)).toEqual({
      id: 'EMAIL-REACH-ESTIMATE',
      label: 'Estimated registrations from your email list',
      expression: 'round(50000 × 4%)',
      result: 2_000,
      source: 'derived',
      emailListSize: 50_000,
      signupRatePercent: 4,
      rounding: 'nearest whole registration',
      sourceId: 'SIGRUN-REACH-2026-08-11',
    })
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

  it('maps every displayed planning input and the explicit email reach estimate', () => {
    const inputs = toBeginnerLaunchInputs(
      parsedAnswers({
        conversionRatePercent: 1,
        showUpRatePercent: '30',
        workshopDurationDays: 1,
        audienceContext: 'b2b',
        replayOffered: 'no',
        showUpBonusPlanned: 'yes',
      }),
    )

    expect(inputs.conversionRatePercent).toBe(1)
    expect(inputs.showUpRatePercent).toBe(30)
    expect(inputs.groupJoinRatePercent).toBeNull()
    expect(inputs.workshopGroup).toBe('none')
    expect(inputs.workshopDurationDays).toBe(1)
    expect(inputs.audienceContext).toBe('b2b')
    expect(inputs.replayOffered).toBe(false)
    expect(inputs.showUpBonusPlanned).toBe(true)
    expect(inputs.organicRegistrations).toBe(180)
  })

  it('omits community planning from Beginner without inventing a zero-percent rate', () => {
    const answers = parsedAnswers()
    const inputs = toBeginnerLaunchInputs(answers)
    const calculation = calculateLaunch(inputs)
    const strategy = composeStrategy(inputs, calculation)
    const trace = createEmailReachTrace(
      answers.emailListSize,
      answers.organicSignupRatePercent,
    )
    const copy = createBeginnerPlanCopy(inputs, calculation, strategy, trace)

    expect(inputs.workshopGroup).toBe('none')
    expect(inputs.groupJoinRatePercent).toBeNull()
    expect(calculation.selected.groupJoinsExpected).toBeNull()
    expect(copy).not.toContain('launch community')
    expect(copy).not.toContain('launch-community')
    expect(copy).not.toContain('0% group')
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
