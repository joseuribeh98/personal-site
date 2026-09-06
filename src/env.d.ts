/// <reference types="astro/client" />
/// <reference types="@sanity/astro/module" />

interface ImportMetaEnv {
  readonly PUBLIC_SANITY_PROJECT_ID: string;
  readonly PUBLIC_SANITY_DATASET: string;
  readonly PUBLIC_GA4_ID?: string;
  readonly PUBLIC_WEB3FORMS_KEY?: string;
  readonly PUBLIC_CAL_URL?: string;
}
