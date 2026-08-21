import { useState } from 'react'
import type { LaunchCalculation } from '../domain/calculator'
import type { LaunchInputs } from '../domain/schema'
import type { StrategyPlan } from '../domain/strategy'
import { SourceChip } from './SourceChip'

type StrategyViewProps = {
  inputs: LaunchInputs
  calculation: LaunchCalculation
  strategy: StrategyPlan
  onEdit: () => void
  onReset: () => void
}

const makeSummary = (
  inputs: LaunchInputs,
  calculation: LaunchCalculation,
  strategy: StrategyPlan,
) => {
  const scenario = calculation.selected
  const groupLine = inputs.workshopGroup === 'none'
    ? 'Workshop group: not planned'
    : scenario.groupJoinsExpected === null
      ? 'Estimated group joins: not estimated'
      : `Estimated group joins: ${scenario.groupJoinsExpected}`

  return [
    `${inputs.offerName}: ${strategy.headline}`,
    strategy.summary,
    `Selected workshop: ${inputs.workshopDurationDays} day${inputs.workshopDurationDays === 1 ? '' : 's'}`,
    `Selected show-up rate: ${inputs.showUpRatePercent}%`,
    `Live attendees at target: ${scenario.attendeesExpected}`,
    `Live attendees from current reach: ${scenario.projectedAttendeesExpected}`,
    groupLine,
    `Registration gap after current ad budget: ${scenario.registrationGapAfterBudget}`,
    '',
    'Next moves:',
    ...strategy.nextMoves.map((item) => `- ${item.title}: ${item.body}`),
    '',
    'Coach decisions:',
    ...strategy.coachDecisions.map((item) => `- ${item}`),
  ].join('\n')
}

export function StrategyView({
  inputs,
  calculation,
  strategy,
  onEdit,
  onReset,
}: StrategyViewProps) {
  const [copied, setCopied] = useState(false)
  const selected = calculation.selected

  const copySummary = async () => {
    try {
      await navigator.clipboard.writeText(makeSummary(inputs, calculation, strategy))
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }

  return (
    <section className="strategy-view" aria-labelledby="strategy-title">
      <div className="strategy-hero">
        <div>
          <p className="step-kicker">Your document-only strategy</p>
          <h1 id="strategy-title">{strategy.headline}<span className="red-dot">.</span></h1>
          <p className="strategy-summary">{strategy.summary}</p>
        </div>
        <div className="method-stamp">
          <span>No model call</span>
          <strong>{strategy.sourceCoverage}</strong>
          <small>source cards used</small>
        </div>
      </div>

      <div className="strategy-metrics" aria-label="Selected strategy metrics">
        <div>
          <span>Required buyers</span>
          <strong>{selected.buyersRequired.toLocaleString()}</strong>
        </div>
        <div>
          <span>Required registrations</span>
          <strong>{selected.registrationsRequired.toLocaleString()}</strong>
        </div>
        <div>
          <span>Live at target</span>
          <strong>{selected.attendeesExpected.toLocaleString()}</strong>
        </div>
        <div>
          <span>Live from current reach</span>
          <strong>{selected.projectedAttendeesExpected.toLocaleString()}</strong>
        </div>
      </div>

      <div className="strategy-grid">
        <section className="strategy-section">
          <div className="section-number">01</div>
          <div>
            <p className="section-label">Recommended launch shape</p>
            {strategy.recommendations.map((recommendation) => (
              <article
                className={`recommendation recommendation--${recommendation.tone}`}
                key={recommendation.id}
              >
                <h2>{recommendation.title}</h2>
                <p>{recommendation.body}</p>
                <div className="source-list">
                  {recommendation.sourceIds.map((sourceId) => (
                    <SourceChip sourceId={sourceId} key={sourceId} />
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="strategy-section strategy-section--grey">
          <div className="section-number">02</div>
          <div>
            <p className="section-label">Your next moves</p>
            {strategy.nextMoves.map((move) => (
              <article className={`recommendation recommendation--${move.tone}`} key={move.id}>
                <h2>{move.title}</h2>
                <p>{move.body}</p>
                <div className="source-list">
                  {move.sourceIds.map((sourceId) => (
                    <SourceChip sourceId={sourceId} key={sourceId} />
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="strategy-section strategy-section--dark">
          <div className="section-number">03</div>
          <div>
            <p className="section-label">Decisions for a coach</p>
            <ul className="coach-list">
              {strategy.coachDecisions.map((decision) => (
                <li key={decision}>{decision}</li>
              ))}
            </ul>
            <p className="abstention">
              Anything beyond the outline and Sigrun’s recorded feedback stays with a coach.
            </p>
          </div>
        </section>
      </div>

      <details className="formula-details">
        <summary>Show the calculation trace</summary>
        <div className="trace-grid">
          {selected.trace.map((trace) => (
            <div key={trace.id}>
              <span>{trace.id}</span>
              <strong>{trace.label}</strong>
              <code>{trace.expression}</code>
            </div>
          ))}
        </div>
      </details>

      <div className="strategy-actions">
        <button className="button button--primary" type="button" onClick={onEdit}>
          Change my answers <span aria-hidden="true">→</span>
        </button>
        <button className="button button--secondary" type="button" onClick={copySummary}>
          {copied ? 'Copied' : 'Copy summary'} <span aria-hidden="true">↗</span>
        </button>
        <button className="text-button" type="button" onClick={onReset}>
          Start over
        </button>
      </div>
    </section>
  )
}
