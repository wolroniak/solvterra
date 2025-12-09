// Mock Translation Service
// Returns *_en fields from mock data for demo mode

import type { Language } from '../store/languageStore';

/**
 * Gets the translated value of a field from an entity.
 * For English, returns the *_en field if available, otherwise falls back to the original.
 * For German, returns the original field.
 *
 * @param entity - The entity containing the field
 * @param field - The field name to translate (e.g., 'title', 'description')
 * @param language - The target language ('de' or 'en')
 * @returns The translated string value
 */
export function getTranslatedField<T extends Record<string, unknown>>(
  entity: T,
  field: keyof T,
  language: Language
): string {
  const value = entity[field];

  // Return original for German
  if (language === 'de') {
    return String(value ?? '');
  }

  // For English, try to get the *_en field
  const enField = `${String(field)}_en` as keyof T;
  const enValue = entity[enField];

  // Return English if available, otherwise fallback to original
  return String(enValue ?? value ?? '');
}

/**
 * Creates a translated version of an entity with specified fields.
 *
 * @param entity - The entity to translate
 * @param fields - Array of field names to translate
 * @param language - The target language
 * @returns A new object with translated field values
 */
export function translateEntity<T extends Record<string, unknown>>(
  entity: T,
  fields: (keyof T)[],
  language: Language
): T {
  if (language === 'de') {
    return entity;
  }

  const translated = { ...entity };

  for (const field of fields) {
    const enField = `${String(field)}_en` as keyof T;
    if (entity[enField] !== undefined) {
      (translated as Record<string, unknown>)[String(field)] = entity[enField];
    }
  }

  return translated;
}

/**
 * Translates nested location object
 */
export function translateLocation<T extends Record<string, unknown>>(
  location: T | undefined,
  language: Language
): T | undefined {
  if (!location || language === 'de') {
    return location;
  }

  return translateEntity(location, ['name', 'address', 'meetingPoint', 'additionalInfo'] as (keyof T)[], language);
}

/**
 * Translates nested contact object
 */
export function translateContact<T extends Record<string, unknown>>(
  contact: T | undefined,
  language: Language
): T | undefined {
  if (!contact || language === 'de') {
    return contact;
  }

  return translateEntity(contact, ['role', 'responseTime'] as (keyof T)[], language);
}

/**
 * Translates a linked challenge info object
 */
export function translateLinkedChallenge<T extends Record<string, unknown>>(
  linkedChallenge: T | undefined,
  language: Language
): T | undefined {
  if (!linkedChallenge || language === 'de') {
    return linkedChallenge;
  }

  return translateEntity(linkedChallenge, ['title', 'organizationName'] as (keyof T)[], language);
}
