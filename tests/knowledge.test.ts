import { describe, expect, it } from 'vitest'
import { calculateLaunch } from '../src/domain/calculator'
import { demoInputs } from '../src/domain/schema'
import { composeStrategy } from '../src/domain/strategy'
import {
  knowledgeById,
  knowledgeCards,
  SOURCE_PAGE_COUNT,
} from '../src/knowledge/cards'

describe('knowledge provenance', () => {
  it('keeps every source page inside the verified 37-page PDF', () => {
    for (const card of knowledgeCards) {
      if (card.source.kind !== 'outline') continue
      expect(card.source.pages.length).toBeGreaterThan(0)
      for (const page of card.source.pages) {
        expect(page).toBeGreaterThanOrEqual(1)
        expect(page).toBeLessThanOrEqual(SOURCE_PAGE_COUNT)
      }
    }
  })

  it('keeps Sigrun feedback separate from PDF page citations', () => {
    const feedbackCards = knowledgeCards.filter(
      (card) => card.source.kind === 'method-owner-feedback',
    )

    expect(feedbackCards.map((card) => card.id)).toEqual([
      'SIGRUN-ATTENDANCE-2026-08-09',
      'SIGRUN-WORKSHOP-2026-08-09',
      'SIGRUN-FORMULAS-2026-08-09',
      'SIGRUN-REACH-2026-08-11',
    ])
  })

  it('ensures every displayed recommendation cites a real knowledge card', () => {
    const plan = composeStrategy(demoInputs, calculateLaunch(demoInputs))
    const recommendations = [...plan.recommendations, ...plan.nextMoves]

    for (const recommendation of recommendations) {
      expect(recommendation.sourceIds.length).toBeGreaterThan(0)
      for (const sourceId of recommendation.sourceIds) {
        expect(knowledgeById[sourceId]).toBeDefined()
      }
    }
  })

  it('uses stable, unique card identifiers', () => {
    const ids = knowledgeCards.map((card) => card.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
