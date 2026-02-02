// Notification Settings Screen
// Allows users to manage their notification preferences

import { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { Text, Switch, Divider } from 'react-native-paper';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Colors, spacing } from '@/constants/theme';
import { useUserStore } from '@/store';
import { supabase } from '@/lib/supabase';

// Default preferences matching the database schema
const DEFAULT_PREFERENCES = {
  submission_reviewed: true,
  new_challenges: true,
  challenge_reminders: true,
  xp_milestones: true,
  badge_earned: true,
  streak_alerts: true,
  community_likes: false,
  community_comments: true,
  weekly_digest: true,
};

type NotificationPreferences = typeof DEFAULT_PREFERENCES;

export default function NotificationSettingsScreen() {
  const { t } = useTranslation('profile');
  const { user } = useUserStore();
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_PREFERENCES);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load preferences from database
  const loadPreferences = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows returned, which is fine for new users
        console.error('Failed to load notification preferences:', error);
      }

      if (data) {
        setPreferences({
          submission_reviewed: data.submission_reviewed ?? DEFAULT_PREFERENCES.submission_reviewed,
          new_challenges: data.new_challenges ?? DEFAULT_PREFERENCES.new_challenges,
          challenge_reminders: data.challenge_reminders ?? DEFAULT_PREFERENCES.challenge_reminders,
          xp_milestones: data.xp_milestones ?? DEFAULT_PREFERENCES.xp_milestones,
          badge_earned: data.badge_earned ?? DEFAULT_PREFERENCES.badge_earned,
          streak_alerts: data.streak_alerts ?? DEFAULT_PREFERENCES.streak_alerts,
          community_likes: data.community_likes ?? DEFAULT_PREFERENCES.community_likes,
          community_comments: data.community_comments ?? DEFAULT_PREFERENCES.community_comments,
          weekly_digest: data.weekly_digest ?? DEFAULT_PREFERENCES.weekly_digest,
        });
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  // Update a single preference
  const updatePreference = useCallback(async (key: keyof NotificationPreferences, value: boolean) => {
    if (!user) return;

    // Optimistically update the UI
    setPreferences(prev => ({ ...prev, [key]: value }));
    setIsSaving(true);

    try {
      // Upsert the preference
      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user.id,
          [key]: value,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id',
        });

      if (error) {
        console.error('Failed to update preference:', error);
        // Revert on error
        setPreferences(prev => ({ ...prev, [key]: !value }));
      }
    } catch (error) {
      console.error('Error updating preference:', error);
      // Revert on error
      setPreferences(prev => ({ ...prev, [key]: !value }));
    } finally {
      setIsSaving(false);
    }
  }, [user]);

  // Render a toggle item
  const renderToggleItem = (
    key: keyof NotificationPreferences,
    titleKey: string,
    descriptionKey: string,
    icon: string
  ) => (
    <View style={styles.toggleItem}>
      <View style={styles.toggleIcon}>
        <MaterialCommunityIcons
          name={icon as keyof typeof MaterialCommunityIcons.glyphMap}
          size={22}
          color={Colors.primary[600]}
        />
      </View>
      <View style={styles.toggleContent}>
        <Text variant="bodyLarge" style={styles.toggleTitle}>
          {t(titleKey)}
        </Text>
        <Text variant="bodySmall" style={styles.toggleDescription}>
          {t(descriptionKey)}
        </Text>
      </View>
      <Switch
        value={preferences[key]}
        onValueChange={(value) => updatePreference(key, value)}
        color={Colors.primary[600]}
        disabled={isLoading}
      />
    </View>
  );

  if (!user) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={Colors.textPrimary} />
        </Pressable>
        <Text variant="headlineSmall" style={styles.title}>
          {t('notifications.title')}
        </Text>
        {isSaving && (
          <ActivityIndicator size="small" color={Colors.primary[600]} style={styles.savingIndicator} />
        )}
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary[600]} />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Challenge Updates Section */}
          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              {t('notifications.challengeUpdates')}
            </Text>
            <View style={styles.sectionContent}>
              {renderToggleItem(
                'submission_reviewed',
                'notifications.submissionReviewed.title',
                'notifications.submissionReviewed.description',
                'check-circle-outline'
              )}
              <Divider style={styles.divider} />
              {renderToggleItem(
                'challenge_reminders',
                'notifications.challengeReminders.title',
                'notifications.challengeReminders.description',
                'clock-outline'
              )}
            </View>
          </View>

          {/* Discovery Section */}
          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              {t('notifications.discovery')}
            </Text>
            <View style={styles.sectionContent}>
              {renderToggleItem(
                'new_challenges',
                'notifications.newChallenges.title',
                'notifications.newChallenges.description',
                'magnify'
              )}
            </View>
          </View>

          {/* Achievements Section */}
          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              {t('notifications.achievements')}
            </Text>
            <View style={styles.sectionContent}>
              {renderToggleItem(
                'xp_milestones',
                'notifications.levelUps.title',
                'notifications.levelUps.description',
                'star-outline'
              )}
              <Divider style={styles.divider} />
              {renderToggleItem(
                'badge_earned',
                'notifications.badgesEarned.title',
                'notifications.badgesEarned.description',
                'medal-outline'
              )}
              <Divider style={styles.divider} />
              {renderToggleItem(
                'streak_alerts',
                'notifications.streakAlerts.title',
                'notifications.streakAlerts.description',
                'fire'
              )}
            </View>
          </View>

          {/* Community Section */}
          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              {t('notifications.community')}
            </Text>
            <View style={styles.sectionContent}>
              {renderToggleItem(
                'community_comments',
                'notifications.comments.title',
                'notifications.comments.description',
                'comment-outline'
              )}
              <Divider style={styles.divider} />
              {renderToggleItem(
                'community_likes',
                'notifications.likes.title',
                'notifications.likes.description',
                'heart-outline'
              )}
            </View>
          </View>

          {/* Summaries Section */}
          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              {t('notifications.summaries')}
            </Text>
            <View style={styles.sectionContent}>
              {renderToggleItem(
                'weekly_digest',
                'notifications.weeklyDigest.title',
                'notifications.weeklyDigest.description',
                'email-newsletter'
              )}
            </View>
          </View>

          <View style={styles.footer} />
        </ScrollView>
      )}
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
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.neutral[200],
  },
  backButton: {
    marginRight: spacing.md,
  },
  title: {
    flex: 1,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  savingIndicator: {
    marginLeft: spacing.sm,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingTop: spacing.md,
  },
  section: {
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: spacing.sm,
  },
  sectionContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  toggleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
  },
  toggleIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleContent: {
    flex: 1,
  },
  toggleTitle: {
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  toggleDescription: {
    color: Colors.textMuted,
    marginTop: 2,
  },
  divider: {
    marginLeft: spacing.md + 40 + spacing.md, // Align with text, not icon
  },
  footer: {
    height: spacing.xxl,
  },
});
