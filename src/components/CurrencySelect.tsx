import {
  additionalCurrencyOptions,
  commonCurrencyOptions,
  isSupportedCurrencyCode,
  MORE_CURRENCIES_VALUE,
  normalizeCurrencyCode,
  type CurrencyCode,
  type CurrencySelectValue,
} from '../domain/currency'

type CurrencySelectProps = {
  className?: string
  id: string
  value: string
  onChange: (value: CurrencySelectValue) => void
}

const commonCurrencyCodes = new Set<string>(
  commonCurrencyOptions.map((option) => option.code),
)
const additionalCurrencyCodes = new Set<string>(
  additionalCurrencyOptions.map((option) => option.code),
)

export type ResolvedCurrencySelectState = {
  primaryValue: '' | CurrencyCode | typeof MORE_CURRENCIES_VALUE
  secondaryValue: '' | CurrencyCode
  showAdditional: boolean
}

/**
 * Resolves controlled select values without ever treating the disclosure
 * sentinel as a currency. An external reset to an empty value always closes the
 * secondary select.
 */
export const resolveCurrencySelectState = (
  value: string,
): ResolvedCurrencySelectState => {
  if (value === MORE_CURRENCIES_VALUE) {
    return {
      primaryValue: MORE_CURRENCIES_VALUE,
      secondaryValue: '',
      showAdditional: true,
    }
  }

  const code = normalizeCurrencyCode(value)
  if (!isSupportedCurrencyCode(code)) {
    return {
      primaryValue: '',
      secondaryValue: '',
      showAdditional: false,
    }
  }

  if (additionalCurrencyCodes.has(code)) {
    return {
      primaryValue: MORE_CURRENCIES_VALUE,
      secondaryValue: code,
      showAdditional: true,
    }
  }

  return {
    primaryValue: commonCurrencyCodes.has(code) ? code : '',
    secondaryValue: '',
    showAdditional: false,
  }
}

export function CurrencySelect({
  className,
  id,
  value,
  onChange,
}: CurrencySelectProps) {
  const hintId = `${id}-hint`
  const moreId = `${id}-more`
  const state = resolveCurrencySelectState(value)

  return (
    <div className={`field ${className ?? ''}`.trim()}>
      <label htmlFor={id}>Currency</label>
      <p className="field-hint" id={hintId}>
        Amounts stay in the selected currency. No exchange-rate conversion is applied.
      </p>
      <select
        id={id}
        className="select-input"
        value={state.primaryValue}
        aria-describedby={hintId}
        onChange={(event) => {
          const nextValue = event.target.value

          if (nextValue === '' || nextValue === MORE_CURRENCIES_VALUE) {
            onChange(nextValue)
            return
          }

          if (isSupportedCurrencyCode(nextValue) && commonCurrencyCodes.has(nextValue)) {
            onChange(nextValue)
          }
        }}
      >
        <option value="">Choose currency</option>
        {commonCurrencyOptions.map((option) => (
          <option key={option.code} value={option.code}>
            {option.label}
          </option>
        ))}
        <option value={MORE_CURRENCIES_VALUE}>More currencies…</option>
      </select>

      {state.showAdditional ? (
        <div className="currency-more-field">
          <label htmlFor={moreId}>More currencies</label>
          <select
            id={moreId}
            className="select-input"
            value={state.secondaryValue}
            aria-describedby={hintId}
            onChange={(event) => {
              const nextValue = event.target.value

              if (!nextValue) {
                onChange(MORE_CURRENCIES_VALUE)
                return
              }

              if (isSupportedCurrencyCode(nextValue) && additionalCurrencyCodes.has(nextValue)) {
                onChange(nextValue)
              }
            }}
          >
            <option value="">Choose from the international list</option>
            {additionalCurrencyOptions.map((option) => (
              <option key={option.code} value={option.code}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      ) : null}
    </div>
  )
}
