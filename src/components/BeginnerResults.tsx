import { useState } from 'react'
import type { LaunchCalculation } from '../domain/calculator'
import type { EmailReachTrace } from '../domain/beginner'
import { moneyFormatter } from '../domain/currency'
import type { LaunchInputs } from '../domain/schema'
import type { StrategyPlan } from '../domain/strategy'

type BeginnerResultsProps = {
  inputs: LaunchInputs
  calculation: LaunchCalculation
  strategy: StrategyPlan
  emailReachTrace: EmailReachTrace
  onEdit: () => void
  onReset: () => void
}

type BeginnerMove = {
  id: string
  title: string
  body: string
}

const makeBeginnerMoves = (
  strategy: StrategyPlan,
  registrationGap: number,
): BeginnerMove[] => {
  const moves: BeginnerMove[] = []
  const workshopRecommendation = strategy.recommendations.find(
    (recommendation) => recommendation.id === 'REC-WORKSHOP',
  )
  const promotionMove = strategy.nextMoves.find((move) => move.id === 'MOVE-PROMOTION')

  if (workshopRecommendation) {
    moves.push({
      id: 'BEGINNER-WORKSHOP',
      title: `Plan the ${strategy.workshopFormat.toLowerCase()}`,
      body: workshopRecommendation.body,
    })
  }

  if (promotionMove) {
    moves.push({
      id: 'BEGINNER-PROMOTION',
      title: 'Invite your existing audience first',
      body:
        registrationGap > 0
          ? 'Email the people who already know you. That is the first way to find the registrations still missing from this list.'
          : 'Email the people who already know you before you look for a new audience.',
    })
  }

  return moves
}

export const createBeginnerPlanCopy = (
  inputs: LaunchInputs,
  calculation: LaunchCalculation,
  strategy: StrategyPlan,
  emailReachTrace: EmailReachTrace,
) => {
  const selected = calculation.selected
  const money = moneyFormatter(inputs.currency)
  const registrationGap = selected.paidRegistrationGap
  const beginnerMoves = makeBeginnerMoves(strategy, registrationGap)

  return [
    `Starting plan: ${strategy.headline}`,
    `Revenue goal: ${money.format(inputs.revenueGoal)}`,
    `Buyers needed: ${selected.buyersRequired}`,
    `Registrations needed: ${selected.registrationsRequired}`,
    `Live attendees at that target: ${selected.attendeesExpected}`,
    `Email list estimate: ${emailReachTrace.expression} = ${emailReachTrace.result} registrations`,
    registrationGap > 0
      ? `Registrations still missing from the current email list: ${registrationGap}`
      : 'The current email list covers the registrations this plan needs.',
    '',
    'Next moves:',
    ...beginnerMoves.map((move) => `- ${move.title}: ${move.body}`),
    '',
    `Assumptions: ${inputs.conversionRatePercent}% of signups buy, ${inputs.showUpRatePercent}% attend live, and the workshop is ${inputs.workshopDurationDays} ${inputs.workshopDurationDays === 1 ? 'day' : 'days'}.`,
  ].join('\n')
}

export function BeginnerResults({
  inputs,
  calculation,
  strategy,
  emailReachTrace,
  onEdit,
  onReset,
}: BeginnerResultsProps) {
  const [copied, setCopied] = useState(false)
  const selected = calculation.selected
  const money = moneyFormatter(inputs.currency)
  const registrationGap = selected.paidRegistrationGap
  const beginnerMoves = makeBeginnerMoves(strategy, registrationGap)
  const { emailListSize, signupRatePercent: organicSignupRatePercent } = emailReachTrace

  const copyPlan = async () => {
    try {
      await navigator.clipboard.writeText(
        createBeginnerPlanCopy(inputs, calculation, strategy, emailReachTrace),
      )
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
          From your email list, this plan points toward{' '}
          <strong>{strategy.recommendedOffer.toLowerCase()}</strong>.
        </p>
      </div>

      <div className="beginner-target" aria-label="Your launch target">
        <div className="beginner-target__statement">
          <p className="section-label">Your target</p>
          <h2>{selected.buyersRequired.toLocaleString()} buyers</h2>
          <p>
            To reach {money.format(inputs.revenueGoal)} at {money.format(inputs.price)} per buyer,
            plan on {selected.conversionRatePercent}% of workshop signups becoming buyers.
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
          <div>
            <span>Live from current reach</span>
            <strong>{selected.projectedAttendeesExpected.toLocaleString()}</strong>
          </div>
        </div>
      </div>

      <section className="beginner-gap">
        <p className="section-label">Your starting point</p>
        {registrationGap > 0 ? (
          <>
            <h2>There is a reach gap to solve.</h2>
            <p>
              A list of {emailListSize.toLocaleString()} at {organicSignupRatePercent}% gives about{' '}
              {inputs.organicRegistrations.toLocaleString()} registrations. This plan needs{' '}
              {selected.registrationsRequired.toLocaleString()}, so{' '}
              <strong>{registrationGap.toLocaleString()}</strong> registrations are still missing
              from this list.
            </p>
          </>
        ) : (
          <>
            <h2>Your organic estimate covers the target.</h2>
            <p>
              A list of {emailListSize.toLocaleString()} at {organicSignupRatePercent}% gives about{' '}
              {inputs.organicRegistrations.toLocaleString()} registrations. That covers the{' '}
              {selected.registrationsRequired.toLocaleString()} this plan needs. Treat it as a plan
              to check, not a forecast.
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
            </article>
          ))}
        </div>
      </section>

      <details className="beginner-assumptions">
        <summary>See the numbers behind this plan</summary>
        <div>
          <p>
            Your email list estimate uses {emailListSize.toLocaleString()} people and a{' '}
            {organicSignupRatePercent}% signup rate. This plan also uses{' '}
            {inputs.conversionRatePercent}% of signups buying, {inputs.showUpRatePercent}% showing
            up live, and a {inputs.workshopDurationDays}-day workshop.
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
        <button className="text-button" type="button" onClick={onReset}>
          Start over
        </button>
      </div>
    </section>
  )
}
