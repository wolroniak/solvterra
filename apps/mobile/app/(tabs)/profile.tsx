// Profile Screen
// User stats, badges, and settings

import { View, StyleSheet, ScrollView, Image, Pressable } from 'react-native';
import { Text, Surface, Button, ProgressBar } from 'react-native-paper';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, spacing } from '@/constants/theme';
import { useUserStore } from '@/store';

// Badge display config for German names and emojis
const BADGE_DISPLAY_CONFIG: Record<string, { name: string; icon: string }> = {
  'first-challenge': { name: 'Erste Schritte', icon: '🌱' },
  'five-challenges': { name: 'Durchstarter', icon: '🤝' },
  'ten-challenges': { name: 'Auf Kurs', icon: '💪' },
  'twentyfive-challenges': { name: 'Champion', icon: '🏆' },
  'eco-warrior': { name: 'Öko-Krieger', icon: '🌿' },
  'social-butterfly': { name: 'Sozialheld', icon: '❤️' },
  'knowledge-seeker': { name: 'Wissens...', icon: '📚' },
  'health-hero': { name: 'Gesund...', icon: '🏥' },
  'early-bird': { name: 'Frühauf...', icon: '🌅' },
  'night-owl': { name: 'Nachteule', icon: '🦉' },
  'five-star': { name: 'Fünf Sterne', icon: '⭐' },
  'week-streak': { name: 'Wochen...', icon: '🔥' },
};

const LEVELS = [
  { level: 1, name: 'Starter', minXp: 0, maxXp: 100 },
  { level: 2, name: 'Helper', minXp: 100, maxXp: 300 },
  { level: 3, name: 'Supporter', minXp: 300, maxXp: 600 },
  { level: 4, name: 'Champion', minXp: 600, maxXp: 1000 },
  { level: 5, name: 'Legend', minXp: 1000, maxXp: 2000 },
];

export default function ProfileScreen() {
  const { user, logout } = useUserStore();

  if (!user) return null;

  // Calculate level info
  const currentLevelInfo = LEVELS.find(
    l => user.xpTotal >= l.minXp && user.xpTotal < l.maxXp
  ) || LEVELS[LEVELS.length - 1];

  const nextLevelInfo = LEVELS.find(l => l.level === currentLevelInfo.level + 1);
  const xpInCurrentLevel = user.xpTotal - currentLevelInfo.minXp;
  const xpNeededForNextLevel = currentLevelInfo.maxXp - currentLevelInfo.minXp;
  const levelProgress = xpInCurrentLevel / xpNeededForNextLevel;

  const handleLogout = () => {
    logout();
    router.replace('/(auth)/welcome');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.header}>
          <Image
            source={{ uri: user.avatarUrl }}
            style={styles.avatar}
          />
          <Text variant="headlineSmall" style={styles.name}>
            {user.name}
          </Text>
          <Text variant="bodyMedium" style={styles.email}>
            {user.email}
          </Text>

          {/* Level Badge */}
          <View style={styles.levelBadge}>
            <MaterialCommunityIcons
              name="shield-star"
              size={20}
              color={Colors.primary[600]}
            />
            <Text style={styles.levelText}>
              Level {currentLevelInfo.level} - {currentLevelInfo.name}
            </Text>
          </View>
        </View>

        {/* XP Progress Card */}
        <Surface style={styles.xpCard} elevation={1}>
          <View style={styles.xpHeader}>
            <Text variant="titleMedium" style={styles.xpTitle}>
              Dein Fortschritt
            </Text>
            <View style={styles.xpBadge}>
              <MaterialCommunityIcons name="star" size={16} color={Colors.accent[500]} />
              <Text style={styles.xpValue}>{user.xpTotal} XP</Text>
            </View>
          </View>

          <ProgressBar
            progress={levelProgress}
            color={Colors.primary[600]}
            style={styles.progressBar}
          />

          <View style={styles.xpLabels}>
            <Text variant="bodySmall" style={styles.xpLabelLeft}>
              {xpInCurrentLevel} / {xpNeededForNextLevel} XP
            </Text>
            {nextLevelInfo && (
              <Text variant="bodySmall" style={styles.xpLabelRight}>
                Nächstes Level: {nextLevelInfo.name}
              </Text>
            )}
          </View>
        </Surface>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <Surface style={styles.statCard} elevation={1}>
            <MaterialCommunityIcons
              name="check-circle-outline"
              size={28}
              color={Colors.success}
            />
            <Text variant="headlineSmall" style={styles.statValue}>
              {user.completedChallenges}
            </Text>
            <Text variant="bodySmall" style={styles.statLabel}>
              Challenges
            </Text>
          </Surface>

          <Surface style={styles.statCard} elevation={1}>
            <MaterialCommunityIcons
              name="clock-outline"
              size={28}
              color={Colors.primary[600]}
            />
            <Text variant="headlineSmall" style={styles.statValue}>
              {user.hoursContributed}h
            </Text>
            <Text variant="bodySmall" style={styles.statLabel}>
              Beigetragen
            </Text>
          </Surface>

          <Surface style={styles.statCard} elevation={1}>
            <MaterialCommunityIcons
              name="medal-outline"
              size={28}
              color={Colors.accent[500]}
            />
            <Text variant="headlineSmall" style={styles.statValue}>
              {user.badges.length}
            </Text>
            <Text variant="bodySmall" style={styles.statLabel}>
              Badges
            </Text>
          </Surface>
        </View>

        {/* Badges Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Meine Badges
            </Text>
            <Pressable onPress={() => router.push('/badges')}>
              <Text style={styles.seeAll}>Alle anzeigen</Text>
            </Pressable>
          </View>

          {user.badges.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.badgesScroll}
            >
              {user.badges.map((userBadge, index) => {
                const badgeId = userBadge.badge?.id || '';
                const displayConfig = BADGE_DISPLAY_CONFIG[badgeId];
                const displayName = displayConfig?.name || userBadge.badge?.name || 'Badge';
                const displayIcon = displayConfig?.icon || '🏅';

                return (
                  <Surface key={badgeId || `badge-${index}`} style={styles.badgeCard} elevation={1}>
                    <View style={[styles.badgeIcon, { backgroundColor: `${Colors.accent[500]}15` }]}>
                      <Text style={styles.badgeEmoji}>{displayIcon}</Text>
                    </View>
                    <Text variant="labelSmall" style={styles.badgeName} numberOfLines={2}>
                      {displayName}
                    </Text>
                  </Surface>
                );
              })}
            </ScrollView>
          ) : (
            <View style={styles.noBadges}>
              <MaterialCommunityIcons
                name="medal-outline"
                size={32}
                color={Colors.neutral[300]}
              />
              <Text variant="bodySmall" style={styles.noBadgesText}>
                Noch keine Badges verdient
              </Text>
            </View>
          )}
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Einstellungen
          </Text>

          <Surface style={styles.settingsCard} elevation={1}>
            <Pressable style={styles.settingsItem}>
              <MaterialCommunityIcons
                name="bell-outline"
                size={22}
                color={Colors.textPrimary}
              />
              <Text variant="bodyLarge" style={styles.settingsText}>
                Benachrichtigungen
              </Text>
              <MaterialCommunityIcons
                name="chevron-right"
                size={22}
                color={Colors.textMuted}
              />
            </Pressable>

            <View style={styles.settingsDivider} />

            <Pressable style={styles.settingsItem}>
              <MaterialCommunityIcons
                name="account-outline"
                size={22}
                color={Colors.textPrimary}
              />
              <Text variant="bodyLarge" style={styles.settingsText}>
                Konto verwalten
              </Text>
              <MaterialCommunityIcons
                name="chevron-right"
                size={22}
                color={Colors.textMuted}
              />
            </Pressable>

            <View style={styles.settingsDivider} />

            <Pressable style={styles.settingsItem}>
              <MaterialCommunityIcons
                name="shield-check-outline"
                size={22}
                color={Colors.textPrimary}
              />
              <Text variant="bodyLarge" style={styles.settingsText}>
                Datenschutz
              </Text>
              <MaterialCommunityIcons
                name="chevron-right"
                size={22}
                color={Colors.textMuted}
              />
            </Pressable>

            <View style={styles.settingsDivider} />

            <Pressable style={styles.settingsItem}>
              <MaterialCommunityIcons
                name="help-circle-outline"
                size={22}
                color={Colors.textPrimary}
              />
              <Text variant="bodyLarge" style={styles.settingsText}>
                Hilfe & FAQ
              </Text>
              <MaterialCommunityIcons
                name="chevron-right"
                size={22}
                color={Colors.textMuted}
              />
            </Pressable>
          </Surface>
        </View>

        {/* Logout Button */}
        <View style={styles.logoutContainer}>
          <Button
            mode="outlined"
            onPress={handleLogout}
            style={styles.logoutButton}
            textColor={Colors.error}
            icon="logout"
          >
            Abmelden
          </Button>
        </View>

        {/* App Version */}
        <Text variant="bodySmall" style={styles.version}>
          SolvTerra v1.0.0 (Demo)
        </Text>
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
    alignItems: 'center',
    paddingVertical: spacing.xl,
    backgroundColor: '#fff',
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.neutral[200],
    marginBottom: spacing.md,
  },
  name: {
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  email: {
    color: Colors.textSecondary,
    marginTop: 2,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary[50],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  levelText: {
    color: Colors.primary[700],
    fontWeight: '600',
    fontSize: 13,
  },
  xpCard: {
    margin: spacing.lg,
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  xpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  xpTitle: {
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  xpValue: {
    color: Colors.accent[600],
    fontWeight: '700',
    fontSize: 14,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.neutral[200],
  },
  xpLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  xpLabelLeft: {
    color: Colors.textMuted,
  },
  xpLabelRight: {
    color: Colors.primary[600],
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  statValue: {
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: spacing.xs,
  },
  statLabel: {
    color: Colors.textMuted,
    marginTop: 2,
  },
  section: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  seeAll: {
    color: Colors.primary[600],
    fontWeight: '500',
    fontSize: 14,
  },
  badgesScroll: {
    gap: spacing.sm,
    paddingBottom: spacing.xs, // Extra padding to prevent cutoff
  },
  badgeCard: {
    alignItems: 'center',
    padding: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md, // Extra bottom padding
    borderRadius: 12,
    backgroundColor: '#fff',
    width: 88, // Slightly wider for better text display
    minHeight: 100, // Minimum height to prevent cutoff
  },
  badgeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  badgeEmoji: {
    fontSize: 24,
  },
  badgeName: {
    color: Colors.textSecondary,
    textAlign: 'center',
    fontSize: 11, // Slightly smaller for better fit
    lineHeight: 14,
  },
  noBadges: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  noBadgesText: {
    color: Colors.textMuted,
    marginTop: spacing.xs,
  },
  settingsCard: {
    borderRadius: 12,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
  },
  settingsText: {
    flex: 1,
    color: Colors.textPrimary,
  },
  settingsDivider: {
    height: 1,
    backgroundColor: Colors.neutral[100],
    marginLeft: spacing.md + 22 + spacing.md,
  },
  logoutContainer: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  logoutButton: {
    borderColor: Colors.error,
    borderRadius: 12,
  },
  version: {
    textAlign: 'center',
    color: Colors.textMuted,
    paddingBottom: spacing.xxl,
  },
});
