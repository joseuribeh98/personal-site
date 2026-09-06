import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { codeInput } from '@sanity/code-input';
import { schemaTypes } from './sanity/schema';

export default defineConfig({
  name: 'joseuribe-dev',
  title: 'joseuribe.dev',
  projectId: import.meta.env.PUBLIC_SANITY_PROJECT_ID,
  dataset: import.meta.env.PUBLIC_SANITY_DATASET ?? 'production',
  plugins: [structureTool(), codeInput()],
  schema: { types: schemaTypes },
});
