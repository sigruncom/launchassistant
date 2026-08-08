/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_VARIANT?: 'complete' | 'beginner'
  readonly VITE_COMPLETE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
