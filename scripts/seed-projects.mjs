// Uploads screenshots and creates/replaces the 12 project documents.
// Run: node --env-file=.env scripts/seed-projects.mjs
import { createClient } from '@sanity/client';
import { createReadStream, existsSync, readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';

const { PUBLIC_SANITY_PROJECT_ID: projectId, PUBLIC_SANITY_DATASET: dataset = 'production', SANITY_API_TOKEN: token } = process.env;
if (!projectId || projectId === 'placeholder' || !token) {
  console.error('Set PUBLIC_SANITY_PROJECT_ID (real) and SANITY_API_TOKEN in .env');
  process.exit(1);
}

const client = createClient({ projectId, dataset, token, apiVersion: '2026-09-01', useCdn: false });
const projects = JSON.parse(readFileSync(new URL('../data/projects.json', import.meta.url), 'utf8'));

const key = () => randomUUID().slice(0, 12);
const toBlocks = (paragraphs) =>
  paragraphs.map((text) => ({
    _type: 'block', _key: key(), style: 'normal', markDefs: [],
    children: [{ _type: 'span', _key: key(), text, marks: [] }],
  }));

// sanity-plugin-internationalized-array v5 shapes: language in its own field, _key is a random stable key.
const i18nText = (obj) => Object.entries(obj).map(([lang, value]) => ({ _key: key(), language: lang, _type: 'internationalizedArrayTextValue', value }));
const i18nRich = (obj) => Object.entries(obj).map(([lang, paragraphs]) => ({ _key: key(), language: lang, _type: 'internationalizedArrayRichTextValue', value: toBlocks(paragraphs) }));

let published = 0;
for (const p of projects) {
  const file = `tmp/screenshots/${p.slug}.png`;
  if (!existsSync(file)) {
    console.warn(`skip ${p.slug}: no screenshot at ${file} (rule: no screenshot, no publish)`);
    continue;
  }
  const asset = await client.assets.upload('image', createReadStream(file), { filename: `${p.slug}.png` });
  const fields = {
    title: p.title,
    slug: { _type: 'slug', current: p.slug },
    kind: p.kind,
    client: p.client,
    role: p.role,
    year: p.year,
    stack: p.stack,
    url: p.url ?? undefined,
    status: p.status,
    featured: p.featured,
    order: p.order,
    screenshot: { _type: 'image', asset: { _type: 'reference', _ref: asset._id } },
    summary: i18nText(p.summary),
    caseStudy: p.caseStudy ? i18nRich(p.caseStudy) : undefined,
  };
  // Sanity rule: never invent _ids. Find by slug; patch if it exists, create otherwise.
  const existingId = await client.fetch('*[_type == "project" && slug.current == $slug][0]._id', { slug: p.slug });
  if (existingId) {
    await client.patch(existingId).set(fields).unset(p.caseStudy ? [] : ['caseStudy']).commit();
    console.log('↻', p.slug, '(updated)');
  } else {
    await client.create({ _type: 'project', ...fields });
    console.log('✓', p.slug);
  }
  published++;
}
console.log(`${published}/${projects.length} projects published`);
