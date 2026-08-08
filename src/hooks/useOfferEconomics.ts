import { useMemo, useState } from 'react'
import {
  createOfferEconomicsEditor,
  editOfferEconomics,
  resolveOfferEconomicsEditor,
  type OfferEconomicsDraft,
  type OfferEconomicsField,
} from '../domain/offerEconomics'

export const useOfferEconomics = (initialDraft: OfferEconomicsDraft) => {
  const [editor, setEditor] = useState(() => createOfferEconomicsEditor(initialDraft))

  const resolved = useMemo(() => resolveOfferEconomicsEditor(editor), [editor])

  const update = (field: OfferEconomicsField, value: string) => {
    setEditor((current) => editOfferEconomics(current, field, value))
  }

  const reset = (nextDraft: OfferEconomicsDraft) => {
    setEditor(createOfferEconomicsEditor(nextDraft))
  }

  return {
    calculatedField: resolved.calculatedField,
    draft: resolved.values,
    reset,
    result: resolved.result,
    sourceOrder: editor.sourceOrder,
    update,
  }
}
