// Challenge Card Component
// Displays a challenge in the feed with micro-volunteering emphasis

import { View, StyleSheet, Pressable, Image, Animated } from 'react-native';
import { Text, Chip, Surface } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Colors, spacing, shadows } from '@/constants/theme';
import { useLanguageStore } from '@/store';
import { CATEGORIES, type ChallengeCategory } from '@solvterra/shared';
import type { Challenge } from '@solvterra/shared';
import { useRef } from 'react';

interface ChallengeCardProps {
  challenge: Challenge;
  onPress: () => void;
}

// Map category IDs to Material Community Icons
const CATEGORY_ICONS: Record<string, string> = {
  environment: 'leaf',
  social: 'hand-heart',
  education: 'book-open-variant',
  health: 'heart-pulse',
  animals: 'paw',
  culture: 'palette',
  other: 'dots-horizontal',
};

// Duration color coding for micro-volunteering emphasis
const DURATION_COLORS: Record<number, { bg: string; text: string; accent: string }> = {
  5: { bg: '#dcfce7', text: '#166534', accent: '#22c55e' },   // Green - super quick
  10: { bg: '#dbeafe', text: '#1e40af', accent: '#3b82f6' },  // Blue - quick
  15: { bg: '#f3e8ff', text: '#6b21a8', accent: '#a855f7' },  // Purple - moderate
  30: { bg: '#ffedd5', text: '#c2410c', accent: '#f97316' },  // Orange - longer
};

// Get category config from shared constants
const getCategoryConfig = (categoryId: string) => {
  const category = CATEGORIES.find(c => c.id === categoryId);
  return {
    icon: CATEGORY_ICONS[categoryId] || 'dots-horizontal',
    color: category?.color || Colors.neutral[500],
  };
};

// Get duration styling (label will be added via translation)
const getDurationConfig = (minutes: number) => {
  const colors = DURATION_COLORS[minutes] || DURATION_COLORS[30];
  return {
    colors,
    isQuickWin: minutes <= 10,
    quickLevel: minutes <= 5 ? 'superQuick' : minutes <= 10 ? 'quick' : null,
  };
};

export default function ChallengeCard({ challenge, onPress }: ChallengeCardProps) {
  const { t } = useTranslation('challenges');
  const { language } = useLanguageStore();
  const categoryConfig = getCategoryConfig(challenge.category);
  const durationConfig = getDurationConfig(challenge.durationMinutes);
  const spotsLeft = challenge.maxParticipants - challenge.currentParticipants;
  const isAlmostFull = spotsLeft <= 5;

  // Get category label based on language
  const getCategoryLabel = () => {
    const category = CATEGORIES.find(c => c.id === challenge.category);
    if (!category) return t('categories.other');
    return language === 'de' ? category.labelDe : category.label;
  };

  // Get quick win label
  const getQuickWinLabel = () => {
    if (durationConfig.quickLevel === 'superQuick') return t('card.superQuick');
    if (durationConfig.quickLevel === 'quick') return t('card.quick');
    return null;
  };

  // Animation for press feedback
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Surface style={styles.card} elevation={1}>
          {/* Image */}
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: challenge.imageUrl }}
              style={styles.image}
              resizeMode="cover"
            />

            {/* Quick Win Badge - prominent for 5-10 min challenges */}
            {durationConfig.isQuickWin && getQuickWinLabel() && (
              <View style={styles.quickWinBadge}>
                <MaterialCommunityIcons name="lightning-bolt" size={12} color="#fbbf24" />
                <Text style={styles.quickWinText}>{getQuickWinLabel()}</Text>
              </View>
            )}

            {/* Enhanced Duration Badge - color coded */}
            <View style={[
              styles.durationBadge,
              { backgroundColor: durationConfig.colors.bg }
            ]}>
              <MaterialCommunityIcons
                name="clock-fast"
                size={16}
                color={durationConfig.colors.accent}
              />
              <Text style={[styles.durationText, { color: durationConfig.colors.text }]}>
                {t('durations.minutes', { count: challenge.durationMinutes })}
              </Text>
            </View>

            {/* Category Badge */}
            <View style={[styles.categoryBadge, { backgroundColor: categoryConfig.color }]}>
              <MaterialCommunityIcons
                name={categoryConfig.icon as any}
                size={14}
                color="#fff"
              />
              <Text style={styles.categoryText}>{getCategoryLabel()}</Text>
            </View>

            {/* Team Challenge Badge */}
            {challenge.isMultiPerson && (
              <View style={styles.teamBadge}>
                <MaterialCommunityIcons name="account-group" size={14} color="#fff" />
                <Text style={styles.teamBadgeText}>
                  {t('card.teamSize', { min: challenge.minTeamSize, max: challenge.maxTeamSize })}
                </Text>
              </View>
            )}
          </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Organization */}
          <View style={styles.orgRow}>
            <Image
              source={{ uri: challenge.organization.logoUrl }}
              style={styles.orgLogo}
            />
            <Text variant="bodySmall" style={styles.orgName}>
              {challenge.organization.name}
            </Text>
            {challenge.organization.verified && (
              <MaterialCommunityIcons
                name="check-decagram"
                size={14}
                color={Colors.primary[600]}
              />
            )}
          </View>

          {/* Title */}
          <Text variant="titleMedium" style={styles.title} numberOfLines={2}>
            {challenge.title}
          </Text>

          {/* Description */}
          <Text variant="bodyMedium" style={styles.description} numberOfLines={2}>
            {challenge.description}
          </Text>

          {/* Footer */}
          <View style={styles.footer}>
            {/* XP Reward */}
            <View style={styles.xpBadge}>
              <MaterialCommunityIcons
                name="star"
                size={16}
                color={Colors.accent[500]}
              />
              <Text style={styles.xpText}>+{challenge.xpReward} XP</Text>
            </View>

            {/* Team indicator in footer */}
            {challenge.isMultiPerson && (
              <View style={styles.teamFooterBadge}>
                <MaterialCommunityIcons
                  name="account-group"
                  size={14}
                  color={Colors.secondary[600]}
                />
                <Text style={styles.teamFooterText}>{t('card.team')}</Text>
              </View>
            )}

            {/* Verification Method */}
            <View style={styles.verificationBadge}>
              <MaterialCommunityIcons
                name={
                  challenge.verificationMethod === 'photo'
                    ? 'camera'
                    : challenge.verificationMethod === 'text'
                    ? 'text-box-outline'
                    : 'check-decagram'
                }
                size={14}
                color={Colors.textMuted}
              />
            </View>

            {/* Type */}
            <Chip
              mode="flat"
              compact
              style={styles.typeChip}
              textStyle={styles.typeChipText}
            >
              {challenge.type === 'digital' ? t('filters.digital') : t('filters.onsite')}
            </Chip>

            {/* Spots */}
            {isAlmostFull && !challenge.isMultiPerson && (
              <Text style={styles.spotsText}>
                {t('card.spotsLeft', { count: spotsLeft })}
              </Text>
            )}
          </View>
        </View>
        </Surface>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  imageContainer: {
    height: 160,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  quickWinBadge: {
    position: 'absolute',
    bottom: spacing.sm,
    left: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.85)',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  quickWinText: {
    color: '#fbbf24',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  durationBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  durationText: {
    fontSize: 13,
    fontWeight: '700',
  },
  categoryBadge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 4,
  },
  categoryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  teamBadge: {
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.secondary[600],
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  teamBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  content: {
    padding: spacing.md,
  },
  orgRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  orgLogo: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.neutral[100],
  },
  orgName: {
    color: Colors.textSecondary,
    flex: 1,
  },
  title: {
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: spacing.xs,
  },
  description: {
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accent[50],
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  xpText: {
    color: Colors.accent[700],
    fontSize: 12,
    fontWeight: '600',
  },
  typeChip: {
    backgroundColor: Colors.neutral[100],
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeChipText: {
    fontSize: 11,
    lineHeight: 14,
    marginHorizontal: 0,
    marginVertical: 0,
    paddingVertical: 0,
    textAlignVertical: 'center',
  },
  spotsText: {
    color: Colors.error,
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 'auto',
  },
  teamFooterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.secondary[50],
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  teamFooterText: {
    color: Colors.secondary[700],
    fontSize: 11,
    fontWeight: '600',
  },
  verificationBadge: {
    padding: 4,
  },
});
