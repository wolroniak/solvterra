// Badge Detail Modal
// Shows detailed information about a badge when tapped

import { useMemo, useCallback } from 'react';
import { View, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Text, Chip, ProgressBar, Portal, Modal } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, spacing } from '@/constants/theme';

// Types for badge criteria from Supabase
type CriteriaType = 'challenge_count' | 'category_count' | 'time_of_day' | 'streak_days' | 'rating_count';

interface BadgeDetailModalProps {
  badge: {
    id: string;
    name: string;
    icon: string;
    description: string;
    category: string;
    categoryLabel: string;
    xpBonus: number;
  } | null;
  progress: { current: number; required: number; completed: boolean } | null;
  earnedAt: string | null;
  visible: boolean;
  onClose: () => void;
}

// Category label translations for tips
const CATEGORY_MAP: Record<string, { de: string; en: string }> = {
  environment: { de: 'Umwelt', en: 'environment' },
  social: { de: 'Sozial', en: 'social' },
  education: { de: 'Bildungs', en: 'education' },
  health: { de: 'Gesundheits', en: 'health' },
  animals: { de: 'Tier', en: 'animal' },
  culture: { de: 'Kultur', en: 'culture' },
};

// Map badge IDs to criteria types
const BADGE_CRITERIA_MAP: Record<string, { type: CriteriaType; value: Record<string, unknown> }> = {
  'first-challenge': { type: 'challenge_count', value: { count: 1 } },
  'five-challenges': { type: 'challenge_count', value: { count: 5 } },
  'ten-challenges': { type: 'challenge_count', value: { count: 10 } },
  'twentyfive-challenges': { type: 'challenge_count', value: { count: 25 } },
  'eco-warrior': { type: 'category_count', value: { category: 'environment', count: 5 } },
  'social-butterfly': { type: 'category_count', value: { category: 'social', count: 5 } },
  'knowledge-seeker': { type: 'category_count', value: { category: 'education', count: 5 } },
  'health-hero': { type: 'category_count', value: { category: 'health', count: 5 } },
  'early-bird': { type: 'time_of_day', value: { before: '06:00' } },
  'night-owl': { type: 'time_of_day', value: { after: '22:00' } },
  'five-star': { type: 'rating_count', value: { rating: 5, count: 1 } },
  'week-streak': { type: 'streak_days', value: { days: 7 } },
};

export default function BadgeDetailModal({
  badge,
  progress,
  earnedAt,
  visible,
  onClose,
}: BadgeDetailModalProps) {
  const { i18n } = useTranslation('profile');
  const isGerman = i18n.language === 'de';

  // Generate contextual tip based on badge criteria
  const getTip = useCallback((): string | null => {
    if (!badge || !progress || progress.completed) return null;

    const remaining = progress.required - progress.current;
    const criteria = BADGE_CRITERIA_MAP[badge.id];
    if (!criteria) return null;

    switch (criteria.type) {
      case 'challenge_count':
        return isGerman
          ? `Schließe noch ${remaining} Challenge${remaining !== 1 ? 's' : ''} ab`
          : `Complete ${remaining} more challenge${remaining !== 1 ? 's' : ''}`;

      case 'category_count': {
        const category = criteria.value.category as string;
        const categoryLabel = CATEGORY_MAP[category];
        return isGerman
          ? `Schließe noch ${remaining} ${categoryLabel?.de || category}-Challenge${remaining !== 1 ? 's' : ''} ab`
          : `Complete ${remaining} more ${categoryLabel?.en || category} challenge${remaining !== 1 ? 's' : ''}`;
      }

      case 'time_of_day':
        if (criteria.value.before) {
          const time = (criteria.value.before as string).split(':')[0];
          return isGerman
            ? `Reiche eine Challenge vor ${time}:00 Uhr ein`
            : `Submit a challenge before ${time}:00`;
        } else if (criteria.value.after) {
          const time = (criteria.value.after as string).split(':')[0];
          return isGerman
            ? `Reiche eine Challenge nach ${time}:00 Uhr ein`
            : `Submit a challenge after ${time}:00`;
        }
        return null;

      case 'streak_days':
        return isGerman
          ? `Halte deine Serie noch ${remaining} Tag${remaining !== 1 ? 'e' : ''} aufrecht`
          : `Maintain your streak for ${remaining} more day${remaining !== 1 ? 's' : ''}`;

      case 'rating_count': {
        const rating = criteria.value.rating as number;
        return isGerman
          ? `Erhalte noch ${remaining} ${rating}-Sterne-Bewertung${remaining !== 1 ? 'en' : ''}`
          : `Receive ${remaining} more ${rating}-star rating${remaining !== 1 ? 's' : ''}`;
      }

      default:
        return null;
    }
  }, [badge, progress, isGerman]);

  // Format earned date
  const formattedDate = useMemo(() => {
    if (!earnedAt) return null;
    const date = new Date(earnedAt);
    return date.toLocaleDateString(isGerman ? 'de-DE' : 'en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }, [earnedAt, isGerman]);

  if (!badge) return null;

  const isEarned = progress?.completed ?? false;
  const tip = getTip();
  const progressPercent = progress ? progress.current / progress.required : 0;

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onClose}
        contentContainerStyle={styles.modalContainer}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Close Button */}
          <Pressable style={styles.closeButton} onPress={onClose}>
            <MaterialCommunityIcons name="close" size={24} color={Colors.textMuted} />
          </Pressable>

          {/* Badge Icon */}
          <View style={[styles.iconContainer, isEarned && styles.iconContainerEarned]}>
            <Text style={[styles.iconEmoji, !isEarned && styles.iconEmojiLocked]}>
              {badge.icon}
            </Text>
            {isEarned && <View style={styles.glowRing} />}
          </View>

          {/* Badge Name */}
          <Text variant="headlineSmall" style={styles.badgeName}>
            {badge.name}
          </Text>

          {/* Category Chip */}
          <Chip style={styles.categoryChip} textStyle={styles.categoryChipText} compact>
            {badge.categoryLabel}
          </Chip>

          {/* Status Section */}
          <View style={styles.statusSection}>
            {isEarned && formattedDate ? (
              <View style={styles.earnedStatus}>
                <MaterialCommunityIcons name="check-circle" size={20} color={Colors.success} />
                <Text style={styles.earnedText}>
                  {isGerman ? `Erlangt am ${formattedDate}` : `Earned on ${formattedDate}`}
                </Text>
              </View>
            ) : progress && progress.required > 1 ? (
              <View style={styles.progressSection}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>
                    {isGerman ? 'Fortschritt' : 'Progress'}
                  </Text>
                  <Text style={styles.progressCount}>
                    {progress.current}/{progress.required}
                  </Text>
                </View>
                <ProgressBar
                  progress={progressPercent}
                  color={Colors.accent[500]}
                  style={styles.progressBar}
                />
              </View>
            ) : !isEarned ? (
              <View style={styles.lockedStatus}>
                <MaterialCommunityIcons name="lock" size={20} color={Colors.textMuted} />
                <Text style={styles.lockedText}>
                  {isGerman ? 'Noch nicht erlangt' : 'Not yet earned'}
                </Text>
              </View>
            ) : null}
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Description */}
          <Text style={styles.description}>{badge.description}</Text>

          {/* XP Bonus */}
          <View style={styles.xpBonusContainer}>
            <Text style={styles.xpBonusIcon}>💎</Text>
            <Text style={styles.xpBonusText}>+{badge.xpBonus} XP Bonus</Text>
          </View>

          {/* Tip for unearned badges */}
          {!isEarned && tip && (
            <View style={styles.tipContainer}>
              <Text style={styles.tipIcon}>💡</Text>
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          )}
        </ScrollView>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: '#fff',
    marginHorizontal: spacing.lg,
    borderRadius: 24,
    maxHeight: '70%',
  },
  scrollContent: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    zIndex: 1,
    padding: spacing.xs,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    marginTop: spacing.md,
    position: 'relative',
  },
  iconContainerEarned: {
    backgroundColor: Colors.accent[100],
    borderWidth: 3,
    borderColor: Colors.accent[300],
  },
  glowRing: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
    borderColor: Colors.accent[200],
    opacity: 0.5,
  },
  iconEmoji: {
    fontSize: 48,
  },
  iconEmojiLocked: {
    opacity: 0.4,
  },
  badgeName: {
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  categoryChip: {
    backgroundColor: Colors.neutral[100],
    marginBottom: spacing.lg,
  },
  categoryChipText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  statusSection: {
    width: '100%',
    marginBottom: spacing.md,
  },
  earnedStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  earnedText: {
    fontSize: 14,
    color: Colors.success,
    fontWeight: '600',
  },
  lockedStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  lockedText: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  progressSection: {
    width: '100%',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  progressLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  progressCount: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.neutral[200],
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: Colors.neutral[200],
    marginVertical: spacing.md,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  xpBonusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: Colors.success + '15',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    marginBottom: spacing.md,
  },
  xpBonusIcon: {
    fontSize: 16,
  },
  xpBonusText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.success,
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: Colors.accent[50],
    padding: spacing.md,
    borderRadius: 12,
    width: '100%',
  },
  tipIcon: {
    fontSize: 18,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
});
