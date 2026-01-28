// useTranslatedContent Hook
// Provides translated content for dynamic NGO content

import { useMemo } from 'react';
import { useLanguageStore } from '../store';
import {
  translateEntity,
  translateLocation,
  translateContact,
  translateLinkedChallenge,
  getTranslatedField,
} from '../services/translationService';
import type { Challenge, Organization, CommunityPost, LinkedChallengeInfo } from '@solvterra/shared';

/**
 * Hook for translating a single field value
 */
export function useTranslatedField<T extends Record<string, unknown>>(
  entity: T | undefined | null,
  field: keyof T
): string {
  const { language } = useLanguageStore();

  return useMemo(() => {
    if (!entity) return '';
    return getTranslatedField(entity, field, language);
  }, [entity, field, language]);
}

/**
 * Hook for translating a Challenge entity
 */
export function useTranslatedChallenge(challenge: Challenge | undefined | null): Challenge | undefined {
  const { language } = useLanguageStore();

  return useMemo(() => {
    if (!challenge) return undefined;
    if (language === 'de') return challenge;

    const translated = translateEntity(
      challenge as unknown as Record<string, unknown>,
      ['title', 'description', 'instructions', 'teamDescription'] as never[],
      language
    ) as unknown as Challenge;

    // Translate nested objects
    return {
      ...translated,
      organization: translateEntity(
        translated.organization as unknown as Record<string, unknown>,
        ['name', 'description', 'mission'] as never[],
        language
      ) as unknown as typeof translated.organization,
      location: translateLocation(translated.location as Record<string, unknown> | undefined, language),
      contact: translateContact(translated.contact as Record<string, unknown> | undefined, language),
    } as Challenge;
  }, [challenge, language]);
}

/**
 * Hook for translating an Organization entity
 */
export function useTranslatedOrganization(org: Organization | undefined | null): Organization | undefined {
  const { language } = useLanguageStore();

  return useMemo(() => {
    if (!org) return undefined;
    if (language === 'de') return org;

    return translateEntity(
      org as unknown as Record<string, unknown>,
      ['name', 'description', 'mission'] as never[],
      language
    ) as unknown as Organization;
  }, [org, language]);
}

/**
 * Hook for translating a CommunityPost entity
 */
export function useTranslatedCommunityPost(post: CommunityPost | undefined | null): CommunityPost | undefined {
  const { language } = useLanguageStore();

  return useMemo(() => {
    if (!post) return undefined;
    if (language === 'de') return post;

    const translated = translateEntity(
      post as unknown as Record<string, unknown>,
      ['title', 'content', 'badgeName'] as never[],
      language
    ) as unknown as CommunityPost;

    // Translate linked challenge if present
    if (translated.linkedChallenge) {
      return {
        ...translated,
        linkedChallenge: translateLinkedChallenge(
          translated.linkedChallenge as unknown as Record<string, unknown>,
          language
        ) as unknown as LinkedChallengeInfo,
      };
    }

    return translated;
  }, [post, language]);
}

/**
 * Hook for translating a LinkedChallengeInfo entity
 */
export function useTranslatedLinkedChallenge(
  linkedChallenge: LinkedChallengeInfo | undefined | null
): LinkedChallengeInfo | undefined {
  const { language } = useLanguageStore();

  return useMemo(() => {
    if (!linkedChallenge) return undefined;
    if (language === 'de') return linkedChallenge;

    return translateLinkedChallenge(
      linkedChallenge as unknown as Record<string, unknown>,
      language
    ) as unknown as LinkedChallengeInfo;
  }, [linkedChallenge, language]);
}

/**
 * Hook for translating an array of challenges
 */
export function useTranslatedChallenges(challenges: Challenge[]): Challenge[] {
  const { language } = useLanguageStore();

  return useMemo(() => {
    if (language === 'de') return challenges;

    return challenges.map((challenge) => {
      const translated = translateEntity(
        challenge as unknown as Record<string, unknown>,
        ['title', 'description', 'instructions', 'teamDescription'] as never[],
        language
      ) as unknown as Challenge;

      return {
        ...translated,
        organization: translateEntity(
          translated.organization as unknown as Record<string, unknown>,
          ['name', 'description', 'mission'] as never[],
          language
        ) as unknown as typeof translated.organization,
        location: translateLocation(translated.location as Record<string, unknown> | undefined, language),
        contact: translateContact(translated.contact as Record<string, unknown> | undefined, language),
      } as Challenge;
    });
  }, [challenges, language]);
}

/**
 * Hook for translating an array of community posts
 */
export function useTranslatedCommunityPosts(posts: CommunityPost[]): CommunityPost[] {
  const { language } = useLanguageStore();

  return useMemo(() => {
    if (language === 'de') return posts;

    return posts.map((post) => {
      const translated = translateEntity(
        post as unknown as Record<string, unknown>,
        ['title', 'content', 'badgeName'] as never[],
        language
      ) as unknown as CommunityPost;

      if (translated.linkedChallenge) {
        return {
          ...translated,
          linkedChallenge: translateLinkedChallenge(
            translated.linkedChallenge as unknown as Record<string, unknown>,
            language
          ) as unknown as LinkedChallengeInfo,
        };
      }

      return translated;
    });
  }, [posts, language]);
}
