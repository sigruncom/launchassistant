import { useEffect, useMemo, useRef, useState } from 'react'
import { ChoiceGroup } from './components/Fields'
import { BeginnerResults } from './components/BeginnerResults'
import { OfferEconomicsFields } from './components/OfferEconomicsFields'
import { VariantNavigation } from './components/VariantNavigation'
import { calculateLaunch } from './domain/calculator'
import {
  beginnerAnswerSchema,
  beginnerBlank,
  beginnerGoalSchema,
  toBeginnerLaunchInputs,
  type BeginnerDraft,
  type BeginnerReadiness,
  type BeginnerResearch,
} from './domain/beginner'
import { offerEconomicsErrors } from './domain/offerEconomics'
import { composeStrategy } from './domain/strategy'
import { useOfferEconomics } from './hooks/useOfferEconomics'

const steps = [
  { number: '01', short: 'Goal', kicker: 'Your goal', title: 'What should this launch achieve?' },
  {
    number: '02',
    short: 'Starting point',
    kicker: 'Your starting point',
    title: 'What can you confidently build from?',
  },
  { number: '03', short: 'Plan', kicker: 'Your plan', title: 'A clear place to begin' },
] as const

type StepIndex = 0 | 1 | 2

type BeginnerNumberFieldProps = {
  id: string
  label: string
  hint?: string
  placeholder: string
  prefix?: string
  value: string
  min?: number
  max?: number
  step?: number
  onChange: (value: string) => void
}

function BeginnerNumberField({
  id,
  label,
  hint,
  placeholder,
  prefix,
  value,
  min = 0,
  max,
  step = 1,
  onChange,
}: BeginnerNumberFieldProps) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {hint ? <p className="field-hint">{hint}</p> : null}
      <div className="number-control">
        {prefix ? <span aria-hidden="true">{prefix}</span> : null}
        <input
          id={id}
          type="number"
          inputMode={step < 1 ? 'decimal' : 'numeric'}
          min={min}
          max={max}
          step={step}
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
    </div>
  )
}

function BeginnerApp() {
  const [draft, setDraft] = useState<BeginnerDraft>(beginnerBlank)
  const [activeStep, setActiveStep] = useState<StepIndex>(0)
  const [showErrors, setShowErrors] = useState(false)
  const [announcement, setAnnouncement] = useState('Beginner planner ready. Nothing is saved.')
  const errorSummaryRef = useRef<HTMLDivElement>(null)
  const economics = useOfferEconomics({
    price: beginnerBlank.price,
    spotsToSell: beginnerBlank.spotsToSell,
    revenueGoal: beginnerBlank.revenueGoal,
  })

  const resolvedDraft = useMemo(
    () =>
      economics.result?.success
        ? { ...draft, ...economics.result.values }
        : null,
    [draft, economics.result],
  )
  const goalValidation = useMemo(
    () => (resolvedDraft ? beginnerGoalSchema.safeParse(resolvedDraft) : null),
    [resolvedDraft],
  )
  const validation = useMemo(
    () => (resolvedDraft ? beginnerAnswerSchema.safeParse(resolvedDraft) : null),
    [resolvedDraft],
  )
  const inputs = useMemo(
    () => (validation?.success ? toBeginnerLaunchInputs(validation.data) : null),
    [validation],
  )
  const calculation = useMemo(() => (inputs ? calculateLaunch(inputs) : null), [inputs])
  const strategy = useMemo(
    () => (inputs && calculation ? composeStrategy(inputs, calculation) : null),
    [inputs, calculation],
  )

  const update = <Key extends keyof BeginnerDraft>(key: Key, value: BeginnerDraft[Key]) => {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  const moveTo = (step: StepIndex) => {
    if (step > activeStep) {
      const canAdvance = step === 1 ? goalValidation?.success : validation?.success

      if (!canAdvance) {
        setShowErrors(true)
        setAnnouncement('Complete the few highlighted questions before continuing.')
        window.requestAnimationFrame(() => errorSummaryRef.current?.focus())
        return
      }
    }

    setShowErrors(false)
    setActiveStep(step)
    setAnnouncement(`Step ${step + 1} of 3: ${steps[step].short}`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const startOver = () => {
    setDraft(beginnerBlank)
    economics.reset({ price: '', spotsToSell: '', revenueGoal: '' })
    setActiveStep(0)
    setShowErrors(false)
    setAnnouncement('The beginner form was cleared. Nothing was retained.')
  }

  const currentValidation = activeStep === 0 ? goalValidation : validation
  const errors = showErrors
    ? [
        ...new Set([
          ...offerEconomicsErrors(economics.result),
          ...(currentValidation && !currentValidation.success
            ? currentValidation.error.issues.map((issue) => issue.message)
            : []),
        ]),
      ]
    : []

  useEffect(() => {
    if (errors.length > 0) {
      errorSummaryRef.current?.focus()
    }
  }, [errors.length])

  return (
    <div className="app-shell beginner-shell">
      <div className="prototype-banner" role="note">
        <span>Beginner prototype</span>
        <p>A guided planning path · nothing you enter is saved</p>
      </div>

      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="Sigrun beginner Launch Assistant home">
          SIGRUN<span>/</span>LAUNCH ASSISTANT
        </a>
        <VariantNavigation activeVariant="beginner" />
      </header>

      <div className="hero beginner-hero" id="top">
        <p className="hero-kicker">Launch & Sell · Beginner path</p>
        <h1>
          One clear step
          <br />
          at a time<span className="red-dot">.</span>
        </h1>
        <p className="hero-copy">
          Build a useful first launch plan without choosing every advanced assumption. We will show
          the working defaults before you use the result.
        </p>
        <ul className="beginner-trust" aria-label="Beginner planner details">
          <li>2 short input steps</li>
          <li>Planning defaults disclosed</li>
          <li>No model call</li>
        </ul>
      </div>

      <nav className="step-navigation beginner-navigation" aria-label="Beginner planner steps">
        {steps.map((step, index) => (
          <button
            className={activeStep === index ? 'step-button step-button--active' : 'step-button'}
            type="button"
            onClick={() => moveTo(index as StepIndex)}
            aria-current={activeStep === index ? 'step' : undefined}
            key={step.short}
          >
            <span>{step.number}</span>
            {step.short}
          </button>
        ))}
      </nav>

      {activeStep < 2 ? (
        <main className="beginner-workspace">
          <section className="beginner-input-card" aria-labelledby="beginner-step-title">
            <div className="step-heading">
              <p className="step-kicker">
                {activeStep + 1} / 2 — {steps[activeStep].kicker}
              </p>
              <h2 id="beginner-step-title">{steps[activeStep].title}</h2>
            </div>

            {errors.length > 0 ? (
              <div className="error-summary" role="alert" tabIndex={-1} ref={errorSummaryRef}>
                <strong>A few answers are still needed:</strong>
                <ul>{errors.map((error) => <li key={error}>{error}</li>)}</ul>
              </div>
            ) : null}

            {activeStep === 0 ? (
              <div className="form-stack">
                <div className="field beginner-currency-field">
                  <label htmlFor="beginner-currency">Currency</label>
                  <select
                    id="beginner-currency"
                    className="select-input"
                    value={draft.currency}
                    onChange={(event) =>
                      update('currency', event.target.value as BeginnerDraft['currency'])
                    }
                  >
                    <option value="EUR">EUR · €</option>
                    <option value="USD">USD · $</option>
                    <option value="GBP">GBP · £</option>
                  </select>
                </div>

                <OfferEconomicsFields
                  calculatedField={economics.calculatedField}
                  currency={draft.currency}
                  draft={economics.draft}
                  idPrefix="beginner-economics"
                  result={economics.result}
                  showErrors={showErrors}
                  sourceOrder={economics.sourceOrder}
                  variant="beginner"
                  onChange={economics.update}
                />
              </div>
            ) : null}

            {activeStep === 1 ? (
              <div className="form-stack">
                <BeginnerNumberField
                  id="beginner-organic-registrations"
                  label="How many workshop registrations can you reasonably expect without ads?"
                  hint="Use a conservative estimate. This is not your total audience size."
                  placeholder="100"
                  max={100_000_000}
                  value={draft.organicRegistrations}
                  onChange={(value) => update('organicRegistrations', value)}
                />

                <ChoiceGroup<BeginnerReadiness | ''>
                  legend="Which best describes this launch?"
                  name="beginner-readiness"
                  value={draft.readiness}
                  onChange={(value) => update('readiness', value)}
                  choices={[
                    {
                      value: 'new',
                      label: 'New beginning',
                      detail: 'First launch or a new audience',
                    },
                    {
                      value: 'building',
                      label: 'Building trust',
                      detail: 'Some experience and a mixed audience',
                    },
                    {
                      value: 'ready',
                      label: 'Ready audience',
                      detail: 'Experienced, warm and ready to buy',
                    },
                  ]}
                />

                <ChoiceGroup<BeginnerResearch | ''>
                  legend="Is recent client research confirmed?"
                  name="beginner-research"
                  value={draft.recentResearch}
                  onChange={(value) => update('recentResearch', value)}
                  columns={2}
                  hint="Choose Yes for recent interviews with this audience or at least 10 relevant survey responses."
                  choices={[
                    { value: 'yes', label: 'Yes', detail: 'Recent evidence exists' },
                    { value: 'not-yet', label: 'Not yet', detail: 'Make this a next step' },
                  ]}
                />

                <aside className="beginner-defaults-note" aria-label="Planning defaults">
                  <strong>Planning defaults</strong>
                  <p>
                    This starting plan uses 2% conversion, 30% live attendance, 60% group joining
                    and no paid ads. You can inspect and change these in the complete planner.
                  </p>
                </aside>
              </div>
            ) : null}

            <div className="form-actions beginner-form-actions">
              {activeStep > 0 ? (
                <button className="button button--secondary" type="button" onClick={() => moveTo(0)}>
                  Back
                </button>
              ) : <span />}
              <button
                className="button button--primary"
                type="button"
                onClick={() => moveTo((activeStep + 1) as StepIndex)}
              >
                {activeStep === 1 ? 'Build my starting plan' : 'Continue'}{' '}
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </section>
        </main>
      ) : null}

      {activeStep === 2 && inputs && calculation && strategy ? (
        <main className="beginner-results-main">
          <BeginnerResults
            inputs={inputs}
            calculation={calculation}
            strategy={strategy}
            onEdit={() => moveTo(0)}
            onReset={startOver}
          />
        </main>
      ) : null}

      <p className="sr-only" aria-live="polite">{announcement}</p>

      <footer className="site-footer">
        <div className="wordmark wordmark--footer">SIGRUN</div>
        <p>Beginner methodology prototype · organic-only planning · nothing entered is saved</p>
        <span>Working case · 2%</span>
      </footer>
    </div>
  )
}

export default BeginnerApp
