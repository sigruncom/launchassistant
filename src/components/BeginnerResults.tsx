import { useState } from 'react'
import type { LaunchCalculation } from '../domain/calculator'
import type { LaunchInputs } from '../domain/schema'
import type { Recommendation, StrategyPlan } from '../domain/strategy'
import { appVariantHref } from '../variants/appVariant'
import { SourceChip } from './SourceChip'

type BeginnerResultsProps = {
  inputs: LaunchInputs
  calculation: LaunchCalculation
  strategy: StrategyPlan
  onEdit: () => void
  onReset: () => void
}

type BeginnerMove = Pick<Recommendation, 'id' | 'title' | 'body' | 'sourceIds'>

const formatter = (currency: LaunchInputs['currency']) =>
  new Intl.NumberFormat('en', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })

const makeBeginnerMoves = (strategy: StrategyPlan): BeginnerMove[] => {
  const moves: BeginnerMove[] = []
  const researchMove = strategy.nextMoves.find((move) => move.id.startsWith('MOVE-RESEARCH'))
  const workshopRecommendation = strategy.recommendations.find(
    (recommendation) => recommendation.id === 'REC-WORKSHOP',
  )
  const promotionMove = strategy.nextMoves.find((move) => move.id === 'MOVE-PROMOTION')

  if (researchMove) {
    moves.push({
      id: 'BEGINNER-RESEARCH',
      title: 'Confirm the audience evidence',
      body: 'Use recent client interviews or at least 10 relevant survey responses before treating this plan as ready.',
      sourceIds: researchMove.sourceIds,
    })
  }

  if (workshopRecommendation) {
    moves.push({
      id: 'BEGINNER-WORKSHOP',
      title: `Plan the ${strategy.workshopFormat.toLowerCase()}`,
      body: workshopRecommendation.body,
      sourceIds: workshopRecommendation.sourceIds,
    })
  }

  if (promotionMove) {
    moves.push({
      id: 'BEGINNER-PROMOTION',
      title: 'Invite your existing audience first',
      body: 'Start organically. Consider paid promotion only after the workshop attracts organic registrations.',
      sourceIds: promotionMove.sourceIds,
    })
  }

  return moves.slice(0, 3)
}

export function BeginnerResults({
  inputs,
  calculation,
  strategy,
  onEdit,
  onReset,
}: BeginnerResultsProps) {
  const [copied, setCopied] = useState(false)
  const selected = calculation.selected
  const money = formatter(inputs.currency)
  const beginnerMoves = makeBeginnerMoves(strategy)
  const registrationGap = selected.paidRegistrationGap

  const copyPlan = async () => {
    const summary = [
      `Starting recommendation: ${strategy.headline}`,
      `Revenue goal: ${money.format(inputs.revenueGoal)}`,
      `Required buyers: ${selected.buyersRequired}`,
      `Required registrations: ${selected.registrationsRequired}`,
      `Live attendees at target: ${selected.attendeesExpected}`,
      `Expected organic registrations: ${inputs.organicRegistrations}`,
      `Registration gap: ${registrationGap}`,
      '',
      'Next moves:',
      ...beginnerMoves.map((move) => `- ${move.title}: ${move.body}`),
      '',
      'Working assumptions: 2% conversion, 30% live attendance, 60% group joining, organic-only planning.',
    ].join('\n')

    try {
      await navigator.clipboard.writeText(summary)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }

  return (
    <section className="beginner-results" aria-labelledby="beginner-plan-title">
      <div className="beginner-results__hero">
        <p className="step-kicker">Your starting plan</p>
        <h1 id="beginner-plan-title">
          Start with a {strategy.workshopFormat.toLowerCase()}
          <span className="red-dot">.</span>
        </h1>
        <p>
          Using the current organic registration estimate, the playbook points toward{' '}
          <strong>{strategy.recommendedOffer.toLowerCase()}</strong>.
        </p>
      </div>

      <div className="beginner-target" aria-label="Your beginner launch target">
        <div className="beginner-target__statement">
          <p className="section-label">Your target</p>
          <h2>{selected.buyersRequired.toLocaleString()} buyers</h2>
          <p>
            To reach {money.format(inputs.revenueGoal)} at {money.format(inputs.price)} per buyer,
            use {selected.conversionRatePercent}% as the working planning case.
          </p>
        </div>
        <div className="beginner-target__metrics">
          <div>
            <span>Workshop registrations</span>
            <strong>{selected.registrationsRequired.toLocaleString()}</strong>
          </div>
          <div>
            <span>Live attendees at target</span>
            <strong>{selected.attendeesExpected.toLocaleString()}</strong>
          </div>
        </div>
      </div>

      <section className="beginner-gap">
        <p className="section-label">Your starting point</p>
        {registrationGap > 0 ? (
          <>
            <h2>There is a reach gap to solve.</h2>
            <p>
              You expect {inputs.organicRegistrations.toLocaleString()} registrations without ads.
              This working case needs {selected.registrationsRequired.toLocaleString()}, leaving a
              gap of <strong>{registrationGap.toLocaleString()}</strong>.
            </p>
          </>
        ) : (
          <>
            <h2>Your organic estimate covers the target.</h2>
            <p>
              Your estimate of {inputs.organicRegistrations.toLocaleString()} organic registrations
              meets this working case. Treat it as a plan to validate, not a forecast.
            </p>
          </>
        )}
      </section>

      <section className="beginner-next">
        <p className="section-label">Your next moves</p>
        <div className="beginner-next__grid">
          {beginnerMoves.map((move, index) => (
            <article key={move.id}>
              <span>{String(index + 1).padStart(2, '0')}</span>
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

      <details className="beginner-assumptions">
        <summary>See the assumptions and sources</summary>
        <div>
          <p>
            This beginner plan fixes advanced settings at a 2% working conversion case, 30% live
            attendance and 60% group joining. It assumes organic-only promotion and a workshop
            community that fits the audience.
          </p>
          <div className="source-list">
            <SourceChip sourceId="LS-FUNNEL-001" />
            <SourceChip sourceId="LS-ATTENDANCE-001" />
            <SourceChip sourceId="LS-ADS-001" />
          </div>
          <p>
            These are planning estimates. The linked legacy calculator is not in the source
            document, so Sigrun still needs to approve the reverse-funnel formula.
          </p>
        </div>
      </details>

      <div className="strategy-actions beginner-results__actions">
        <button className="button button--primary" type="button" onClick={onEdit}>
          Change my answers <span aria-hidden="true">→</span>
        </button>
        <button className="button button--secondary" type="button" onClick={copyPlan}>
          {copied ? 'Copied' : 'Copy plan'} <span aria-hidden="true">↗</span>
        </button>
        <a className="text-link" href={appVariantHref('complete')}>
          Open complete planner →
        </a>
        <button className="text-button" type="button" onClick={onReset}>
          Start over
        </button>
      </div>
    </section>
  )
}
