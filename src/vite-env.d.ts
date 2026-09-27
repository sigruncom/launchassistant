/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_VARIANT?: 'complete' | 'beginner'
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
