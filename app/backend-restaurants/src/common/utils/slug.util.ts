import { slugify } from 'transliteration';

export function buildSlug(value: string): string {
  return slugify(value, { lowercase: true, separator: '-' });
}
