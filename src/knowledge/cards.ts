export const SOURCE_TITLE = 'Launch & Sell Program Outline — July 2025'
export const SOURCE_PAGE_COUNT = 37

export type KnowledgeCard = {
  id: string
  title: string
  guidance: string
  source:
    | { kind: 'outline'; pages: number[] }
    | { kind: 'method-owner-feedback'; author: 'Sigrun'; date: string }
  kind: 'benchmark' | 'decision' | 'timeline' | 'guardrail'
}

export const knowledgeCards = [
  {
    id: 'LS-RESEARCH-001',
    title: 'Validate the ideal client',
    guidance:
      'If the audience is new, research is required. Ten survey responses is the minimum and 100 is the goal.',
    source: { kind: 'outline', pages: [5, 6, 9, 10] },
    kind: 'guardrail',
  },
  {
    id: 'LS-WORKSHOP-001',
    title: 'Choose the workshop format',
    guidance:
      'Use a one-day workshop only for an experienced launcher with a warm, highly problem-aware audience. Default to three days otherwise.',
    source: { kind: 'outline', pages: [12, 13] },
    kind: 'decision',
  },
  {
    id: 'LS-GAP-001',
    title: 'Create a clear gap',
    guidance:
      'The free workshop should create progress while preserving a clear gap that the paid offer solves.',
    source: { kind: 'outline', pages: [14] },
    kind: 'guardrail',
  },
  {
    id: 'LS-FUNNEL-001',
    title: 'Plan with a 1–3% sales range',
    guidance:
      'Three percent is the stated average workshop-signup-to-sale conversion, while one or two percent is explicitly possible.',
    source: { kind: 'outline', pages: [19, 22, 24] },
    kind: 'benchmark',
  },
  {
    id: 'LS-ATTENDANCE-001',
    title: 'Plan for attendance and group joining',
    guidance:
      'The outline expects roughly 20–30% of registrants to attend live and gives 60% as the general Facebook-group join example.',
    source: { kind: 'outline', pages: [19, 22] },
    kind: 'benchmark',
  },
  {
    id: 'LS-OFFER-FIT-001',
    title: 'Match the offer to expected registrations',
    guidance:
      'Below 200 registrations, use one-to-one; from 200 to 500, use group coaching; above 500, consider group coaching or a course.',
    source: { kind: 'outline', pages: [21] },
    kind: 'decision',
  },
  {
    id: 'LS-PRICE-001',
    title: 'Check workshop economics',
    guidance:
      'A free workshop is generally not recommended for an offer below €297 unless the audience is large and more than 500 registrations are expected.',
    source: { kind: 'outline', pages: [21] },
    kind: 'guardrail',
  },
  {
    id: 'LS-ADS-001',
    title: 'Prove organic demand before ads',
    guidance:
      'Invite the existing audience first. Use ads only after organic registrations appear, start cautiously, and treat €500 as a first-test example.',
    source: { kind: 'outline', pages: [18, 19, 24] },
    kind: 'guardrail',
  },
  {
    id: 'LS-FAB-001',
    title: 'Keep the fast-action bonus short',
    guidance:
      'A fast-action bonus lasts one to 24 hours; the outline recommends 24 hours and never longer.',
    source: { kind: 'outline', pages: [22, 31] },
    kind: 'timeline',
  },
  {
    id: 'LS-CTA-001',
    title: 'Use discovery calls for high-touch offers',
    guidance:
      'One-to-one offers use a calendar CTA. For offers above €1,000, invite hot leads to a discovery call.',
    source: { kind: 'outline', pages: [26, 31, 32] },
    kind: 'decision',
  },
  {
    id: 'LS-PROMOTION-001',
    title: 'Use the later five-email promotion cadence',
    guidance:
      'The later schedule lists invite emails 30, 15, 10, five and one day before the workshop.',
    source: { kind: 'outline', pages: [24] },
    kind: 'timeline',
  },
  {
    id: 'SIGRUN-ATTENDANCE-2026-08-09',
    title: 'Choose the live show-up rate',
    guidance:
      'Typical show-up cases are 10%, 20% and 30%, with 20% as the expected planning case. A warm audience without a replay has reached 70%. No replay and a strong show-up bonus can each lift attendance.',
    source: { kind: 'method-owner-feedback', author: 'Sigrun', date: '2026-08-09' },
    kind: 'benchmark',
  },
  {
    id: 'SIGRUN-WORKSHOP-2026-08-09',
    title: 'Let the participant choose one or three days',
    guidance:
      'One-day workshops can suit time-constrained B2B audiences and lower-priced hobby audiences. Three-day workshops can suit offers above €1,000.',
    source: { kind: 'method-owner-feedback', author: 'Sigrun', date: '2026-08-09' },
    kind: 'decision',
  },
  {
    id: 'SIGRUN-FORMULAS-2026-08-09',
    title: 'Reverse-funnel formulas approved for the prototype',
    guidance:
      'Sigrun confirmed that the prototype formulas are right. Whether the 1–3% sales rate applies to all registrations or only live attendees remains a separate clarification.',
    source: { kind: 'method-owner-feedback', author: 'Sigrun', date: '2026-08-09' },
    kind: 'guardrail',
  },
  {
    id: 'SIGRUN-REACH-2026-08-11',
    title: 'Estimate registrations from the email list',
    guidance:
      'Ask for email-list size and an expected organic signup percentage. Use 10% as the visible starting point, never allow more than 50%, and let the participant lower the rate for larger lists. A 50,000-person list producing 2,000 registrations is a 4% example.',
    source: { kind: 'method-owner-feedback', author: 'Sigrun', date: '2026-08-11' },
    kind: 'benchmark',
  },
] as const satisfies readonly KnowledgeCard[]

export type KnowledgeCardId = (typeof knowledgeCards)[number]['id']

export const knowledgeById = Object.fromEntries(
  knowledgeCards.map((card) => [card.id, card]),
) as Record<KnowledgeCardId, (typeof knowledgeCards)[number]>

export const sourceLabel = (card: KnowledgeCard) => {
  if (card.source.kind === 'method-owner-feedback') {
    return `${card.source.author} · feedback ${card.source.date}`
  }

  const { pages } = card.source
  const pageLabel = pages.length === 1 ? `p. ${pages[0]}` : `pp. ${pages.join(', ')}`
  return `Launch & Sell · ${pageLabel}`
}
