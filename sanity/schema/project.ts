import { defineField, defineType } from 'sanity';

export const project = defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  fields: [
    defineField({ name: 'title', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'slug', type: 'slug', options: { source: 'title' }, validation: (r) => r.required() }),
    defineField({
      name: 'kind',
      type: 'string',
      options: { list: [
        { title: 'Web app', value: 'app' },
        { title: 'Astro site', value: 'site' },
        { title: 'WordPress', value: 'wordpress' },
      ], layout: 'radio' },
      validation: (r) => r.required(),
    }),
    defineField({ name: 'client', type: 'string' }),
    defineField({ name: 'role', type: 'string', description: 'e.g. Full Stack Developer' }),
    defineField({ name: 'year', type: 'number' }),
    defineField({ name: 'stack', type: 'array', of: [{ type: 'string' }], options: { layout: 'tags' } }),
    defineField({ name: 'url', type: 'url', description: 'Leave empty if the site is not live' }),
    defineField({
      name: 'status',
      type: 'string',
      options: { list: [
        { title: 'Live', value: 'live' },
        { title: 'Offline', value: 'offline' },
        { title: 'Parked (temporarily)', value: 'parked' },
      ], layout: 'radio' },
      initialValue: 'live',
      description: 'Only "Live" shows a link to the site',
    }),
    defineField({
      name: 'screenshot',
      type: 'image',
      options: { hotspot: true },
      validation: (r) => r.required().error('No screenshot, no publish'),
    }),
    defineField({ name: 'featured', type: 'boolean', initialValue: false, description: 'Shown on the home page' }),
    defineField({ name: 'order', type: 'number', description: 'Manual sort, lower first' }),
    defineField({ name: 'summary', type: 'localeText', validation: (r) => r.required() }),
    defineField({ name: 'caseStudy', type: 'localeBlock', description: 'Only for projects that get their own page' }),
  ],
  orderings: [{ title: 'Manual order', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] }],
  preview: {
    select: { title: 'title', subtitle: 'kind', media: 'screenshot' },
  },
});
