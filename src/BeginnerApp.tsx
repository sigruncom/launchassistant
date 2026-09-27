import { useMemo, useRef, useState } from 'react'
import { BeginnerResults } from './components/BeginnerResults'
import { EmailReachFields } from './components/EmailReachFields'
import { CurrencySelect } from './components/CurrencySelect'
import {
  ChoiceGroup,
  ShowUpRateField,
} from './components/Fields'
import { OfferEconomicsFields } from './components/OfferEconomicsFields'
import { StepProgress } from './components/StepProgress'
import { calculateLaunch } from './domain/calculator'
import {
  beginnerAttendanceSchema,
  beginnerBlank,
  beginnerGoalFallbackErrors,
  beginnerGoalSchema,
  beginnerReachSchema,
  beginnerSalesSchema,
  beginnerWorkshopSchema,
  createEmailReachTrace,
  toBeginnerLaunchInputs,
  type BeginnerDraft,
  type BeginnerYesNo,
} from './domain/beginner'
import { composeStrategy } from './domain/strategy'
import { useOfferEconomics } from './hooks/useOfferEconomics'

const steps = [
  { short: 'Revenue target', kicker: 'Your goal', title: 'What should this launch achieve?' },
  {
    short: 'Reach',
    kicker: 'Your starting point',
    title: 'How many registrations could your email list generate?',
  },
  { short: 'Workshop', kicker: 'Your format', title: 'Which workshop fits this audience?' },
  { short: 'Attendance', kicker: 'Live attendance', title: 'What show-up rate will you plan for?' },
  { short: 'Sales rate', kicker: 'Who buys', title: 'What share of signups do you expect to buy?' },
] as const

type StepIndex = 0 | 1 | 2 | 3 | 4 | 5

function BeginnerApp() {
  const [draft, setDraft] = useState<BeginnerDraft>(beginnerBlank)
  const [activeStep, setActiveStep] = useState<StepIndex>(0)
  const [showErrors, setShowErrors] = useState(false)
  const [announcement, setAnnouncement] = useState('Launch Planner ready. Nothing is saved.')
  const errorSummaryRef = useRef<HTMLDivElement>(null)
  const stepHeadingRef = useRef<HTMLHeadingElement>(null)
  const resultMainRef = useRef<HTMLElement>(null)
  const economics = useOfferEconomics(
    { price: '', spotsToSell: '', revenueGoal: '' },
    draft.currency,
  )

  const resolvedDraft = useMemo(
    () => (economics.result?.success ? { ...draft, ...economics.result.values } : null),
    [draft, economics.result],
  )
  const validations = useMemo(
    () =>
      resolvedDraft
        ? ([
            beginnerGoalSchema.safeParse(resolvedDraft),
            beginnerReachSchema.safeParse(resolvedDraft),
            beginnerWorkshopSchema.safeParse(resolvedDraft),
            beginnerAttendanceSchema.safeParse(resolvedDraft),
            beginnerSalesSchema.safeParse(resolvedDraft),
          ] as const)
        : null,
    [resolvedDraft],
  )
  const finalValidation = validations?.[4]
  const inputs = useMemo(
    () => (finalValidation?.success ? toBeginnerLaunchInputs(finalValidation.data) : null),
    [finalValidation],
  )
  const calculation = useMemo(() => (inputs ? calculateLaunch(inputs) : null), [inputs])
  const emailReachTrace = useMemo(
    () =>
      finalValidation?.success
        ? createEmailReachTrace(
            finalValidation.data.emailListSize,
            finalValidation.data.organicSignupRatePercent,
          )
        : null,
    [finalValidation],
  )
  const strategy = useMemo(
    () => (inputs && calculation ? composeStrategy(inputs, calculation) : null),
    [inputs, calculation],
  )

  const update = <Key extends keyof BeginnerDraft>(key: Key, value: BeginnerDraft[Key]) => {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  const focusStepHeading = (step: StepIndex) => {
    window.requestAnimationFrame(() => {
      if (step === 5) {
        resultMainRef.current?.focus({ preventScroll: true })
        return
      }

      stepHeadingRef.current?.focus({ preventScroll: true })
    })
  }

  const validationForStep = (step: StepIndex) =>
    step === 5 ? null : validations?.[step]

  const moveTo = (step: StepIndex) => {
    if (step > activeStep) {
      const currentValidation = validationForStep(activeStep)
      if (!currentValidation?.success) {
        setShowErrors(true)
        setAnnouncement('Complete the highlighted questions before continuing.')
        window.requestAnimationFrame(() => errorSummaryRef.current?.focus({ preventScroll: true }))
        return
      }
    }

    setShowErrors(false)
    setActiveStep(step)
    setAnnouncement(
      step === 5 ? 'Your launch plan is ready.' : `Step ${step + 1} of 5: ${steps[step].short}`,
    )
    focusStepHeading(step)
  }

  const startOver = () => {
    setDraft(beginnerBlank)
    economics.reset({ price: '', spotsToSell: '', revenueGoal: '' })
    setActiveStep(0)
    setShowErrors(false)
    setAnnouncement('The form was cleared. Nothing was retained.')
    focusStepHeading(0)
  }

  const currentValidation = validationForStep(activeStep)
  const currentInputStep = activeStep === 5 ? null : steps[activeStep]
  const errors = showErrors
    ? [
        ...new Set(
          activeStep === 0 && !currentValidation
            ? beginnerGoalFallbackErrors(draft.currency, economics.result)
            : currentValidation && !currentValidation.success
              ? currentValidation.error.issues.map((issue) => issue.message)
              : [],
        ),
      ]
    : []

  return (
    <div className="app-shell beginner-shell" id="top">
      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="Sigrun Launch Planner home">
          SIGRUN<span>/</span>LAUNCH PLANNER
        </a>
      </header>

      {currentInputStep ? (
        <div className="beginner-planner">
          <aside className="beginner-planner__intro" aria-labelledby="beginner-intro-title">
            <div className="beginner-hero">
              <p className="hero-kicker">Launch & Sell · Guided path</p>
              <h1 id="beginner-intro-title">
                Build your launch plan<span className="red-dot">.</span>
              </h1>
              <p className="hero-copy">
                Five short steps turn what you know into a starting plan. EUR is selected, and
                nothing you enter is saved.
              </p>
              <ul className="beginner-trust" aria-label="What this planner does">
                <li>Five short steps</li>
                <li>You can edit the assumptions</li>
                <li>Nothing is saved</li>
              </ul>
            </div>
            <StepProgress
              activeStep={activeStep}
              labels={steps.map((step) => step.short)}
            />
          </aside>

          <main className="beginner-workspace">
          <section
            className="beginner-input-card"
            data-step={activeStep + 1}
            aria-labelledby="beginner-step-title"
          >
            <div className="step-heading">
              <p className="step-kicker">
                {activeStep + 1} / 5 — {currentInputStep.kicker}
              </p>
              <h2 id="beginner-step-title" tabIndex={-1} ref={stepHeadingRef}>
                {currentInputStep.title}
              </h2>
            </div>

            <div className="beginner-step-body">
            {errors.length > 0 ? (
              <div className="error-summary" role="alert" tabIndex={-1} ref={errorSummaryRef}>
                <strong>A few answers are still needed:</strong>
                <ul>{errors.map((error) => <li key={error}>{error}</li>)}</ul>
              </div>
            ) : null}

            {activeStep === 0 ? (
              <div className="form-stack">
                <OfferEconomicsFields
                  calculatedField={economics.calculatedField}
                  currency={draft.currency || undefined}
                  draft={economics.draft}
                  idPrefix="beginner-economics"
                  result={economics.result}
                  showErrors={showErrors}
                  sourceOrder={economics.sourceOrder}
                  variant="beginner"
                  onChange={economics.update}
                />
                <details className="currency-settings">
                  <summary>
                    Currency: {draft.currency || 'EUR'} <span>Change currency</span>
                  </summary>
                  <CurrencySelect
                    className="beginner-currency-field"
                    id="beginner-currency"
                    value={draft.currency}
                    onChange={(value) => update('currency', value)}
                  />
                </details>
              </div>
            ) : null}

            {activeStep === 1 ? (
              <EmailReachFields
                emailListSize={draft.emailListSize}
                signupRatePercent={draft.organicSignupRatePercent}
                showErrors={showErrors}
                onEmailListSizeChange={(value) => update('emailListSize', value)}
                onSignupRatePercentChange={(value) =>
                  update('organicSignupRatePercent', value)
                }
              />
            ) : null}

            {activeStep === 2 ? (
              <div className="form-stack">
                <ChoiceGroup<BeginnerDraft['audienceContext']>
                  legend="Which audience type fits best?"
                  name="beginner-audience-context"
                  value={draft.audienceContext}
                  onChange={(value) => update('audienceContext', value)}
                  choices={[
                    { value: 'b2b', label: 'B2B', detail: 'Time is often the main constraint' },
                    { value: 'hobby', label: 'Hobby', detail: 'Often a lower-priced offer' },
                    { value: 'other', label: 'Other', detail: 'Consumer or mixed audience' },
                  ]}
                />
                <ChoiceGroup<BeginnerDraft['workshopDurationDays']>
                  legend="Choose the workshop length"
                  name="beginner-workshop-duration"
                  value={draft.workshopDurationDays}
                  onChange={(value) => update('workshopDurationDays', value)}
                  columns={2}
                  choices={[
                    { value: 1, label: 'One day', detail: 'Often suits B2B or lower-priced hobby audiences' },
                    { value: 3, label: 'Three days', detail: 'Often suits offers above €1,000' },
                  ]}
                />
              </div>
            ) : null}

            {activeStep === 3 ? (
              <div className="form-stack">
                <ShowUpRateField
                  id="beginner-show-up-rate"
                  value={draft.showUpRatePercent}
                  onChange={(value) => update('showUpRatePercent', value)}
                  variant="beginner"
                />
                <ChoiceGroup<BeginnerYesNo | ''>
                  legend="Will registrants receive a replay?"
                  name="beginner-replay"
                  value={draft.replayOffered}
                  onChange={(value) => update('replayOffered', value)}
                  columns={2}
                  choices={[
                    { value: 'yes', label: 'Yes', detail: 'A replay will be available' },
                    { value: 'no', label: 'No', detail: 'Live attendance matters more' },
                  ]}
                />
                <ChoiceGroup<BeginnerYesNo | ''>
                  legend="Will you offer a live show-up bonus?"
                  name="beginner-show-up-bonus"
                  value={draft.showUpBonusPlanned}
                  onChange={(value) => update('showUpBonusPlanned', value)}
                  columns={2}
                  choices={[
                    { value: 'yes', label: 'Yes', detail: 'A relevant live bonus is planned' },
                    { value: 'no', label: 'No', detail: 'No attendance bonus is planned' },
                  ]}
                />
              </div>
            ) : null}

            {activeStep === 4 ? (
              <div className="form-stack">
                <ChoiceGroup<BeginnerDraft['conversionRatePercent']>
                  legend="Share of workshop signups who buy"
                  name="beginner-conversion"
                  value={draft.conversionRatePercent}
                  onChange={(value) => update('conversionRatePercent', value)}
                  choices={[
                    { value: 1, label: '1% · Cautious' },
                    { value: 2, label: '2% · Planning' },
                    { value: 3, label: '3% · Benchmark' },
                  ]}
                  hint="This counts everyone who signs up, including people who do not attend live."
                />
              </div>
            ) : null}

            </div>

            <div className="form-actions beginner-form-actions">
              {activeStep > 0 ? (
                <button
                  className="button button--secondary"
                  type="button"
                  onClick={() => moveTo((activeStep - 1) as StepIndex)}
                >
                  Back
                </button>
              ) : <span />}
              <button
                className="button button--primary"
                type="button"
                onClick={() => moveTo((activeStep + 1) as StepIndex)}
              >
                {activeStep === 4 ? 'Build my plan' : 'Continue'}{' '}
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </section>
          </main>
        </div>
      ) : null}

      {activeStep === 5 && inputs && calculation && strategy && emailReachTrace ? (
        <main className="beginner-results-main" tabIndex={-1} ref={resultMainRef}>
          <BeginnerResults
            inputs={inputs}
            calculation={calculation}
            strategy={strategy}
            emailReachTrace={emailReachTrace}
            onEdit={() => moveTo(0)}
            onReset={startOver}
          />
        </main>
      ) : null}

      <p className="sr-only" aria-live="polite">{announcement}</p>

      <footer className="site-footer">
        <div className="wordmark wordmark--footer">SIGRUN</div>
        <p>Nothing you enter is saved.</p>
      </footer>
    </div>
  )
}

export default BeginnerApp
