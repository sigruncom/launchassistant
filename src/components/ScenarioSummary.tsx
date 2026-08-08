import type { LaunchCalculation } from '../domain/calculator'
import type { LaunchInputs } from '../domain/schema'
import { SourceChip } from './SourceChip'

const formatter = (currency: LaunchInputs['currency']) =>
  new Intl.NumberFormat('en', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })

type ScenarioSummaryProps = {
  inputs: LaunchInputs
  calculation: LaunchCalculation
}

export function ScenarioSummary({ inputs, calculation }: ScenarioSummaryProps) {
  const selected = calculation.selected
  const money = formatter(inputs.currency)
  const largestRegistrationTarget = Math.max(
    ...calculation.scenarios.map((scenario) => scenario.registrationsRequired),
  )

  return (
    <aside className="calculation-panel" aria-label="Live launch calculation">
      <div className="panel-eyebrow">
        <span>Live calculation</span>
        <span className="version-badge">v0.1</span>
      </div>

      <p className="equation-intro">To reach</p>
      <h2>{money.format(inputs.revenueGoal)}</h2>
      <p className="equation-copy">
        plan for <strong>{selected.registrationsRequired.toLocaleString()} registrations</strong>{' '}
        at {selected.conversionRatePercent}% conversion.
      </p>

      <div className="red-thread" aria-label="Revenue to registration calculation">
        <div className="thread-node">
          <span>Goal</span>
          <strong>{money.format(inputs.revenueGoal)}</strong>
        </div>
        <div className="thread-node">
          <span>Buyers</span>
          <strong>{selected.buyersRequired.toLocaleString()}</strong>
        </div>
        <div className="thread-node">
          <span>Registrations</span>
          <strong>{selected.registrationsRequired.toLocaleString()}</strong>
        </div>
        <div className="thread-node">
          <span>Live</span>
          <strong>{selected.attendeesExpected.toLocaleString()}</strong>
        </div>
      </div>

      <div className={`gap-callout ${selected.registrationGapAfterBudget > 0 ? 'gap-callout--open' : ''}`}>
        <span>
          {selected.registrationGapAfterBudget > 0 ? 'Registration gap' : 'Reach check'}
        </span>
        <strong>
          {selected.registrationGapAfterBudget > 0
            ? `+${selected.registrationGapAfterBudget.toLocaleString()}`
            : 'Covered'}
        </strong>
        <small>
          {selected.registrationGapAfterBudget > 0
            ? 'beyond your organic estimate and current ad budget'
            : 'by your organic estimate and current ad budget'}
        </small>
      </div>

      <div className="metric-pair">
        <div>
          <span>Paid gap before budget</span>
          <strong>{selected.paidRegistrationGap.toLocaleString()}</strong>
        </div>
        <div>
          <span>Ad spend required</span>
          <strong>{money.format(selected.requiredAdSpendCents / 100)}</strong>
        </div>
      </div>

      <div className="scenario-comparison">
        <div className="section-label">Scenario comparison</div>
        {calculation.scenarios.map((scenario) => (
          <div
            className={`scenario-row ${
              scenario.conversionRatePercent === inputs.conversionRatePercent
                ? 'scenario-row--selected'
                : ''
            }`}
            key={scenario.key}
          >
            <div className="scenario-row__label">
              <span>{scenario.conversionRatePercent}% · {scenario.label}</span>
              <strong>{scenario.registrationsRequired.toLocaleString()}</strong>
            </div>
            <div className="scenario-track" aria-hidden="true">
              <span
                style={{
                  width: `${Math.max(
                    4,
                    (scenario.registrationsRequired / largestRegistrationTarget) * 100,
                  )}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="source-note">
        <SourceChip sourceId="LS-FUNNEL-001" />
        <p>
          The 1–3% rates are sourced. Reverse-funnel formulas are prototype assumptions awaiting
          Sigrun’s approval.
        </p>
      </div>
    </aside>
  )
}
