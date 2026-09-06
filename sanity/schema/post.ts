import { defineField, defineType } from 'sanity';
import { LOCALES } from './locale';

export const post = defineType({
  name: 'post',
  title: 'Post',
  type: 'document',
  fields: [
    defineField({ name: 'title', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'slug', type: 'slug', options: { source: 'title' }, validation: (r) => r.required() }),
    defineField({
      name: 'language',
      type: 'string',
      options: { list: LOCALES.map((l) => ({ title: l.title, value: l.id })), layout: 'radio' },
      initialValue: 'en',
      validation: (r) => r.required(),
    }),
    defineField({ name: 'excerpt', type: 'text', rows: 3, validation: (r) => r.required().max(200) }),
    defineField({
      name: 'body',
      type: 'array',
      of: [
        { type: 'block' },
        { type: 'image', options: { hotspot: true }, fields: [{ name: 'alt', type: 'string', title: 'Alt text' }] },
        { type: 'code', options: { withFilename: true } },
      ],
      validation: (r) => r.required(),
    }),
    defineField({ name: 'cover', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'publishedAt', type: 'datetime', validation: (r) => r.required() }),
    defineField({
      name: 'translationOf',
      type: 'reference',
      to: [{ type: 'post' }],
      description: 'Link to the original-language version (used for hreflang)',
    }),
  ],
  orderings: [{ title: 'Newest first', name: 'publishedDesc', by: [{ field: 'publishedAt', direction: 'desc' }] }],
  preview: {
    select: { title: 'title', language: 'language', media: 'cover', date: 'publishedAt' },
    prepare: ({ title, language, media, date }) => ({
      title,
      subtitle: `${String(language).toUpperCase()} · ${date ? new Date(date).toLocaleDateString() : 'draft'}`,
      media,
    }),
  },
});
