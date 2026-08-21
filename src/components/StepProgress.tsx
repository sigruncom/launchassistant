type StepProgressProps = {
  activeStep: number
  labels: readonly string[]
}

export function StepProgress({ activeStep, labels }: StepProgressProps) {
  const total = labels.length
  const current = Math.min(activeStep + 1, total)

  return (
    <nav className="guided-progress" aria-label="Planner progress">
      <div>
        <span>Step {current} of {total}</span>
        <strong>{labels[activeStep]}</strong>
      </div>
      <div
        className="guided-progress__track"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={current}
        aria-label={`${labels[activeStep]}, step ${current} of ${total}`}
      >
        <span style={{ width: `${(current / total) * 100}%` }} />
      </div>
    </nav>
  )
}
