import type { ReactNode } from 'react'

type NumberFieldProps = {
  id: string
  label: string
  value: number
  onChange: (value: number) => void
  hint?: string
  prefix?: string
  suffix?: string
  min?: number
  max?: number
  step?: number
}

export function NumberField({
  id,
  label,
  value,
  onChange,
  hint,
  prefix,
  suffix,
  min = 0,
  max,
  step = 1,
}: NumberFieldProps) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {hint ? <p className="field-hint">{hint}</p> : null}
      <div className="number-control">
        {prefix ? <span aria-hidden="true">{prefix}</span> : null}
        <input
          id={id}
          type="number"
          inputMode={step < 1 ? 'decimal' : 'numeric'}
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
        />
        {suffix ? <span aria-hidden="true">{suffix}</span> : null}
      </div>
    </div>
  )
}

type Choice<T extends string | number> = {
  value: T
  label: string
  detail?: string
}

type ChoiceGroupProps<T extends string | number> = {
  legend: string
  name: string
  value: T
  choices: readonly Choice<T>[]
  onChange: (value: T) => void
  columns?: 2 | 3 | 4
  hint?: ReactNode
}

export function ChoiceGroup<T extends string | number>({
  legend,
  name,
  value,
  choices,
  onChange,
  columns = 3,
  hint,
}: ChoiceGroupProps<T>) {
  return (
    <fieldset className="choice-fieldset">
      <legend>{legend}</legend>
      {hint ? <div className="field-hint">{hint}</div> : null}
      <div className={`choice-grid choice-grid--${columns}`}>
        {choices.map((choice) => (
          <label
            className={`choice-card ${value === choice.value ? 'choice-card--selected' : ''}`}
            key={String(choice.value)}
          >
            <input
              type="radio"
              name={name}
              value={choice.value}
              checked={value === choice.value}
              onChange={() => onChange(choice.value)}
            />
            <span className="choice-title">{choice.label}</span>
            {choice.detail ? <span className="choice-detail">{choice.detail}</span> : null}
          </label>
        ))}
      </div>
    </fieldset>
  )
}

type ToggleFieldProps = {
  id: string
  label: string
  detail: string
  checked: boolean
  onChange: (value: boolean) => void
}

export function ToggleField({ id, label, detail, checked, onChange }: ToggleFieldProps) {
  return (
    <label className="toggle-field" htmlFor={id}>
      <span>
        <strong>{label}</strong>
        <small>{detail}</small>
      </span>
      <span className={`toggle ${checked ? 'toggle--on' : ''}`} aria-hidden="true">
        <span />
      </span>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
    </label>
  )
}
