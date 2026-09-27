export const CURRENCY_CATALOG_VERSION = 'iso-4217-list-one-v1-2026-08-17' as const

/**
 * Static planning-currency catalog for the Phase 0 prototype.
 *
 * The list contains participant-facing ISO 4217 currencies only. It deliberately
 * excludes metals, funds, test codes and other non-participant units. Keeping the
 * snapshot in source control makes validation deterministic across browsers and
 * prevents runtime CLDR membership from silently changing accepted inputs. It is
 * based on SIX ISO 4217 List One, accessed 2026-08-17; BGN is excluded because
 * SIX moved it to the historical list effective 2026-01-01.
 */
export const currencyValues = [
  'AED',
  'ARS',
  'AUD',
  'BDT',
  'BHD',
  'BOB',
  'BRL',
  'BWP',
  'CAD',
  'CHF',
  'CLP',
  'CNY',
  'COP',
  'CRC',
  'CZK',
  'DKK',
  'DOP',
  'DZD',
  'EGP',
  'ETB',
  'EUR',
  'FJD',
  'GBP',
  'GEL',
  'GHS',
  'GTQ',
  'HKD',
  'HNL',
  'HUF',
  'IDR',
  'ILS',
  'INR',
  'IQD',
  'ISK',
  'JOD',
  'JPY',
  'KES',
  'KHR',
  'KRW',
  'KWD',
  'KZT',
  'LAK',
  'LBP',
  'LKR',
  'MAD',
  'MMK',
  'MUR',
  'MXN',
  'MYR',
  'MZN',
  'NAD',
  'NGN',
  'NIO',
  'NOK',
  'NPR',
  'NZD',
  'OMR',
  'PAB',
  'PEN',
  'PGK',
  'PHP',
  'PKR',
  'PLN',
  'PYG',
  'QAR',
  'RON',
  'RSD',
  'RUB',
  'RWF',
  'SAR',
  'SEK',
  'SGD',
  'THB',
  'TND',
  'TRY',
  'TTD',
  'TWD',
  'TZS',
  'UAH',
  'UGX',
  'USD',
  'UYU',
  'VND',
  'WST',
  'XAF',
  'XCD',
  'XCG',
  'XOF',
  'XPF',
  'ZAR',
  'ZMW',
  'ZWG',
] as const

export type CurrencyCode = (typeof currencyValues)[number]
export type CurrencyMinorUnitDigits = 0 | 2 | 3
export type CurrencyMinorUnitScale = 1 | 100 | 1000

type CurrencyMetadata = {
  name: string
  minorUnitDigits: CurrencyMinorUnitDigits
}

const currencyMetadata: Record<CurrencyCode, CurrencyMetadata> = {
  AED: { name: 'United Arab Emirates dirham', minorUnitDigits: 2 },
  ARS: { name: 'Argentine peso', minorUnitDigits: 2 },
  AUD: { name: 'Australian dollar', minorUnitDigits: 2 },
  BDT: { name: 'Bangladeshi taka', minorUnitDigits: 2 },
  BHD: { name: 'Bahraini dinar', minorUnitDigits: 3 },
  BOB: { name: 'Bolivian boliviano', minorUnitDigits: 2 },
  BRL: { name: 'Brazilian real', minorUnitDigits: 2 },
  BWP: { name: 'Botswana pula', minorUnitDigits: 2 },
  CAD: { name: 'Canadian dollar', minorUnitDigits: 2 },
  CHF: { name: 'Swiss franc', minorUnitDigits: 2 },
  CLP: { name: 'Chilean peso', minorUnitDigits: 0 },
  CNY: { name: 'Chinese yuan', minorUnitDigits: 2 },
  COP: { name: 'Colombian peso', minorUnitDigits: 2 },
  CRC: { name: 'Costa Rican colón', minorUnitDigits: 2 },
  CZK: { name: 'Czech koruna', minorUnitDigits: 2 },
  DKK: { name: 'Danish krone', minorUnitDigits: 2 },
  DOP: { name: 'Dominican peso', minorUnitDigits: 2 },
  DZD: { name: 'Algerian dinar', minorUnitDigits: 2 },
  EGP: { name: 'Egyptian pound', minorUnitDigits: 2 },
  ETB: { name: 'Ethiopian birr', minorUnitDigits: 2 },
  EUR: { name: 'Euro', minorUnitDigits: 2 },
  FJD: { name: 'Fijian dollar', minorUnitDigits: 2 },
  GBP: { name: 'British pound', minorUnitDigits: 2 },
  GEL: { name: 'Georgian lari', minorUnitDigits: 2 },
  GHS: { name: 'Ghanaian cedi', minorUnitDigits: 2 },
  GTQ: { name: 'Guatemalan quetzal', minorUnitDigits: 2 },
  HKD: { name: 'Hong Kong dollar', minorUnitDigits: 2 },
  HNL: { name: 'Honduran lempira', minorUnitDigits: 2 },
  HUF: { name: 'Hungarian forint', minorUnitDigits: 2 },
  IDR: { name: 'Indonesian rupiah', minorUnitDigits: 2 },
  ILS: { name: 'Israeli new shekel', minorUnitDigits: 2 },
  INR: { name: 'Indian rupee', minorUnitDigits: 2 },
  IQD: { name: 'Iraqi dinar', minorUnitDigits: 3 },
  ISK: { name: 'Icelandic króna', minorUnitDigits: 0 },
  JOD: { name: 'Jordanian dinar', minorUnitDigits: 3 },
  JPY: { name: 'Japanese yen', minorUnitDigits: 0 },
  KES: { name: 'Kenyan shilling', minorUnitDigits: 2 },
  KHR: { name: 'Cambodian riel', minorUnitDigits: 2 },
  KRW: { name: 'South Korean won', minorUnitDigits: 0 },
  KWD: { name: 'Kuwaiti dinar', minorUnitDigits: 3 },
  KZT: { name: 'Kazakhstani tenge', minorUnitDigits: 2 },
  LAK: { name: 'Lao kip', minorUnitDigits: 2 },
  LBP: { name: 'Lebanese pound', minorUnitDigits: 2 },
  LKR: { name: 'Sri Lankan rupee', minorUnitDigits: 2 },
  MAD: { name: 'Moroccan dirham', minorUnitDigits: 2 },
  MMK: { name: 'Myanmar kyat', minorUnitDigits: 2 },
  MUR: { name: 'Mauritian rupee', minorUnitDigits: 2 },
  MXN: { name: 'Mexican peso', minorUnitDigits: 2 },
  MYR: { name: 'Malaysian ringgit', minorUnitDigits: 2 },
  MZN: { name: 'Mozambican metical', minorUnitDigits: 2 },
  NAD: { name: 'Namibian dollar', minorUnitDigits: 2 },
  NGN: { name: 'Nigerian naira', minorUnitDigits: 2 },
  NIO: { name: 'Nicaraguan córdoba', minorUnitDigits: 2 },
  NOK: { name: 'Norwegian krone', minorUnitDigits: 2 },
  NPR: { name: 'Nepalese rupee', minorUnitDigits: 2 },
  NZD: { name: 'New Zealand dollar', minorUnitDigits: 2 },
  OMR: { name: 'Omani rial', minorUnitDigits: 3 },
  PAB: { name: 'Panamanian balboa', minorUnitDigits: 2 },
  PEN: { name: 'Peruvian sol', minorUnitDigits: 2 },
  PGK: { name: 'Papua New Guinean kina', minorUnitDigits: 2 },
  PHP: { name: 'Philippine peso', minorUnitDigits: 2 },
  PKR: { name: 'Pakistani rupee', minorUnitDigits: 2 },
  PLN: { name: 'Polish zloty', minorUnitDigits: 2 },
  PYG: { name: 'Paraguayan guarani', minorUnitDigits: 0 },
  QAR: { name: 'Qatari riyal', minorUnitDigits: 2 },
  RON: { name: 'Romanian leu', minorUnitDigits: 2 },
  RSD: { name: 'Serbian dinar', minorUnitDigits: 2 },
  RUB: { name: 'Russian ruble', minorUnitDigits: 2 },
  RWF: { name: 'Rwandan franc', minorUnitDigits: 0 },
  SAR: { name: 'Saudi riyal', minorUnitDigits: 2 },
  SEK: { name: 'Swedish krona', minorUnitDigits: 2 },
  SGD: { name: 'Singapore dollar', minorUnitDigits: 2 },
  THB: { name: 'Thai baht', minorUnitDigits: 2 },
  TND: { name: 'Tunisian dinar', minorUnitDigits: 3 },
  TRY: { name: 'Turkish lira', minorUnitDigits: 2 },
  TTD: { name: 'Trinidad and Tobago dollar', minorUnitDigits: 2 },
  TWD: { name: 'New Taiwan dollar', minorUnitDigits: 2 },
  TZS: { name: 'Tanzanian shilling', minorUnitDigits: 2 },
  UAH: { name: 'Ukrainian hryvnia', minorUnitDigits: 2 },
  UGX: { name: 'Ugandan shilling', minorUnitDigits: 0 },
  USD: { name: 'US dollar', minorUnitDigits: 2 },
  UYU: { name: 'Uruguayan peso', minorUnitDigits: 2 },
  VND: { name: 'Vietnamese dong', minorUnitDigits: 0 },
  WST: { name: 'Samoan tala', minorUnitDigits: 2 },
  XAF: { name: 'Central African CFA franc', minorUnitDigits: 0 },
  XCD: { name: 'East Caribbean dollar', minorUnitDigits: 2 },
  XCG: { name: 'Caribbean guilder', minorUnitDigits: 2 },
  XOF: { name: 'West African CFA franc', minorUnitDigits: 0 },
  XPF: { name: 'CFP franc', minorUnitDigits: 0 },
  ZAR: { name: 'South African rand', minorUnitDigits: 2 },
  ZMW: { name: 'Zambian kwacha', minorUnitDigits: 2 },
  ZWG: { name: 'Zimbabwe Gold', minorUnitDigits: 2 },
}

const commonCurrencyValues = [
  'EUR',
  'USD',
  'GBP',
  'CAD',
  'AUD',
  'NZD',
  'CHF',
  'SEK',
  'NOK',
  'DKK',
  'ISK',
] as const satisfies readonly CurrencyCode[]

const currencyValueSet = new Set<string>(currencyValues)
const commonCurrencySet = new Set<string>(commonCurrencyValues)

export const normalizeCurrencyCode = (value: string) => value.trim().toUpperCase()

export const isSupportedCurrencyCode = (value: string): value is CurrencyCode =>
  currencyValueSet.has(value)

export const currencyCodeError = (value: string) => {
  const code = normalizeCurrencyCode(value)
  if (!code) return 'Choose a currency.'
  if (!isSupportedCurrencyCode(code)) return 'Choose a currency from the international list.'
  return null
}

export const currencyMinorUnitDigits = (
  value?: string,
): CurrencyMinorUnitDigits => {
  const code = value ? normalizeCurrencyCode(value) : ''
  return isSupportedCurrencyCode(code) ? currencyMetadata[code].minorUnitDigits : 2
}

export const currencyMinorUnitScale = (
  value?: string,
): CurrencyMinorUnitScale => {
  const digits = currencyMinorUnitDigits(value)
  return digits === 0 ? 1 : digits === 3 ? 1000 : 100
}

const formatterCache = new Map<string, Intl.NumberFormat>()
const exactFormatterCache = new Map<CurrencyCode, Intl.NumberFormat>()

const plainNumberFormatter = new Intl.NumberFormat('en', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

export const moneyFormatter = (currency?: string) => {
  const code = currency ? normalizeCurrencyCode(currency) : ''
  if (!isSupportedCurrencyCode(code)) return plainNumberFormatter

  const cached = formatterCache.get(code)
  if (cached) return cached

  const formatter = new Intl.NumberFormat('en', {
    style: 'currency',
    currency: code,
    minimumFractionDigits: 0,
    maximumFractionDigits: currencyMinorUnitDigits(code),
  })

  formatterCache.set(code, formatter)
  return formatter
}

const exactMoneyFormatter = (currency: CurrencyCode) => {
  const cached = exactFormatterCache.get(currency)
  if (cached) return cached

  const digits = currencyMinorUnitDigits(currency)
  const formatter = new Intl.NumberFormat('en', {
    style: 'currency',
    currency,
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })

  exactFormatterCache.set(currency, formatter)
  return formatter
}

export const currencyPrefix = (currency?: string) => {
  const code = currency ? normalizeCurrencyCode(currency) : ''
  if (!isSupportedCurrencyCode(code)) return undefined

  return moneyFormatter(code)
    .formatToParts(0)
    .find((part) => part.type === 'currency')
    ?.value
}

export const currencyAmountLabel = (label: string, currency?: string) => {
  const code = currency ? normalizeCurrencyCode(currency) : ''
  return isSupportedCurrencyCode(code) ? `${label} (${code})` : label
}

/** Formats exact integer minor units without converting through Number. */
export const formatMinorUnits = (
  currency: CurrencyCode,
  minorUnits: bigint,
) => {
  const digits = currencyMinorUnitDigits(currency)
  const scale = BigInt(currencyMinorUnitScale(currency))
  const negative = minorUnits < 0n
  const absoluteMinorUnits = negative ? -minorUnits : minorUnits
  const wholeUnits = absoluteMinorUnits / scale
  const fraction = digits === 0
    ? ''
    : (absoluteMinorUnits % scale).toString().padStart(digits, '0')

  const formatted = exactMoneyFormatter(currency)
    .formatToParts(wholeUnits)
    .map((part) => (part.type === 'fraction' ? fraction : part.value))
    .join('')

  return negative ? `-${formatted}` : formatted
}

export type CurrencyOption = {
  code: CurrencyCode
  label: string
}

const currencyOption = (code: CurrencyCode): CurrencyOption => {
  const symbol = currencyPrefix(code)
  const suffix = symbol && symbol !== code ? ` (${symbol})` : ''

  return {
    code,
    label: `${code} · ${currencyMetadata[code].name}${suffix}`,
  }
}

export const commonCurrencyOptions = commonCurrencyValues.map(currencyOption)

export const additionalCurrencyOptions = currencyValues
  .filter((code) => !commonCurrencySet.has(code))
  .map(currencyOption)

export const MORE_CURRENCIES_VALUE = '__more-currencies__' as const

export type CurrencySelectValue =
  | CurrencyCode
  | typeof MORE_CURRENCIES_VALUE
  | ''
