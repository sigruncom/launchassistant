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
        title: 'Launch Planner',
        description: 'Plan a Launch & Sell launch from your list, price, and workshop.',
      }
    : {
        title: 'Launch Planner',
        description: 'Plan a Launch & Sell launch from your list, price, and workshop.',
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
