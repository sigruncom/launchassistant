export type AppVariant = 'complete' | 'beginner'

const isAppVariant = (value: unknown): value is AppVariant =>
  value === 'beginner' || value === 'complete'

export const resolveAppVariant = (
  queryValue: unknown,
  configuredDefault?: unknown,
): AppVariant => {
  if (isAppVariant(queryValue)) return queryValue
  if (isAppVariant(configuredDefault)) return configuredDefault
  return 'beginner'
}

export const appVariantHref = (variant: AppVariant) => `?planner=${variant}`
