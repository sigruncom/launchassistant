import { useMemo, useState } from 'react'
import { calculateLaunch } from './domain/calculator'
import {
  blankInputs,
  demoInputs,
  launchInputSchema,
  type LaunchInputs,
} from './domain/schema'
import { composeStrategy } from './domain/strategy'
import { ChoiceGroup, NumberField, ToggleField } from './components/Fields'
import { OfferEconomicsFields } from './components/OfferEconomicsFields'
import { ScenarioSummary } from './components/ScenarioSummary'
import { StrategyView } from './components/StrategyView'
import { VariantNavigation } from './components/VariantNavigation'
import {
  offerEconomicsDraftFromNumbers,
  offerEconomicsErrors,
} from './domain/offerEconomics'
import { useOfferEconomics } from './hooks/useOfferEconomics'

const steps = [
  { number: '01', short: 'Offer', kicker: 'The offer', title: 'What are you launching?' },
  { number: '02', short: 'Reach', kicker: 'Your reach', title: 'Who can you realistically invite?' },
  { number: '03', short: 'Numbers', kicker: 'The assumptions', title: 'Which case should we plan around?' },
  { number: '04', short: 'Strategy', kicker: 'Your plan', title: 'A launch shape the numbers support' },
] as const

type StepIndex = 0 | 1 | 2 | 3

const currencySymbol: Record<LaunchInputs['currency'], string> = {
  EUR: '€',
  USD: '$',
  GBP: '£',
}

function App() {
  const [inputs, setInputs] = useState<LaunchInputs>(demoInputs)
  const [activeStep, setActiveStep] = useState<StepIndex>(0)
  const [announcement, setAnnouncement] = useState('Demo values loaded. Nothing is saved.')
  const economics = useOfferEconomics(
    offerEconomicsDraftFromNumbers(demoInputs.price, demoInputs.revenueGoal),
  )

  const resolvedInputs = useMemo<LaunchInputs | null>(
    () =>
      economics.result.success
        ? {
            ...inputs,
            price: economics.result.numbers.price,
            revenueGoal: economics.result.numbers.revenueGoal,
          }
        : null,
    [economics.result, inputs],
  )
  const validation = useMemo(
    () => (resolvedInputs ? launchInputSchema.safeParse(resolvedInputs) : null),
    [resolvedInputs],
  )
  const validInputs = validation?.success ? validation.data : null
  const calculation = useMemo(
    () => (validInputs ? calculateLaunch(validInputs) : null),
    [validInputs],
  )
  const strategy = useMemo(
    () => (validInputs && calculation ? composeStrategy(validInputs, calculation) : null),
    [validInputs, calculation],
  )

  const update = <Key extends keyof LaunchInputs>(key: Key, value: LaunchInputs[Key]) => {
    setInputs((current) => ({ ...current, [key]: value }))
  }

  const moveTo = (step: StepIndex) => {
    if (!validInputs && step > activeStep) {
      setAnnouncement('Please correct the highlighted assumptions before continuing.')
      return
    }

    setActiveStep(step)
    setAnnouncement(`Step ${step + 1} of 4: ${steps[step].short}`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const loadDemo = () => {
    setInputs(demoInputs)
    economics.reset(offerEconomicsDraftFromNumbers(demoInputs.price, demoInputs.revenueGoal))
    setActiveStep(0)
    setAnnouncement('Demo values restored. Nothing is saved.')
  }

  const startOver = () => {
    setInputs(blankInputs)
    economics.reset({ price: '', spotsToSell: '', revenueGoal: '' })
    setActiveStep(0)
    setAnnouncement('The form was cleared. Nothing was retained.')
  }

  const errors = [
    ...offerEconomicsErrors(economics.result),
    ...(validation && !validation.success
      ? validation.error.issues.map((issue) => issue.message)
      : []),
  ]

  return (
    <div className="app-shell">
      <div className="prototype-banner" role="note">
        <span>Internal prototype</span>
        <p>Use anonymized values only · answers live in this browser tab and are never saved</p>
      </div>

      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="Sigrun Launch Assistant home">
          SIGRUN<span>/</span>LAUNCH ASSISTANT
        </a>
        <VariantNavigation activeVariant="complete" />
        <button className="demo-button" type="button" onClick={loadDemo}>
          Restore demo
        </button>
      </header>

      <div className="hero" id="top">
        <p className="hero-kicker">Launch & Sell · Method prototype</p>
        <h1>
          Plan the launch the
          <br />
          numbers can support<span className="red-dot">.</span>
        </h1>
        <p className="hero-copy">
          Work backwards from your revenue goal, then build a strategy grounded only in
          Sigrun’s current Launch & Sell outline.
        </p>
      </div>

      <nav className="step-navigation" aria-label="Prototype steps">
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

      {activeStep < 3 ? (
        <main className="workspace">
          <section className="input-panel" aria-labelledby="step-title">
            <div className="step-heading">
              <p className="step-kicker">
                {activeStep + 1} / 3 — {steps[activeStep].kicker}
              </p>
              <h2 id="step-title">{steps[activeStep].title}</h2>
            </div>

            {errors.length > 0 ? (
              <div className="error-summary" role="alert">
                <strong>Check these assumptions:</strong>
                <ul>{errors.map((error) => <li key={error}>{error}</li>)}</ul>
              </div>
            ) : null}

            {activeStep === 0 ? (
              <div className="form-stack">
                <div className="field field--wide">
                  <label htmlFor="offer-name">Working offer name</label>
                  <p className="field-hint">Use a generic or anonymized name for this prototype.</p>
                  <input
                    id="offer-name"
                    className="text-input"
                    type="text"
                    maxLength={80}
                    value={inputs.offerName}
                    onChange={(event) => update('offerName', event.target.value)}
                  />
                </div>

                <ChoiceGroup
                  legend="Offer format"
                  name="offer-type"
                  value={inputs.offerType}
                  onChange={(value) => update('offerType', value)}
                  columns={4}
                  choices={[
                    { value: 'one-to-one', label: '1:1', detail: 'High-touch' },
                    { value: 'group', label: 'Group', detail: 'Cohort delivery' },
                    { value: 'course', label: 'Course', detail: 'Scalable' },
                    { value: 'undecided', label: 'Not sure', detail: 'Let the reach guide it' },
                  ]}
                />

                <div className="field economics-currency-field">
                  <label htmlFor="currency">Currency</label>
                  <select
                    id="currency"
                    className="select-input"
                    value={inputs.currency}
                    onChange={(event) =>
                      update('currency', event.target.value as LaunchInputs['currency'])
                    }
                  >
                    <option value="EUR">EUR · €</option>
                    <option value="USD">USD · $</option>
                    <option value="GBP">GBP · £</option>
                  </select>
                </div>

                <OfferEconomicsFields
                  calculatedField={economics.calculatedField}
                  currency={inputs.currency}
                  draft={economics.draft}
                  idPrefix="complete-economics"
                  result={economics.result}
                  showErrors={!economics.result.success}
                  variant="complete"
                  onCalculatedFieldChange={(field) => {
                    economics.calculateField(field)
                    setAnnouncement(`The planner will now calculate ${field === 'spotsToSell' ? 'spots to sell' : field === 'revenueGoal' ? 'the revenue goal' : 'the price'}.`)
                  }}
                  onChange={economics.update}
                />
              </div>
            ) : null}

            {activeStep === 1 ? (
              <div className="form-stack">
                <div className="form-grid form-grid--2">
                  <NumberField
                    id="email-list"
                    label="Email-list size"
                    value={inputs.emailListSize}
                    onChange={(value) => update('emailListSize', value)}
                  />
                  <NumberField
                    id="social-following"
                    label="Relevant social following"
                    value={inputs.socialFollowers}
                    onChange={(value) => update('socialFollowers', value)}
                  />
                </div>

                <NumberField
                  id="organic-registrations"
                  label="Expected organic workshop registrations"
                  hint="A working estimate—not your total audience size."
                  value={inputs.organicRegistrations}
                  onChange={(value) => update('organicRegistrations', value)}
                />

                <ChoiceGroup
                  legend="Launch experience"
                  name="experience"
                  value={inputs.launchExperience}
                  onChange={(value) => update('launchExperience', value)}
                  choices={[
                    { value: 'first', label: 'First launch' },
                    { value: 'some', label: 'Launched before' },
                    { value: 'experienced', label: 'Experienced' },
                  ]}
                />

                <ChoiceGroup
                  legend="Audience warmth"
                  name="warmth"
                  value={inputs.audienceWarmth}
                  onChange={(value) => update('audienceWarmth', value)}
                  choices={[
                    { value: 'cold', label: 'New / cold' },
                    { value: 'mixed', label: 'Mixed' },
                    { value: 'warm', label: 'Warm' },
                  ]}
                />

                <ChoiceGroup
                  legend="Problem awareness"
                  name="awareness"
                  value={inputs.problemAwareness}
                  onChange={(value) => update('problemAwareness', value)}
                  choices={[
                    { value: 'curious', label: 'Curious' },
                    { value: 'aware', label: 'Problem-aware' },
                    { value: 'ready', label: 'Ready to buy' },
                  ]}
                />
              </div>
            ) : null}

            {activeStep === 2 ? (
              <div className="form-stack">
                <ChoiceGroup
                  legend="Workshop-to-sale conversion"
                  name="conversion"
                  value={inputs.conversionRatePercent}
                  onChange={(value) => update('conversionRatePercent', value)}
                  choices={[
                    { value: 1, label: '1% · Cautious', detail: 'Explicit downside' },
                    { value: 2, label: '2% · Planning', detail: 'Working case' },
                    { value: 3, label: '3% · Benchmark', detail: 'Stated average' },
                  ]}
                  hint="The outline explicitly says 1–2% is possible and describes 3% as average."
                />

                <div className="form-grid form-grid--2">
                  <NumberField
                    id="show-up-rate"
                    label="Expected live attendance"
                    suffix="%"
                    min={1}
                    max={100}
                    value={inputs.showUpRatePercent}
                    onChange={(value) => update('showUpRatePercent', value)}
                  />
                  <NumberField
                    id="group-join-rate"
                    label="Expected group join rate"
                    suffix="%"
                    min={1}
                    max={100}
                    value={inputs.groupJoinRatePercent}
                    onChange={(value) => update('groupJoinRatePercent', value)}
                  />
                </div>

                <div className="form-grid form-grid--2">
                  <NumberField
                    id="cost-per-lead"
                    label="Cost per paid registration"
                    hint="The source provides no authoritative default."
                    prefix={currencySymbol[inputs.currency]}
                    step={0.1}
                    value={inputs.costPerLead}
                    onChange={(value) => update('costPerLead', value)}
                  />
                  <NumberField
                    id="ad-budget"
                    label="Available ad budget"
                    prefix={currencySymbol[inputs.currency]}
                    step={50}
                    value={inputs.adBudget}
                    onChange={(value) => update('adBudget', value)}
                  />
                </div>

                <div className="form-grid form-grid--2">
                  <ToggleField
                    id="recent-research"
                    label="Recent client research"
                    detail="Interviews or a recent survey with this audience"
                    checked={inputs.recentResearch}
                    onChange={(value) => update('recentResearch', value)}
                  />
                  <ToggleField
                    id="facebook-fit"
                    label="Workshop group fits the audience"
                    detail="A community space supports interaction"
                    checked={inputs.facebookGroupFit}
                    onChange={(value) => update('facebookGroupFit', value)}
                  />
                </div>

                {!inputs.recentResearch ? (
                  <NumberField
                    id="survey-responses"
                    label="Survey responses collected"
                    hint="The source sets 10 as the minimum and 100 as the goal."
                    value={inputs.surveyResponses}
                    onChange={(value) => update('surveyResponses', value)}
                  />
                ) : null}
              </div>
            ) : null}

            <div className="form-actions">
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
                disabled={!validInputs}
              >
                {activeStep === 2 ? 'Build my strategy' : 'Continue'}{' '}
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </section>

          {calculation && validInputs ? (
            <ScenarioSummary inputs={validInputs} calculation={calculation} />
          ) : (
            <aside className="calculation-panel calculation-panel--invalid" role="status">
              <p className="panel-eyebrow">Calculation paused</p>
              <h2>Check the inputs.</h2>
              <p className="equation-copy">
                The calculator will resume as soon as the current values are valid.
              </p>
              <ul>
                {errors.map((error) => <li key={error}>{error}</li>)}
              </ul>
            </aside>
          )}
        </main>
      ) : null}

      {activeStep === 3 && validInputs && calculation && strategy ? (
        <main className="strategy-main">
          <StrategyView
            inputs={validInputs}
            calculation={calculation}
            strategy={strategy}
            onEdit={() => moveTo(2)}
            onReset={startOver}
          />
        </main>
      ) : null}

      <p className="sr-only" aria-live="polite">{announcement}</p>

      <footer className="site-footer">
        <div className="wordmark wordmark--footer">SIGRUN</div>
        <p>
          Internal methodology prototype · no authentication · no persistence · no external model
          calls
        </p>
        <span>Calculator {calculation?.calculatorVersion ?? 'unavailable'}</span>
      </footer>
    </div>
  )
}

export default App
