import { useState } from 'react'
import {
  currencyMinorUnitDigits,
  currencyMinorUnitScale,
  currencyPrefix,
  isSupportedCurrencyCode,
  moneyFormatter,
  normalizeCurrencyCode,
  type CurrencyCode,
} from '../domain/currency'
import {
  offerEconomicsLimits,
  type OfferEconomicsDraft,
  type OfferEconomicsField,
  type OfferEconomicsResult,
} from '../domain/offerEconomics'

const fieldDetails: Record<
  OfferEconomicsField,
  { complete: string; beginner: string; placeholder: string; prefix: boolean }
> = {
  price: {
    complete: 'Price per buyer',
    beginner: 'Price per client',
    placeholder: 'Enter price',
    prefix: true,
  },
  spotsToSell: {
    complete: 'Spots to sell',
    beginner: 'Client spots',
    placeholder: 'Enter clients',
    prefix: false,
  },
  revenueGoal: {
    complete: 'Revenue goal',
    beginner: 'Planned sales revenue',
    placeholder: 'Enter revenue',
    prefix: true,
  },
}

type EconomicsNumberFieldProps = {
  calculated: boolean
  calculationReady: boolean
  error?: string
  field: OfferEconomicsField
  id: string
  label: string
  prefix?: string
  moneyMinimum: number
  moneyStep: number
  showError: boolean
  value: string
  recalculatedLabel?: string
  onBlur: () => void
  onChange: (value: string) => void
}

function EconomicsNumberField({
  calculated,
  calculationReady,
  error,
  field,
  id,
  label,
  prefix,
  moneyMinimum,
  moneyStep,
  showError,
  value,
  recalculatedLabel,
  onBlur,
  onChange,
}: EconomicsNumberFieldProps) {
  const hintId = `${id}-hint`
  const errorId = `${id}-error`
  const isMoney = field !== 'spotsToSell'

  return (
    <div className={`field economics-field ${calculated ? 'economics-field--calculated' : ''}`}>
      <label className="economics-label" htmlFor={id}>
        <span>{label}</span>
        {calculated ? <em>{calculationReady ? 'Auto-calculated' : 'Waiting'}</em> : null}
      </label>
      <p className="field-hint" id={hintId}>
        {calculated
          ? calculationReady
            ? `Updates from the other two values. Edit this to recalculate ${recalculatedLabel}.`
            : error
              ? 'Enter a valid value here to make it one of your inputs.'
              : 'Waiting for valid values in the other two fields.'
          : field === 'spotsToSell'
          ? 'Number of clients; a sales target, not a delivery limit.'
          : field === 'price'
            ? 'The full offer price for one sale.'
            : 'Gross sales before tax, fees, refunds or payment timing.'}
      </p>
      <div className="number-control">
        {prefix ? <span aria-hidden="true">{prefix}</span> : null}
        <input
          id={id}
          type="number"
          inputMode={isMoney ? 'decimal' : 'numeric'}
          min={isMoney ? moneyMinimum : 1}
          max={offerEconomicsLimits[field]}
          step={isMoney ? moneyStep : 1}
          placeholder={calculated ? 'Waiting for two valid values' : fieldDetails[field].placeholder}
          value={value}
          aria-invalid={showError && Boolean(error) ? true : undefined}
          aria-describedby={`${hintId}${showError && error ? ` ${errorId}` : ''}`}
          onBlur={onBlur}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
      {showError && error ? (
        <p className="field-error" id={errorId}>
          {error}
        </p>
      ) : null}
    </div>
  )
}

type OfferEconomicsFieldsProps = {
  calculatedField: OfferEconomicsField | null
  currency?: string
  draft: OfferEconomicsDraft
  idPrefix: string
  result: OfferEconomicsResult | null
  showErrors?: boolean
  sourceOrder: OfferEconomicsField[]
  variant: 'beginner' | 'complete'
  onChange: (field: OfferEconomicsField, value: string) => void
}

export function OfferEconomicsFields({
  calculatedField,
  currency,
  draft,
  idPrefix,
  result,
  showErrors = false,
  sourceOrder,
  variant,
  onChange,
}: OfferEconomicsFieldsProps) {
  const normalizedCurrency = normalizeCurrencyCode(currency ?? '')
  const activeCurrency: CurrencyCode = isSupportedCurrencyCode(normalizedCurrency)
    ? normalizedCurrency
    : 'EUR'
  const minorUnitDigits = currencyMinorUnitDigits(activeCurrency)
  const minorUnitScale = currencyMinorUnitScale(activeCurrency)
  const moneyStep = 1 / minorUnitScale
  const money = moneyFormatter(currency)
  const symbol = currencyPrefix(currency)
  const exact = result?.success ? result.exact : null
  const [valueAnnouncement, setValueAnnouncement] = useState('')
  const calculatedLabel = calculatedField
    ? fieldDetails[calculatedField][variant]
    : null
  const recalculatedLabel = sourceOrder.length === 2
    ? fieldDetails[sourceOrder[0]][variant]
    : undefined

  const announceCalculatedValue = () => {
    if (!calculatedField || !result?.success) return

    const value = calculatedField === 'spotsToSell'
      ? result.values.spotsToSell
      : money.format(result.numbers[calculatedField])
    setValueAnnouncement(`${fieldDetails[calculatedField][variant]} updated to ${value}.`)
  }

  return (
    <fieldset
      className="economics-builder"
      aria-describedby={`${idPrefix}-instructions`}
    >
      <legend>Offer calculation</legend>
      <div className="economics-intro" id={`${idPrefix}-instructions`}>
        <strong>Edit any two values.</strong>
        <span>
          We’ll update the third automatically. Edit the result to make it one of your inputs.
        </span>
      </div>

      <div className="form-grid economics-grid">
        {(['price', 'spotsToSell', 'revenueGoal'] as const).map((field) => (
          <EconomicsNumberField
            calculated={calculatedField === field}
            calculationReady={Boolean(result?.success)}
            error={result?.errors[field]}
            field={field}
            id={`${idPrefix}-${field}`}
            key={field}
            label={fieldDetails[field][variant]}
            prefix={fieldDetails[field].prefix ? symbol : undefined}
            moneyMinimum={moneyStep}
            moneyStep={moneyStep}
            showError={showErrors}
            value={draft[field]}
            recalculatedLabel={recalculatedLabel}
            onBlur={announceCalculatedValue}
            onChange={(value) => onChange(field, value)}
          />
        ))}
      </div>

      {exact ? (
        <div className="economics-summary">
          <strong>
            {exact.spotsToSell.toString()} {exact.spotsToSell === 1n ? 'client' : 'clients'} at{' '}
            {money.format(Number(exact.priceMinorUnits) / minorUnitScale)} produce{' '}
            {money.format(Number(exact.impliedRevenueMinorUnits) / minorUnitScale)}.
          </strong>
          <span>
            {calculatedField === 'price' && exact.overGoalMinorUnits > 0n
              ? ` Price is rounded up to ${activeCurrency}'s smallest currency unit${minorUnitDigits === 0 ? '' : ` (${minorUnitDigits} decimal places)`}, putting the plan ${money.format(Number(exact.overGoalMinorUnits) / minorUnitScale)} above the goal.`
              : exact.overGoalMinorUnits > 0n
                ? ` That is ${money.format(Number(exact.overGoalMinorUnits) / minorUnitScale)} above the entered goal because client spots are whole numbers.`
                : ' The values match exactly.'}
          </span>
        </div>
      ) : null}

      <p className="economics-footnote">
        Changing currency does not convert your values. Calculated amounts follow that currency’s
        smallest unit.
      </p>
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {calculatedLabel
          ? result?.success
            ? `${calculatedLabel} is now calculated automatically from the other two values.`
            : `${calculatedLabel} is waiting for valid values.`
          : 'Enter any two values and the third will be calculated automatically.'}
      </p>
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {valueAnnouncement}
      </p>
    </fieldset>
  )
}
