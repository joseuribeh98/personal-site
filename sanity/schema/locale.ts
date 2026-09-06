import { defineField, defineType } from 'sanity';

export const LOCALES = [
  { id: 'en', title: 'English', isDefault: true },
  { id: 'es', title: 'Español' },
  { id: 'pt', title: 'Português' },
] as const;

/** Field-level localization: one entity, one field per language. Used by `project`. */
const localeFields = (type: 'string' | 'text' | 'array') =>
  LOCALES.map((l) =>
    defineField({
      name: l.id,
      title: l.title,
      type,
      ...(type === 'array' ? { of: [{ type: 'block' }, { type: 'image', options: { hotspot: true } }, { type: 'code' }] } : {}),
      validation: l.isDefault && type !== 'array' ? (r) => r.required() : undefined,
    }),
  );

export const localeText = defineType({
  name: 'localeText',
  title: 'Localized text',
  type: 'object',
  fields: localeFields('text'),
});

export const localeBlock = defineType({
  name: 'localeBlock',
  title: 'Localized rich text',
  type: 'object',
  fields: localeFields('array'),
});
