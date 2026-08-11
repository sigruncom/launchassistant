import type { LaunchCalculation } from './calculator'
import type { LaunchInputs } from './schema'
import type { KnowledgeCardId } from '../knowledge/cards'

export type RecommendationTone = 'primary' | 'caution' | 'coach-review'

export type Recommendation = {
  id: string
  title: string
  body: string
  sourceIds: KnowledgeCardId[]
  tone: RecommendationTone
}

export type StrategyPlan = {
  headline: string
  summary: string
  workshopFormat: 'One-day workshop' | 'Three-day workshop'
  recommendedOffer: 'One-to-one coaching' | 'Group coaching' | 'Group coaching or online course'
  recommendations: Recommendation[]
  nextMoves: Recommendation[]
  coachDecisions: string[]
  sourceCoverage: number
}

const projectedOffer = (registrations: number): StrategyPlan['recommendedOffer'] => {
  if (registrations < 200) return 'One-to-one coaching'
  if (registrations <= 500) return 'Group coaching'
  return 'Group coaching or online course'
}

export const composeStrategy = (
  inputs: LaunchInputs,
  calculation: LaunchCalculation,
): StrategyPlan => {
  const selected = calculation.selected
  const workshopFormat = inputs.workshopDurationDays === 1
    ? 'One-day workshop'
    : 'Three-day workshop'
  const recommendedOffer = projectedOffer(selected.projectedRegistrations)
  const audienceDescription =
    inputs.audienceContext === 'b2b'
      ? 'a time-constrained B2B audience'
      : inputs.audienceContext === 'hobby'
        ? 'a hobby audience'
        : 'this audience'
  const attendanceSignals = [
    inputs.replayOffered ? 'a replay is planned' : 'no replay is planned',
    inputs.showUpBonusPlanned ? 'a show-up bonus is planned' : 'no show-up bonus is planned',
  ].join(' and ')
  const recommendations: Recommendation[] = [
    {
      id: 'REC-WORKSHOP',
      title: workshopFormat,
      body:
        workshopFormat === 'One-day workshop'
          ? `You chose one day for ${audienceDescription}. This can fit B2B audiences with less time and lower-priced hobby audiences.`
          : `You chose three days for ${audienceDescription}. This gives more time to build trust and can suit offers above €1,000.`,
      sourceIds: ['SIGRUN-WORKSHOP-2026-08-09', 'LS-GAP-001'],
      tone: 'primary',
    },
    {
      id: 'REC-ATTENDANCE',
      title: `${inputs.showUpRatePercent}% live show-up case`,
      body: `At this rate, the target implies ${selected.attendeesExpected.toLocaleString()} live attendees. Typical cases are 10%, 20% and 30%; ${attendanceSignals}.`,
      sourceIds: ['LS-ATTENDANCE-001', 'SIGRUN-ATTENDANCE-2026-08-09'],
      tone: 'primary',
    },
    {
      id: 'REC-OFFER',
      title: recommendedOffer,
      body: `Your current organic reach and ad budget support about ${selected.projectedRegistrations.toLocaleString()} registrations in this scenario. The playbook maps that band to ${recommendedOffer.toLowerCase()}.`,
      sourceIds: ['LS-OFFER-FIT-001'],
      tone: 'primary',
    },
  ]

  const nextMoves: Recommendation[] = []
  const coachDecisions: string[] = [
    'Confirm whether the 1–3% sales conversion applies to all workshop registrations or only live attendees.',
  ]

  if (
    inputs.workshopDurationDays === 1 &&
    inputs.currency === 'EUR' &&
    inputs.price > 1_000
  ) {
    coachDecisions.push(
      'You selected one day for an offer above €1,000; Sigrun identified three days as the stronger signal at this price.',
    )
  }

  if (
    inputs.workshopDurationDays === 3 &&
    inputs.audienceContext === 'b2b'
  ) {
    coachDecisions.push(
      'You selected three days for an audience where Sigrun said one day can be a better fit; confirm the choice with a coach.',
    )
  }

  if (inputs.showUpRatePercent > 30 && inputs.replayOffered) {
    coachDecisions.push(
      'The selected show-up rate is above the typical 10–30% cases while a replay is planned; confirm it from historical evidence.',
    )
  }

  if (!inputs.recentResearch && inputs.surveyResponses < 10) {
    nextMoves.push({
      id: 'MOVE-RESEARCH-BLOCK',
      title: 'Validate the audience before planning promotion',
      body: `You have ${inputs.surveyResponses} survey responses. Reach the minimum of 10 before treating the strategy as ready.`,
      sourceIds: ['LS-RESEARCH-001'],
      tone: 'caution',
    })
  } else if (!inputs.recentResearch && inputs.surveyResponses < 100) {
    nextMoves.push({
      id: 'MOVE-RESEARCH',
      title: 'Keep building audience evidence',
      body: `The minimum evidence threshold is met with ${inputs.surveyResponses} responses; the document’s research goal is 100.`,
      sourceIds: ['LS-RESEARCH-001'],
      tone: 'primary',
    })
  }

  if (inputs.adBudget > 0 && inputs.organicRegistrations === 0) {
    nextMoves.push({
      id: 'MOVE-ADS-BLOCK',
      title: 'Do not start paid ads yet',
      body: 'Invite your existing audience and prove that the workshop attracts organic registrations before spending the ad budget.',
      sourceIds: ['LS-ADS-001'],
      tone: 'caution',
    })
  } else {
    nextMoves.push({
      id: 'MOVE-PROMOTION',
      title: 'Run the organic-first promotion sequence',
      body: 'Invite the existing audience first, then use the five-email cadence as the working schedule for the prototype.',
      sourceIds: ['LS-ADS-001', 'LS-PROMOTION-001'],
      tone: 'primary',
    })
  }

  if (inputs.currency === 'EUR' && inputs.price < 297 && selected.projectedRegistrations <= 500) {
    recommendations.push({
      id: 'REC-ECONOMICS',
      title: 'The workshop economics need review',
      body: 'The offer is below the current €297 guideline and the projected registrations do not exceed 500.',
      sourceIds: ['LS-PRICE-001'],
      tone: 'caution',
    })
  } else if (inputs.currency === 'EUR' && inputs.price === 297) {
    coachDecisions.push('The source does not define how to treat an offer priced at exactly €297.')
  } else if (inputs.currency !== 'EUR') {
    coachDecisions.push(
      'The source gives the workshop-economics threshold only in euros; no conversion rule is defined for this currency.',
    )
  }

  const euroPriceNeedsDiscoveryCall = inputs.currency === 'EUR' && inputs.price > 1_000

  if (inputs.offerType === 'one-to-one' || euroPriceNeedsDiscoveryCall) {
    recommendations.push({
      id: 'REC-CTA',
      title: 'Use a discovery-call CTA',
      body:
        euroPriceNeedsDiscoveryCall
          ? 'Personally invite engaged leads to a call before asking them to purchase this higher-priced offer.'
          : 'Send prospects to a calendar rather than directly to checkout for a one-to-one offer.',
      sourceIds: ['LS-CTA-001'],
      tone: 'primary',
    })
  } else if (inputs.currency !== 'EUR' && inputs.price > 1_000) {
    coachDecisions.push(
      'The source defines the discovery-call price threshold only in euros; no conversion rule is defined for this currency.',
    )
  }

  if (inputs.offerType === 'group' && selected.projectedBuyers < 6) {
    coachDecisions.push('Projected buyers are below the six-person minimum stated for a group program.')
  }

  if (inputs.offerType === 'course' && selected.projectedBuyers < 20) {
    coachDecisions.push('Projected buyers are below the 20-person minimum stated for an online course.')
  }

  if (selected.registrationGapAfterBudget > 0) {
    coachDecisions.push(
      `The current reach and ad budget leave a gap of ${selected.registrationGapAfterBudget.toLocaleString()} registrations in the selected scenario.`,
    )
  }

  if (!inputs.facebookGroupFit && workshopFormat === 'Three-day workshop') {
    coachDecisions.push(
      'The source generally recommends a Facebook group for a three-day workshop, but you marked it as a poor audience fit.',
    )
  }

  const citedCards = new Set(
    [...recommendations, ...nextMoves].flatMap((recommendation) => recommendation.sourceIds),
  )

  return {
    headline: `${workshopFormat} leading into ${recommendedOffer.toLowerCase()}`,
    summary: `At ${selected.conversionRatePercent}% conversion, the revenue goal requires ${selected.buyersRequired.toLocaleString()} buyers and ${selected.registrationsRequired.toLocaleString()} workshop registrations.`,
    workshopFormat,
    recommendedOffer,
    recommendations,
    nextMoves,
    coachDecisions,
    sourceCoverage: citedCards.size,
  }
}
