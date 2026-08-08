import { useMemo, useState } from 'react'
import {
  calculateOfferEconomics,
  type OfferEconomicsDraft,
  type OfferEconomicsField,
} from '../domain/offerEconomics'

export const useOfferEconomics = (initialDraft: OfferEconomicsDraft) => {
  const [draft, setDraft] = useState<OfferEconomicsDraft>(() => ({ ...initialDraft }))
  const [calculatedField, setCalculatedField] =
    useState<OfferEconomicsField>('spotsToSell')

  const result = useMemo(
    () => calculateOfferEconomics(draft, calculatedField),
    [draft, calculatedField],
  )

  const update = (field: OfferEconomicsField, value: string) => {
    if (field === calculatedField) return
    setDraft((current) => ({ ...current, [field]: value }))
  }

  const calculateField = (field: OfferEconomicsField) => {
    if (field === calculatedField) return
    setDraft({ ...result.values })
    setCalculatedField(field)
  }

  const reset = (
    nextDraft: OfferEconomicsDraft,
    nextCalculatedField: OfferEconomicsField = 'spotsToSell',
  ) => {
    setDraft({ ...nextDraft })
    setCalculatedField(nextCalculatedField)
  }

  return {
    calculatedField,
    calculateField,
    draft: result.values,
    reset,
    result,
    update,
  }
}
