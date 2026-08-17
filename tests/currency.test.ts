import { describe, expect, it } from 'vitest'
import {
  resolveCurrencySelectState,
} from '../src/components/CurrencySelect'
import {
  additionalCurrencyOptions,
  commonCurrencyOptions,
  CURRENCY_CATALOG_VERSION,
  currencyCodeError,
  currencyAmountLabel,
  currencyMinorUnitDigits,
  currencyMinorUnitScale,
  currencyPrefix,
  currencyValues,
  formatMinorUnits,
  isSupportedCurrencyCode,
  moneyFormatter,
  MORE_CURRENCIES_VALUE,
  normalizeCurrencyCode,
} from '../src/domain/currency'

describe('static international currency foundation', () => {
  it('uses a versioned, broad, duplicate-free participant catalog', () => {
    const optionCodes = [
      ...commonCurrencyOptions.map((option) => option.code),
      ...additionalCurrencyOptions.map((option) => option.code),
    ]

    expect(CURRENCY_CATALOG_VERSION).toBe('iso-4217-list-one-v1-2026-08-17')
    expect(commonCurrencyOptions[0]?.code).toBe('EUR')
    expect(currencyValues.length).toBe(92)
    expect(new Set(currencyValues).size).toBe(currencyValues.length)
    expect(new Set(optionCodes).size).toBe(optionCodes.length)
    expect(new Set(optionCodes)).toEqual(new Set(currencyValues))
    expect(optionCodes).not.toContain('XAU')
    expect(optionCodes).not.toContain('XDR')
    expect(optionCodes).not.toContain('BGN')
  })

  it.each([
    'CAD',
    'AUD',
    'CHF',
    'SEK',
    'NOK',
    'DKK',
    'ISK',
    'INR',
    'JPY',
    'BRL',
    'ZAR',
    'AED',
    'SGD',
    'XAF',
    'XCD',
  ])('supports %s without formatter errors', (currency) => {
    expect(isSupportedCurrencyCode(currency)).toBe(true)
    expect(currencyPrefix(currency)).toBeTruthy()
    expect(() => moneyFormatter(currency).format(1_234.56)).not.toThrow()
  })

  it('normalizes codes while keeping membership checks type-safe', () => {
    expect(normalizeCurrencyCode(' cad ')).toBe('CAD')
    expect(isSupportedCurrencyCode('CAD')).toBe(true)
    expect(isSupportedCurrencyCode('cad')).toBe(false)
    expect(currencyCodeError(' cad ')).toBeNull()
    expect(currencyCodeError('')).toBe('Choose a currency.')
    expect(currencyCodeError('BTC')).toBe('Choose a currency from the international list.')
    expect(currencyCodeError(MORE_CURRENCIES_VALUE)).toBe(
      'Choose a currency from the international list.',
    )
  })

  it('uses the catalog minor-unit precision for zero, two and three-digit currencies', () => {
    expect(currencyMinorUnitDigits('JPY')).toBe(0)
    expect(currencyMinorUnitScale('JPY')).toBe(1)
    expect(currencyMinorUnitDigits('EUR')).toBe(2)
    expect(currencyMinorUnitScale('EUR')).toBe(100)
    expect(currencyMinorUnitDigits('KWD')).toBe(3)
    expect(currencyMinorUnitScale('KWD')).toBe(1000)

    expect(moneyFormatter('JPY').resolvedOptions().maximumFractionDigits).toBe(0)
    expect(moneyFormatter('EUR').resolvedOptions().maximumFractionDigits).toBe(2)
    expect(moneyFormatter('KWD').resolvedOptions().maximumFractionDigits).toBe(3)
  })

  it('falls back to guarded plain-number behavior for blank or unsupported codes', () => {
    expect(currencyMinorUnitDigits('BTC')).toBe(2)
    expect(currencyMinorUnitScale('BTC')).toBe(100)
    expect(currencyPrefix('BTC')).toBeUndefined()
    expect(currencyPrefix()).toBeUndefined()
    expect(moneyFormatter('BTC').resolvedOptions().style).toBe('decimal')
    expect(moneyFormatter('BTC').format(1_234.5)).toBe('1,234.5')
  })

  it('formats exact bigint minor units for each supported precision', () => {
    expect(formatMinorUnits('EUR', 12_345n)).toBe('€123.45')
    expect(formatMinorUnits('JPY', 12_345n)).toBe('¥12,345')
    expect(formatMinorUnits('KWD', 12_345n)).toMatch(/12\.345$/)
    expect(formatMinorUnits('EUR', -45n)).toBe('-€0.45')

    expect(formatMinorUnits('KWD', 9_007_199_254_740_993_123n)).toContain(
      '9,007,199,254,740,993.123',
    )
  })

  it('uses static names and disambiguating codes in selector labels', () => {
    expect(commonCurrencyOptions.find((option) => option.code === 'EUR')?.label).toBe(
      'EUR · Euro (€)',
    )
    expect(commonCurrencyOptions.find((option) => option.code === 'CAD')?.label).toContain(
      'CAD · Canadian dollar',
    )
    expect(additionalCurrencyOptions.find((option) => option.code === 'KWD')?.label).toContain(
      'KWD · Kuwaiti dinar',
    )
  })

  it('includes the selected ISO code in remote monetary-field labels', () => {
    expect(currencyAmountLabel('Available ad budget', 'CAD')).toBe(
      'Available ad budget (CAD)',
    )
    expect(currencyAmountLabel('Available ad budget', '')).toBe('Available ad budget')
  })

  it('keeps the More currencies sentinel out of currency values and closes on reset', () => {
    expect(currencyValues).not.toContain(MORE_CURRENCIES_VALUE)
    expect(resolveCurrencySelectState(MORE_CURRENCIES_VALUE)).toEqual({
      primaryValue: MORE_CURRENCIES_VALUE,
      secondaryValue: '',
      showAdditional: true,
    })
    expect(resolveCurrencySelectState('JPY')).toEqual({
      primaryValue: MORE_CURRENCIES_VALUE,
      secondaryValue: 'JPY',
      showAdditional: true,
    })
    expect(resolveCurrencySelectState('CAD')).toEqual({
      primaryValue: 'CAD',
      secondaryValue: '',
      showAdditional: false,
    })
    expect(resolveCurrencySelectState('')).toEqual({
      primaryValue: '',
      secondaryValue: '',
      showAdditional: false,
    })
  })
})
