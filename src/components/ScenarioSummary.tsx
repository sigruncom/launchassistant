import type { LaunchCalculation } from '../domain/calculator'
import { formatMinorUnits, moneyFormatter } from '../domain/currency'
import type { LaunchInputs } from '../domain/schema'
import { SourceChip } from './SourceChip'

type ScenarioSummaryProps = {
  inputs: LaunchInputs
  calculation: LaunchCalculation
}

export function ScenarioSummary({ inputs, calculation }: ScenarioSummaryProps) {
  const selected = calculation.selected
  const money = moneyFormatter(inputs.currency)
  const versionLabel = calculation.calculatorVersion.replace('prototype-', 'v')
  const largestRegistrationTarget = Math.max(
    ...calculation.scenarios.map((scenario) => scenario.registrationsRequired),
  )

  return (
    <aside className="calculation-panel" aria-label="Live launch calculation">
      <div className="panel-eyebrow">
        <span>Live calculation</span>
        <span className="version-badge">{versionLabel}</span>
      </div>

      <p className="equation-intro">To reach</p>
      <h2>{money.format(inputs.revenueGoal)}</h2>
      <p className="equation-copy">
        plan for <strong>{selected.registrationsRequired.toLocaleString()} registrations</strong>{' '}
        at {selected.conversionRatePercent}% of all workshop signups converting to buyers.
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
          <span>Live from current reach</span>
          <strong>{selected.projectedAttendeesExpected.toLocaleString()}</strong>
        </div>
        <div>
          <span>Ad spend required</span>
          <strong>{formatMinorUnits(inputs.currency, selected.requiredAdSpendMinorUnits)}</strong>
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
        <div className="source-list">
          <SourceChip sourceId="SIGRUN-FORMULAS-2026-08-09" />
          <SourceChip sourceId="SIGRUN-CONVERSION-2026-08-16" />
        </div>
        <p>
          Sigrun approved the prototype formulas and confirmed that sales conversion applies to
          all workshop signups, independent of live attendance.
        </p>
      </div>
    </aside>
  )
}
