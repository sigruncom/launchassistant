import { knowledgeById, sourceLabel, type KnowledgeCardId } from '../knowledge/cards'

export function SourceChip({ sourceId }: { sourceId: KnowledgeCardId }) {
  const source = knowledgeById[sourceId]

  return (
    <span className="source-chip" title={source.guidance}>
      {sourceLabel(source)}
    </span>
  )
}
