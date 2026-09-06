import { sanityClient } from 'sanity:client';
import { createImageUrlBuilder } from '@sanity/image-url';
import type { Locale } from '../i18n/ui';
import {
  type Project, type Post, type SanityImage,
  PROJECTS_QUERY, FEATURED_PROJECTS_QUERY, PROJECT_BY_SLUG_QUERY, PROJECT_SLUGS_WITH_CASE_QUERY,
  POSTS_QUERY, POST_BY_SLUG_QUERY,
} from './content';

const builder = createImageUrlBuilder(sanityClient);
export const urlFor = (src: SanityImage) => builder.image(src).auto('format');

export const getProjects = (locale: Locale) => sanityClient.fetch<Project[]>(PROJECTS_QUERY, { locale });
export const getFeaturedProjects = (locale: Locale) => sanityClient.fetch<Project[]>(FEATURED_PROJECTS_QUERY, { locale });
export const getProjectBySlug = (locale: Locale, slug: string) => sanityClient.fetch<Project | null>(PROJECT_BY_SLUG_QUERY, { locale, slug });
export const getCaseStudySlugs = () => sanityClient.fetch<string[]>(PROJECT_SLUGS_WITH_CASE_QUERY);
export const getPosts = (locale: Locale) => sanityClient.fetch<Post[]>(POSTS_QUERY, { locale });
export const getPostBySlug = (locale: Locale, slug: string) => sanityClient.fetch<Post | null>(POST_BY_SLUG_QUERY, { locale, slug });
