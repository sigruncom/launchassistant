export const SOURCE_TITLE = 'Launch & Sell Program Outline — July 2025'
export const SOURCE_PAGE_COUNT = 37

export type KnowledgeCard = {
  id: string
  title: string
  guidance: string
  pages: number[]
  kind: 'benchmark' | 'decision' | 'timeline' | 'guardrail'
}

export const knowledgeCards = [
  {
    id: 'LS-RESEARCH-001',
    title: 'Validate the ideal client',
    guidance:
      'If the audience is new, research is required. Ten survey responses is the minimum and 100 is the goal.',
    pages: [5, 6, 9, 10],
    kind: 'guardrail',
  },
  {
    id: 'LS-WORKSHOP-001',
    title: 'Choose the workshop format',
    guidance:
      'Use a one-day workshop only for an experienced launcher with a warm, highly problem-aware audience. Default to three days otherwise.',
    pages: [12, 13],
    kind: 'decision',
  },
  {
    id: 'LS-GAP-001',
    title: 'Create a clear gap',
    guidance:
      'The free workshop should create progress while preserving a clear gap that the paid offer solves.',
    pages: [14],
    kind: 'guardrail',
  },
  {
    id: 'LS-FUNNEL-001',
    title: 'Plan with a 1–3% sales range',
    guidance:
      'Three percent is the stated average workshop-signup-to-sale conversion, while one or two percent is explicitly possible.',
    pages: [19, 22, 24],
    kind: 'benchmark',
  },
  {
    id: 'LS-ATTENDANCE-001',
    title: 'Plan for attendance and group joining',
    guidance:
      'The outline expects roughly 20–30% of registrants to attend live and gives 60% as the general Facebook-group join example.',
    pages: [19, 22],
    kind: 'benchmark',
  },
  {
    id: 'LS-OFFER-FIT-001',
    title: 'Match the offer to expected registrations',
    guidance:
      'Below 200 registrations, use one-to-one; from 200 to 500, use group coaching; above 500, consider group coaching or a course.',
    pages: [21],
    kind: 'decision',
  },
  {
    id: 'LS-PRICE-001',
    title: 'Check workshop economics',
    guidance:
      'A free workshop is generally not recommended for an offer below €297 unless the audience is large and more than 500 registrations are expected.',
    pages: [21],
    kind: 'guardrail',
  },
  {
    id: 'LS-ADS-001',
    title: 'Prove organic demand before ads',
    guidance:
      'Invite the existing audience first. Use ads only after organic registrations appear, start cautiously, and treat €500 as a first-test example.',
    pages: [18, 19, 24],
    kind: 'guardrail',
  },
  {
    id: 'LS-FAB-001',
    title: 'Keep the fast-action bonus short',
    guidance:
      'A fast-action bonus lasts one to 24 hours; the outline recommends 24 hours and never longer.',
    pages: [22, 31],
    kind: 'timeline',
  },
  {
    id: 'LS-CTA-001',
    title: 'Use discovery calls for high-touch offers',
    guidance:
      'One-to-one offers use a calendar CTA. For offers above €1,000, invite hot leads to a discovery call.',
    pages: [26, 31, 32],
    kind: 'decision',
  },
  {
    id: 'LS-PROMOTION-001',
    title: 'Use the later five-email promotion cadence',
    guidance:
      'The later schedule lists invite emails 30, 15, 10, five and one day before the workshop.',
    pages: [24],
    kind: 'timeline',
  },
] as const satisfies readonly KnowledgeCard[]

export type KnowledgeCardId = (typeof knowledgeCards)[number]['id']

export const knowledgeById = Object.fromEntries(
  knowledgeCards.map((card) => [card.id, card]),
) as Record<KnowledgeCardId, (typeof knowledgeCards)[number]>

export const sourceLabel = (card: KnowledgeCard) => {
  const pageLabel = card.pages.length === 1 ? `p. ${card.pages[0]}` : `pp. ${card.pages.join(', ')}`
  return `Launch & Sell · ${pageLabel}`
}
