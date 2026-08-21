import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { resolveAppVariant } from './variants/appVariant'
import './styles.css'

const queryVariant = new URLSearchParams(window.location.search).get('planner')
const variant = resolveAppVariant(queryVariant, import.meta.env.VITE_APP_VARIANT)
const appModule = variant === 'beginner' ? import('./BeginnerApp') : import('./App')

const metadata =
  variant === 'beginner'
    ? {
        title: 'Launch Assistant — Beginner Prototype',
        description: 'A calm, beginner-friendly Launch & Sell planning prototype.',
      }
    : {
        title: 'Launch Assistant — Complete Prototype',
        description: 'A complete Launch & Sell planning and methodology-review prototype.',
      }

document.title = metadata.title
document.querySelector('meta[name="description"]')?.setAttribute('content', metadata.description)

void appModule.then(({ default: RootApp }) => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <RootApp />
    </StrictMode>,
  )
})
