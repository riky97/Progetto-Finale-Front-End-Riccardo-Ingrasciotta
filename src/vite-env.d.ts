/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Override the AniList GraphQL endpoint. Defaults to https://graphql.anilist.co */
  readonly VITE_ANILIST_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
