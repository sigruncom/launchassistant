import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { resolveAppVariant } from './variants/appVariant'
import './styles.css'

const variant = resolveAppVariant(import.meta.env.VITE_APP_VARIANT)
const appModule = variant === 'beginner' ? import('./BeginnerApp') : import('./App')

if (variant === 'beginner') {
  document.title = 'Launch Assistant — Beginner Prototype'
  document
    .querySelector('meta[name="description"]')
    ?.setAttribute('content', 'A calm, beginner-friendly Launch & Sell planning prototype.')
}

void appModule.then(({ default: RootApp }) => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <RootApp />
    </StrictMode>,
  )
})
