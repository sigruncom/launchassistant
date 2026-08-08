import {
  appVariantHref,
  type AppVariant,
} from '../variants/appVariant'

type VariantNavigationProps = {
  activeVariant: AppVariant
}

const variants: Array<{ value: AppVariant; label: string }> = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'complete', label: 'Complete' },
]

export function VariantNavigation({ activeVariant }: VariantNavigationProps) {
  return (
    <nav className="variant-navigation" aria-label="Planner version">
      <span className="variant-navigation__label">
        Choose version
        <small>Switching starts a new plan</small>
      </span>
      <div className="variant-navigation__links">
        {variants.map((variant) => (
          <a
            href={appVariantHref(variant.value)}
            aria-current={activeVariant === variant.value ? 'page' : undefined}
            key={variant.value}
          >
            {variant.label}
          </a>
        ))}
      </div>
    </nav>
  )
}
