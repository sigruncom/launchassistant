export type AppVariant = 'complete' | 'beginner'

export const resolveAppVariant = (value: unknown): AppVariant =>
  value === 'beginner' ? 'beginner' : 'complete'
