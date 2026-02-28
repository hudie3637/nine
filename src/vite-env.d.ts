/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DOUBAO_API_KEY: string
  readonly VITE_APP_URL: string
  readonly VITE_DOUBAO_MODEL: string
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_STRIPE_SECRET_KEY: string
  readonly VITE_STRIPE_PUBLISHABLE_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}