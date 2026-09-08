/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE?: string;
  readonly VITE_FALLBACK_LAT?: string;
  readonly VITE_FALLBACK_LNG?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
