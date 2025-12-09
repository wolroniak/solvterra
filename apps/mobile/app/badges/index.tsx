// Badges Collection Screen
// Shows all available badges and user's earned badges

import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, spacing } from '@/constants/theme';
import { useUserStore } from '@/store';
import { AVAILABLE_BADGES } from '@solvterra/shared';

// Map badge IDs to German names and emojis for display
// This ensures alignment with AVAILABLE_BADGES from shared package
const BADGE_DISPLAY_CONFIG: Record<string, { name: string; icon: string; description: string; category: string }> = {
  // Milestone Badges
  'first-challenge': { name: 'Erste Schritte', icon: '🌱', description: 'Erste Challenge abgeschlossen', category: 'Meilenstein' },
  'five-challenges': { name: 'Durchstarter', icon: '🤝', description: '5 Challenges abgeschlossen', category: 'Meilenstein' },
  'ten-challenges': { name: 'Auf dem Vormarsch', icon: '💪', description: '10 Challenges abgeschlossen', category: 'Meilenstein' },
  'twentyfive-challenges': { name: 'Champion', icon: '🏆', description: '25 Challenges abgeschlossen', category: 'Meilenstein' },

  // Category Badges
  'eco-warrior': { name: 'Öko-Krieger', icon: '🌿', description: '5 Umwelt-Challenges', category: 'Kategorie' },
  'social-butterfly': { name: 'Sozialheld', icon: '❤️', description: '5 Soziale Challenges', category: 'Kategorie' },
  'knowledge-seeker': { name: 'Wissenssuchend', icon: '📚', description: '5 Bildungs-Challenges', category: 'Kategorie' },
  'health-hero': { name: 'Gesundheitsheld', icon: '🏥', description: '5 Gesundheits-Challenges', category: 'Kategorie' },

  // Special Badges
  'early-bird': { name: 'Frühaufsteher', icon: '🌅', description: 'Challenge vor 8 Uhr abgeschlossen', category: 'Speziell' },
  'night-owl': { name: 'Nachteule', icon: '🦉', description: 'Challenge nach 22 Uhr abgeschlossen', category: 'Speziell' },
  'five-star': { name: 'Fünf Sterne', icon: '⭐', description: '5-Sterne-Bewertung erhalten', category: 'Speziell' },

  // Streak Badges
  'week-streak': { name: 'Wochenkrieger', icon: '🔥', description: '7 Tage in Folge aktiv', category: 'Streak' },
};

// Build ALL_BADGES from AVAILABLE_BADGES with German display info
const ALL_BADGES = AVAILABLE_BADGES.map(badge => {
  const displayConfig = BADGE_DISPLAY_CONFIG[badge.id];
  return {
    id: badge.id,
    name: displayConfig?.name || badge.name,
    icon: displayConfig?.icon || '🏅',
    description: displayConfig?.description || badge.description,
    category: displayConfig?.category || badge.category,
  };
});

export default function BadgesScreen() {
  const { user } = useUserStore();
  const earnedBadgeIds = user?.badges.map(b => b.badge.id) || [];

  const badgesByCategory = ALL_BADGES.reduce((acc, badge) => {
    if (!acc[badge.category]) acc[badge.category] = [];
    acc[badge.category].push(badge);
    return acc;
  }, {} as Record<string, typeof ALL_BADGES>);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={Colors.textPrimary} />
          </Pressable>
          <Text variant="headlineSmall" style={styles.title}>
            Badge-Sammlung
          </Text>
        </View>

        {/* Progress Summary */}
        <Surface style={styles.progressCard} elevation={1}>
          <View style={styles.progressContent}>
            <Text variant="displaySmall" style={styles.progressNumber}>
              {earnedBadgeIds.length}
            </Text>
            <Text variant="bodyMedium" style={styles.progressLabel}>
              von {ALL_BADGES.length} Badges
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${(earnedBadgeIds.length / ALL_BADGES.length) * 100}%` },
              ]}
            />
          </View>
        </Surface>

        {/* Badge Categories */}
        {Object.entries(badgesByCategory).map(([category, badges]) => (
          <View key={category} style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              {category}
            </Text>
            <View style={styles.badgeGrid}>
              {badges.map((badge) => {
                const isEarned = earnedBadgeIds.includes(badge.id);
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
        ))}

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
