import {
  EMAIL_LIST_SIZE_MAX,
  ORGANIC_SIGNUP_RATE_DEFAULT,
  ORGANIC_SIGNUP_RATE_MAX,
  estimateOrganicRegistrationsFromEmailList,
} from '../domain/beginner'
import { SourceChip } from './SourceChip'

type EmailReachFieldsProps = {
  emailListSize: string
  signupRatePercent: string
  showErrors: boolean
  onEmailListSizeChange: (value: string) => void
  onSignupRatePercentChange: (value: string) => void
}

const validEmailListSize = (value: string) => {
  const parsed = Number(value)
  return (
    value.trim() !== '' &&
    Number.isFinite(parsed) &&
    Number.isInteger(parsed) &&
    parsed >= 0 &&
    parsed <= EMAIL_LIST_SIZE_MAX
  )
}

const validSignupRate = (value: string) => {
  const parsed = Number(value)
  return (
    value.trim() !== '' &&
    Number.isFinite(parsed) &&
    parsed >= 0 &&
    parsed <= ORGANIC_SIGNUP_RATE_MAX
  )
}

export function EmailReachFields({
  emailListSize,
  signupRatePercent,
  showErrors,
  onEmailListSizeChange,
  onSignupRatePercentChange,
}: EmailReachFieldsProps) {
  const listIsValid = validEmailListSize(emailListSize)
  const rateIsValid = validSignupRate(signupRatePercent)
  const estimate =
    listIsValid && rateIsValid
      ? estimateOrganicRegistrationsFromEmailList(
          Number(emailListSize),
          Number(signupRatePercent),
        )
      : null

  return (
    <fieldset className="email-reach-builder">
      <legend>Email reach estimate</legend>
      <div className="email-reach-intro">
        <strong>Start with the audience you can email.</strong>
        <p>
          Sigrun notes that signup percentages tend to fall as lists get larger. A 50,000-person
          list produced 2,000 registrations, or 4%. This prototype leaves the rate in your hands.
        </p>
        <SourceChip sourceId="SIGRUN-REACH-2026-08-11" />
      </div>

      <div className="form-grid form-grid--2">
        <div className="field">
          <label htmlFor="beginner-email-list-size">People on your email list</label>
          <p className="field-hint" id="beginner-email-list-size-hint">
            Enter the number of people who could receive your launch emails.
          </p>
          <div className="number-control">
            <input
              id="beginner-email-list-size"
              type="number"
              inputMode="numeric"
              min={0}
              max={EMAIL_LIST_SIZE_MAX}
              step={1}
              placeholder="Enter your list size"
              value={emailListSize}
              aria-describedby={
                showErrors && !listIsValid
                  ? 'beginner-email-list-size-hint beginner-email-list-size-error'
                  : 'beginner-email-list-size-hint'
              }
              aria-invalid={showErrors && !listIsValid}
              onChange={(event) => onEmailListSizeChange(event.target.value)}
            />
          </div>
          {showErrors && !listIsValid ? (
            <p className="field-error" id="beginner-email-list-size-error">
              Enter a whole number for your email list size.
            </p>
          ) : null}
        </div>

        <div className="field">
          <div className="email-reach-label">
            <label htmlFor="beginner-organic-signup-rate">Expected registration rate</label>
            <span>Sigrun default · {ORGANIC_SIGNUP_RATE_DEFAULT}%</span>
          </div>
          <p className="field-hint" id="beginner-organic-signup-rate-hint">
            Adjust the visible 10% starting point using your own evidence. Maximum 50%.
          </p>
          <div className="number-control">
            <input
              id="beginner-organic-signup-rate"
              type="number"
              inputMode="decimal"
              min={0}
              max={ORGANIC_SIGNUP_RATE_MAX}
              step={0.1}
              value={signupRatePercent}
              aria-describedby={
                showErrors && !rateIsValid
                  ? 'beginner-organic-signup-rate-hint beginner-organic-signup-rate-error'
                  : 'beginner-organic-signup-rate-hint'
              }
              aria-invalid={showErrors && !rateIsValid}
              onChange={(event) => onSignupRatePercentChange(event.target.value)}
            />
            <span aria-hidden="true">%</span>
          </div>
          {showErrors && !rateIsValid ? (
            <p className="field-error" id="beginner-organic-signup-rate-error">
              Enter an expected registration rate between 0% and 50%.
            </p>
          ) : null}
        </div>
      </div>

      <output
        className={`email-reach-output ${estimate === null ? 'email-reach-output--waiting' : ''}`}
        htmlFor="beginner-email-list-size beginner-organic-signup-rate"
      >
        <span>Estimated registrations from your email list</span>
        {estimate === null ? (
          <strong>Enter your email-list size to see the estimate.</strong>
        ) : (
          <strong>
            {Number(emailListSize).toLocaleString()} × {signupRatePercent}% = about{' '}
            {estimate.toLocaleString()}
          </strong>
        )}
        <small>Rounded to the nearest whole registration for this prototype.</small>
      </output>
    </fieldset>
  )
}
