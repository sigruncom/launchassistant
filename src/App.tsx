import { useMemo, useRef, useState } from 'react'
import {
  ChoiceGroup,
  DraftNumberField,
  ShowUpRateField,
} from './components/Fields'
import { OfferEconomicsFields } from './components/OfferEconomicsFields'
import { StepProgress } from './components/StepProgress'
import { StrategyView } from './components/StrategyView'
import { VariantNavigation } from './components/VariantNavigation'
import { calculateLaunch } from './domain/calculator'
import {
  completeBlank,
  completeStepErrors,
  parseCompleteDraft,
  type CompleteDraft,
  type ResearchAnswer,
  type YesNoAnswer,
} from './domain/complete'
import { composeStrategy } from './domain/strategy'
import type { LaunchInputs } from './domain/schema'
import { useOfferEconomics } from './hooks/useOfferEconomics'

const steps = [
  { short: 'Offer', kicker: 'The offer', title: 'What are you launching?' },
  { short: 'Revenue target', kicker: 'The goal', title: 'What should this launch achieve?' },
  { short: 'Reach', kicker: 'Your starting point', title: 'How many registrations can you expect?' },
  { short: 'Workshop', kicker: 'The format', title: 'Which workshop fits this audience?' },
  { short: 'Attendance', kicker: 'Live attendance', title: 'What show-up rate will you plan for?' },
  { short: 'Sales case', kicker: 'The funnel', title: 'Which sales case should we use?' },
  { short: 'Promotion', kicker: 'Paid reach', title: 'Will paid promotion support the launch?' },
  { short: 'Research', kicker: 'Audience evidence', title: 'Is the audience evidence ready?' },
  { short: 'Strategy', kicker: 'Your plan', title: 'A launch shape the numbers support' },
] as const

type StepIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8

const currencySymbol: Record<LaunchInputs['currency'], string> = {
  EUR: '€',
  USD: '$',
  GBP: '£',
}

function App() {
  const [draft, setDraft] = useState<CompleteDraft>(completeBlank)
  const [activeStep, setActiveStep] = useState<StepIndex>(0)
  const [errors, setErrors] = useState<string[]>([])
  const [announcement, setAnnouncement] = useState('Complete planner ready. Nothing is saved.')
  const errorSummaryRef = useRef<HTMLDivElement>(null)
  const stepHeadingRef = useRef<HTMLHeadingElement>(null)
  const resultMainRef = useRef<HTMLElement>(null)
  const economics = useOfferEconomics({ price: '', spotsToSell: '', revenueGoal: '' })

  const validation = useMemo(
    () => parseCompleteDraft(draft, economics.result),
    [draft, economics.result],
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

  const update = <Key extends keyof CompleteDraft>(key: Key, value: CompleteDraft[Key]) => {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  const focusStepHeading = (step: StepIndex) => {
    window.requestAnimationFrame(() => {
      if (step === 8) {
        resultMainRef.current?.focus()
        return
      }

      stepHeadingRef.current?.focus()
    })
  }

  const moveTo = (step: StepIndex) => {
    if (step > activeStep) {
      const stepErrors = completeStepErrors(activeStep, draft, economics.result)
      const finalErrors =
        activeStep === 7 && validation && !validation.success
          ? validation.error.issues.map((issue) => issue.message)
          : []
      const nextErrors = [...new Set([...stepErrors, ...finalErrors])]

      if (nextErrors.length > 0 || (activeStep === 7 && !validInputs)) {
        setErrors(
          nextErrors.length > 0 ? nextErrors : ['Complete the required answers before continuing.'],
        )
        setAnnouncement('Complete the highlighted questions before continuing.')
        window.requestAnimationFrame(() => errorSummaryRef.current?.focus())
        return
      }
    }

    setErrors([])
    setActiveStep(step)
    setAnnouncement(`Step ${step + 1} of ${steps.length}: ${steps[step].short}`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
    focusStepHeading(step)
  }

  const startOver = () => {
    setDraft(completeBlank)
    economics.reset({ price: '', spotsToSell: '', revenueGoal: '' })
    setActiveStep(0)
    setErrors([])
    setAnnouncement('The complete form was cleared. Nothing was retained.')
    focusStepHeading(0)
  }

  const moneyPrefix = draft.currency ? currencySymbol[draft.currency] : undefined

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
      </header>

      <div className="hero" id="top">
        <p className="hero-kicker">Launch & Sell · Complete path</p>
        <h1>
          Plan the launch the
          <br />
          numbers can support<span className="red-dot">.</span>
        </h1>
        <p className="hero-copy">
          Work through one topic at a time. Every answer starts blank, and the calculation appears
          only after you finish the inputs.
        </p>
      </div>

      <StepProgress activeStep={activeStep} labels={steps.map((step) => step.short)} />

      {activeStep < 8 ? (
        <main className="workspace workspace--single">
          <section className="input-panel" aria-labelledby="step-title">
            <div className="step-heading">
              <p className="step-kicker">
                {activeStep + 1} / 8 — {steps[activeStep].kicker}
              </p>
              <h2 id="step-title" tabIndex={-1} ref={stepHeadingRef}>
                {steps[activeStep].title}
              </h2>
            </div>

            {errors.length > 0 ? (
              <div className="error-summary" role="alert" tabIndex={-1} ref={errorSummaryRef}>
                <strong>Complete these answers:</strong>
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
                    placeholder="Enter a working name"
                    value={draft.offerName}
                    onChange={(event) => update('offerName', event.target.value)}
                  />
                </div>
                <ChoiceGroup<CompleteDraft['offerType']>
                  legend="Offer format"
                  name="offer-type"
                  value={draft.offerType}
                  onChange={(value) => update('offerType', value)}
                  columns={4}
                  choices={[
                    { value: 'one-to-one', label: '1:1', detail: 'High-touch' },
                    { value: 'group', label: 'Group', detail: 'Group delivery' },
                    { value: 'course', label: 'Course', detail: 'Scalable' },
                    { value: 'undecided', label: 'Not sure', detail: 'Review after the numbers' },
                  ]}
                />
              </div>
            ) : null}

            {activeStep === 1 ? (
              <div className="form-stack">
                <div className="field economics-currency-field">
                  <label htmlFor="currency">Currency</label>
                  <select
                    id="currency"
                    className="select-input"
                    value={draft.currency}
                    onChange={(event) =>
                      update('currency', event.target.value as CompleteDraft['currency'])
                    }
                  >
                    <option value="">Choose currency</option>
                    <option value="EUR">EUR · €</option>
                    <option value="USD">USD · $</option>
                    <option value="GBP">GBP · £</option>
                  </select>
                </div>
                <OfferEconomicsFields
                  calculatedField={economics.calculatedField}
                  currency={draft.currency || undefined}
                  draft={economics.draft}
                  idPrefix="complete-economics"
                  result={economics.result}
                  showErrors={errors.length > 0}
                  sourceOrder={economics.sourceOrder}
                  variant="complete"
                  onChange={economics.update}
                />
              </div>
            ) : null}

            {activeStep === 2 ? (
              <DraftNumberField
                id="organic-registrations"
                label="Expected organic workshop registrations"
                hint="Use a working estimate based on registrations you can generate without ads."
                placeholder="Enter your estimate"
                max={100_000_000}
                value={draft.organicRegistrations}
                onChange={(value) => update('organicRegistrations', value)}
              />
            ) : null}

            {activeStep === 3 ? (
              <div className="form-stack">
                <ChoiceGroup<CompleteDraft['audienceContext']>
                  legend="Which audience type fits best?"
                  name="complete-audience-context"
                  value={draft.audienceContext}
                  onChange={(value) => update('audienceContext', value)}
                  choices={[
                    { value: 'b2b', label: 'B2B', detail: 'Time is often the main constraint' },
                    { value: 'hobby', label: 'Hobby', detail: 'Often a lower-priced offer' },
                    { value: 'other', label: 'Other', detail: 'Consumer or mixed audience' },
                  ]}
                />
                <ChoiceGroup<CompleteDraft['workshopDurationDays']>
                  legend="Choose the workshop length"
                  name="complete-workshop-duration"
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

            {activeStep === 4 ? (
              <div className="form-stack">
                <ShowUpRateField
                  id="complete-show-up-rate"
                  value={draft.showUpRatePercent}
                  onChange={(value) => update('showUpRatePercent', value)}
                />
                <ChoiceGroup<YesNoAnswer | ''>
                  legend="Will registrants receive a replay?"
                  name="complete-replay"
                  value={draft.replayOffered}
                  onChange={(value) => update('replayOffered', value)}
                  columns={2}
                  choices={[
                    { value: 'yes', label: 'Yes', detail: 'A replay will be available' },
                    { value: 'no', label: 'No', detail: 'Live attendance matters more' },
                  ]}
                />
                <ChoiceGroup<YesNoAnswer | ''>
                  legend="Will you offer a live show-up bonus?"
                  name="complete-show-up-bonus"
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

            {activeStep === 5 ? (
              <div className="form-stack">
                <ChoiceGroup<CompleteDraft['conversionRatePercent']>
                  legend="Workshop-registration-to-sale conversion"
                  name="complete-conversion"
                  value={draft.conversionRatePercent}
                  onChange={(value) => update('conversionRatePercent', value)}
                  choices={[
                    { value: 1, label: '1% · Cautious', detail: 'Explicit downside' },
                    { value: 2, label: '2% · Planning', detail: 'Working case' },
                    { value: 3, label: '3% · Benchmark', detail: 'Stated average' },
                  ]}
                  hint="The outline says 1–2% is possible and describes 3% as average."
                />
                <DraftNumberField
                  id="group-join-rate"
                  label="Expected workshop-group join rate"
                  hint="The outline gives 60% as the general example and 70% as a historical example."
                  placeholder="Enter a rate"
                  suffix="%"
                  min={1}
                  max={100}
                  value={draft.groupJoinRatePercent}
                  onChange={(value) => update('groupJoinRatePercent', value)}
                />
              </div>
            ) : null}

            {activeStep === 6 ? (
              <div className="form-stack">
                <ChoiceGroup<YesNoAnswer | ''>
                  legend="Are you planning paid promotion for this launch?"
                  name="complete-paid-promotion"
                  value={draft.paidPromotionPlanned}
                  onChange={(value) => update('paidPromotionPlanned', value)}
                  columns={2}
                  choices={[
                    { value: 'yes', label: 'Yes', detail: 'Include a paid reach check' },
                    { value: 'no', label: 'No', detail: 'Plan from organic reach only' },
                  ]}
                />
                {draft.paidPromotionPlanned === 'yes' ? (
                  <div className="form-grid form-grid--2">
                    <DraftNumberField
                      id="cost-per-lead"
                      label="Cost per paid registration"
                      hint="Use your own evidence; no authoritative default is defined."
                      prefix={moneyPrefix}
                      placeholder="Enter cost"
                      step={0.01}
                      max={100_000}
                      value={draft.costPerLead}
                      onChange={(value) => update('costPerLead', value)}
                    />
                    <DraftNumberField
                      id="ad-budget"
                      label="Available ad budget"
                      prefix={moneyPrefix}
                      placeholder="Enter budget"
                      step={0.01}
                      max={100_000_000}
                      value={draft.adBudget}
                      onChange={(value) => update('adBudget', value)}
                    />
                  </div>
                ) : null}
              </div>
            ) : null}

            {activeStep === 7 ? (
              <div className="form-stack">
                <ChoiceGroup<ResearchAnswer | ''>
                  legend="Is recent client research confirmed?"
                  name="complete-research"
                  value={draft.recentResearch}
                  onChange={(value) => update('recentResearch', value)}
                  columns={2}
                  choices={[
                    { value: 'yes', label: 'Yes', detail: 'Recent interviews or survey evidence' },
                    { value: 'not-yet', label: 'Not yet', detail: 'Make this a next step' },
                  ]}
                />
                {draft.recentResearch === 'not-yet' ? (
                  <DraftNumberField
                    id="survey-responses"
                    label="Survey responses collected"
                    hint="The outline sets 10 as the minimum and 100 as the goal."
                    placeholder="Enter a whole number"
                    max={100_000}
                    value={draft.surveyResponses}
                    onChange={(value) => update('surveyResponses', value)}
                  />
                ) : null}
                <ChoiceGroup<YesNoAnswer | ''>
                  legend="Would an online workshop group suit this audience?"
                  name="complete-group-fit"
                  value={draft.facebookGroupFit}
                  onChange={(value) => update('facebookGroupFit', value)}
                  columns={2}
                  choices={[
                    { value: 'yes', label: 'Yes', detail: 'A community space fits' },
                    { value: 'no', label: 'No', detail: 'Use a different live space' },
                  ]}
                />
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
              >
                {activeStep === 7 ? 'Build my strategy' : 'Continue'}{' '}
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </section>
        </main>
      ) : null}

      {activeStep === 8 && validInputs && calculation && strategy ? (
        <main className="strategy-main" tabIndex={-1} ref={resultMainRef}>
          <StrategyView
            inputs={validInputs}
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
        <p>
          Complete methodology prototype · no authentication · no persistence · no external model
          calls
        </p>
        <span>Calculator {calculation?.calculatorVersion ?? 'not started'}</span>
      </footer>
    </div>
  )
}

export default App
