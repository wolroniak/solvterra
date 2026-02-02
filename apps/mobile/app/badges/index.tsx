// Badges Collection Screen
// Shows all available badges and user's earned badges

import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Colors, spacing } from '@/constants/theme';
import { useUserStore } from '@/store';
import { AVAILABLE_BADGES } from '@solvterra/shared';

// Map badge IDs to emojis for display
const BADGE_ICONS: Record<string, string> = {
  'first-challenge': '🌱',
  'five-challenges': '🤝',
  'ten-challenges': '💪',
  'twentyfive-challenges': '🏆',
  'eco-warrior': '🌿',
  'social-butterfly': '❤️',
  'knowledge-seeker': '📚',
  'health-hero': '🏥',
  'early-bird': '🌅',
  'night-owl': '🦉',
  'five-star': '⭐',
  'week-streak': '🔥',
};

// Category order for display
const CATEGORY_ORDER = ['milestone', 'category', 'special', 'streak'];

export default function BadgesScreen() {
  const { t } = useTranslation('profile');
  const { user } = useUserStore();
  const earnedBadgeIds = user?.badges.map(b => b.badge.id) || [];

  // Build badges with translated info
  const allBadges = AVAILABLE_BADGES.map(badge => ({
    id: badge.id,
    name: t(`badgeNames.${badge.id}`, { defaultValue: badge.name }),
    icon: BADGE_ICONS[badge.id] || '🏅',
    description: t(`badgeDescriptions.${badge.id}`, { defaultValue: badge.description }),
    category: badge.category,
    categoryLabel: t(`badgeCategories.${badge.category}`, { defaultValue: badge.category }),
  }));

  // Group by category
  const badgesByCategory = allBadges.reduce((acc, badge) => {
    if (!acc[badge.category]) acc[badge.category] = [];
    acc[badge.category].push(badge);
    return acc;
  }, {} as Record<string, typeof allBadges>);

  // Sort categories by defined order
  const sortedCategories = CATEGORY_ORDER.filter(cat => badgesByCategory[cat]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={Colors.textPrimary} />
          </Pressable>
          <Text variant="headlineSmall" style={styles.title}>
            {t('badgeCollection.title')}
          </Text>
        </View>

        {/* Progress Summary */}
        <Surface style={styles.progressCard} elevation={1}>
          <View style={styles.progressContent}>
            <Text variant="displaySmall" style={styles.progressNumber}>
              {allBadges.length} {/* DEMO: was earnedBadgeIds.length */}
            </Text>
            <Text variant="bodyMedium" style={styles.progressLabel}>
              {t('badgeCollection.progress', { total: allBadges.length })}
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: '100%' }, // DEMO: was (earnedBadgeIds.length / allBadges.length) * 100
              ]}
            />
          </View>
        </Surface>

        {/* Badge Categories */}
        {sortedCategories.map((category) => {
          const badges = badgesByCategory[category];
          const categoryLabel = badges[0]?.categoryLabel || category;
          return (
            <View key={category} style={styles.section}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                {categoryLabel}
              </Text>
              <View style={styles.badgeGrid}>
                {badges.map((badge) => {
                  const isEarned = true; // DEMO: was earnedBadgeIds.includes(badge.id);
                  return (
                    <Surface
                      key={badge.id}
                      style={[styles.badgeCard, !isEarned && styles.badgeCardLocked]}
                      elevation={isEarned ? 1 : 0}
                    >
                      <View
                        style={[
                          styles.badgeIcon,
                          isEarned
                            ? { backgroundColor: Colors.accent[100] }
                            : { backgroundColor: Colors.neutral[100] },
                        ]}
                      >
                        <Text style={[styles.badgeEmoji, !isEarned && styles.badgeEmojiLocked]}>
                          {badge.icon}
                        </Text>
                        {!isEarned && (
                          <View style={styles.lockOverlay}>
                            <MaterialCommunityIcons name="lock" size={16} color={Colors.textMuted} />
                          </View>
                        )}
                      </View>
                      <Text
                        variant="labelMedium"
                        style={[styles.badgeName, !isEarned && styles.badgeNameLocked]}
                        numberOfLines={1}
                      >
                        {badge.name}
                      </Text>
                      <Text
                        variant="bodySmall"
                        style={styles.badgeDescription}
                        numberOfLines={2}
                      >
                        {badge.description}
                      </Text>
                    </Surface>
                  );
                })}
              </View>
            </View>
          );
        })}

        <View style={styles.footer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: '#fff',
  },
  backButton: {
    marginRight: spacing.md,
  },
  title: {
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  progressCard: {
    margin: spacing.lg,
    marginTop: spacing.md,
    padding: spacing.lg,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  progressContent: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.md,
  },
  progressNumber: {
    fontWeight: '700',
    color: Colors.accent[600],
  },
  progressLabel: {
    color: Colors.textSecondary,
    marginLeft: spacing.xs,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.neutral[200],
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.accent[500],
    borderRadius: 4,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: spacing.md,
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  badgeCard: {
    width: '31%',
    padding: spacing.sm,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  badgeCardLocked: {
    backgroundColor: Colors.neutral[50],
  },
  badgeIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
    position: 'relative',
  },
  badgeEmoji: {
    fontSize: 28,
  },
  badgeEmojiLocked: {
    opacity: 0.3,
  },
  lockOverlay: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  badgeName: {
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 2,
  },
  badgeNameLocked: {
    color: Colors.textMuted,
  },
  badgeDescription: {
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 14,
  },
  footer: {
    height: spacing.xxl,
  },
});
