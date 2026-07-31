/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Override the Jikan API host. Defaults to https://api.jikan.moe/v4 */
  readonly VITE_JIKAN_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
