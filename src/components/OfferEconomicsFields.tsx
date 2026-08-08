import type { LaunchInputs } from '../domain/schema'
import {
  offerEconomicsLimits,
  type OfferEconomicsDraft,
  type OfferEconomicsField,
  type OfferEconomicsResult,
} from '../domain/offerEconomics'
import { ChoiceGroup } from './Fields'

const currencySymbol: Record<LaunchInputs['currency'], string> = {
  EUR: '€',
  USD: '$',
  GBP: '£',
}

const moneyFormatter = (currency: LaunchInputs['currency']) =>
  new Intl.NumberFormat('en', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })

const fieldDetails: Record<
  OfferEconomicsField,
  { complete: string; beginner: string; placeholder: string; prefix: boolean }
> = {
  price: {
    complete: 'Price per buyer',
    beginner: 'Price per client',
    placeholder: '997',
    prefix: true,
  },
  spotsToSell: {
    complete: 'Spots to sell',
    beginner: 'Client spots',
    placeholder: '13',
    prefix: false,
  },
  revenueGoal: {
    complete: 'Revenue goal',
    beginner: 'Planned sales revenue',
    placeholder: '12000',
    prefix: true,
  },
}

type EconomicsNumberFieldProps = {
  calculated: boolean
  error?: string
  field: OfferEconomicsField
  id: string
  label: string
  prefix?: string
  showError: boolean
  value: string
  onChange: (value: string) => void
}

function EconomicsNumberField({
  calculated,
  error,
  field,
  id,
  label,
  prefix,
  showError,
  value,
  onChange,
}: EconomicsNumberFieldProps) {
  const hintId = `${id}-hint`
  const errorId = `${id}-error`
  const isMoney = field !== 'spotsToSell'

  return (
    <div className={`field economics-field ${calculated ? 'economics-field--calculated' : ''}`}>
      <label className="economics-label" htmlFor={id}>
        <span>{label}</span>
        {calculated ? <em>Calculated</em> : null}
      </label>
      <p className="field-hint" id={hintId}>
        {calculated ? 'Calculated from the other two values.' : field === 'spotsToSell'
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
          min={isMoney ? 0.01 : 1}
          max={offerEconomicsLimits[field]}
          step={isMoney ? 0.01 : 1}
          placeholder={calculated ? 'Calculated' : fieldDetails[field].placeholder}
          value={value}
          readOnly={calculated}
          aria-invalid={showError && Boolean(error) ? true : undefined}
          aria-describedby={`${hintId}${showError && error ? ` ${errorId}` : ''}`}
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
  calculatedField: OfferEconomicsField
  currency: LaunchInputs['currency']
  draft: OfferEconomicsDraft
  idPrefix: string
  result: OfferEconomicsResult
  showErrors?: boolean
  variant: 'beginner' | 'complete'
  onCalculatedFieldChange: (field: OfferEconomicsField) => void
  onChange: (field: OfferEconomicsField, value: string) => void
}

export function OfferEconomicsFields({
  calculatedField,
  currency,
  draft,
  idPrefix,
  result,
  showErrors = false,
  variant,
  onCalculatedFieldChange,
  onChange,
}: OfferEconomicsFieldsProps) {
  const money = moneyFormatter(currency)
  const symbol = currencySymbol[currency]
  const exact = result.success ? result.exact : null

  return (
    <section className="economics-builder" aria-label="Offer goal calculator">
      <ChoiceGroup<OfferEconomicsField>
        legend="Which value should we calculate?"
        name={`${idPrefix}-calculated-field`}
        value={calculatedField}
        onChange={onCalculatedFieldChange}
        columns={3}
        hint="Choose one value to calculate, then enter the other two."
        choices={[
          {
            value: 'spotsToSell',
            label: variant === 'beginner' ? 'Clients needed' : 'Spots to sell',
            detail: 'Price + revenue goal',
          },
          { value: 'revenueGoal', label: 'Revenue goal', detail: 'Price × clients' },
          { value: 'price', label: 'Price', detail: 'Goal ÷ clients, rounded up' },
        ]}
      />

      <div className="form-grid economics-grid">
        {(['price', 'spotsToSell', 'revenueGoal'] as const).map((field) => (
          <EconomicsNumberField
            calculated={calculatedField === field}
            error={result.errors[field]}
            field={field}
            id={`${idPrefix}-${field}`}
            key={field}
            label={fieldDetails[field][variant]}
            prefix={fieldDetails[field].prefix ? symbol : undefined}
            showError={showErrors}
            value={draft[field]}
            onChange={(value) => onChange(field, value)}
          />
        ))}
      </div>

      {exact ? (
        <div className="economics-summary">
          <strong>
            {exact.spotsToSell.toString()} {exact.spotsToSell === 1n ? 'client' : 'clients'} at{' '}
            {money.format(Number(exact.priceCents) / 100)} produce{' '}
            {money.format(Number(exact.impliedRevenueCents) / 100)}.
          </strong>
          <span>
            {calculatedField === 'price' && exact.overGoalCents > 0n
              ? ` Price is rounded up to the nearest cent, putting the plan ${money.format(Number(exact.overGoalCents) / 100)} above the goal.`
              : exact.overGoalCents > 0n
                ? ` That is ${money.format(Number(exact.overGoalCents) / 100)} above the entered goal because client spots are whole numbers.`
                : ' The values match exactly.'}
          </span>
        </div>
      ) : null}

      <p className="economics-footnote">
        Currency changes the label only; this prototype does not convert exchange rates.
      </p>
    </section>
  )
}
