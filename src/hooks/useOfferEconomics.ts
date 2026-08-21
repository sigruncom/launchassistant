import { useMemo, useState } from 'react'
import {
  isSupportedCurrencyCode,
  normalizeCurrencyCode,
  type CurrencyCode,
} from '../domain/currency'
import {
  createOfferEconomicsEditor,
  editOfferEconomics,
  resolveOfferEconomicsEditor,
  type OfferEconomicsDraft,
  type OfferEconomicsField,
} from '../domain/offerEconomics'

const resolvedCurrency = (currency?: string): CurrencyCode => {
  const normalized = normalizeCurrencyCode(currency ?? '')
  return isSupportedCurrencyCode(normalized) ? normalized : 'EUR'
}

export const useOfferEconomics = (
  initialDraft: OfferEconomicsDraft,
  currency?: string,
) => {
  const [editor, setEditor] = useState(() => createOfferEconomicsEditor(initialDraft))
  const activeCurrency = resolvedCurrency(currency)

  const resolved = useMemo(
    () => resolveOfferEconomicsEditor(editor, activeCurrency),
    [activeCurrency, editor],
  )

  const update = (field: OfferEconomicsField, value: string) => {
    setEditor((current) => editOfferEconomics(current, field, value, activeCurrency))
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
