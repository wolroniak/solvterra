// Profile Screen
// User stats, badges, and settings

import { useState, useCallback, useRef } from 'react';
import { View, StyleSheet, ScrollView, Image, Pressable, Dimensions, Alert, ActivityIndicator } from 'react-native';
import { Text, Surface, Button, ProgressBar } from 'react-native-paper';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import * as ImagePicker from 'expo-image-picker';
import { Colors, spacing } from '@/constants/theme';
import { useUserStore, useLanguageStore, useCommunityStore } from '@/store';
import { supabase } from '@/lib/supabase';
import type { CommunityPost } from '@solvterra/shared';
import { XP_LEVELS } from '@solvterra/shared';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_GAP = 2;
const GRID_COLUMNS = 3;
const TILE_SIZE = (SCREEN_WIDTH - GRID_GAP * (GRID_COLUMNS - 1)) / GRID_COLUMNS;

// Badge emoji config (names come from i18n)
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

const LEVEL_KEYS = Object.keys(XP_LEVELS) as (keyof typeof XP_LEVELS)[];
const LEVELS = LEVEL_KEYS.map((key, i) => ({
  level: i + 1,
  key,
  minXp: XP_LEVELS[key],
  maxXp: LEVEL_KEYS[i + 1] ? XP_LEVELS[LEVEL_KEYS[i + 1]] : XP_LEVELS[key] * 2,
}));

type ProfileTab = 'posts' | 'badges';

export default function ProfileScreen() {
  const { t } = useTranslation('profile');
  const { user, logout, updateProfile } = useUserStore();
  const { language, setLanguage } = useLanguageStore();
  const { deletePost } = useCommunityStore();

  const [activeTab, setActiveTab] = useState<ProfileTab>('posts');
  const [userPosts, setUserPosts] = useState<CommunityPost[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Use ref to prevent multiple simultaneous loads and track if initial load done
  const isLoadingRef = useRef(false);
  const hasLoadedRef = useRef(false);

  const loadUserPosts = useCallback(async () => {
    // Get user from store to avoid dependency on user object reference
    const currentUser = useUserStore.getState().user;
    if (!currentUser || isLoadingRef.current) return;
    isLoadingRef.current = true;
    setIsLoadingPosts(true);
    try {
      const posts = await useCommunityStore.getState().getUserPosts(currentUser.id);
      setUserPosts(posts);
    } finally {
      setIsLoadingPosts(false);
      isLoadingRef.current = false;
    }
  }, []); // No dependencies - accesses store directly

  // Reload data when the profile tab is focused
  // Sync badges only once per focus (not on every re-render)
  useFocusEffect(
    useCallback(() => {
      const currentUser = useUserStore.getState().user;
      if (!currentUser) return;

      // Only sync badges/stats once when screen is focused
      if (!hasLoadedRef.current) {
        hasLoadedRef.current = true;
        // Run sync in background, don't await to prevent blocking
        useUserStore.getState().refreshStats();
        useUserStore.getState().syncBadges();
      }

      // Load posts if on posts tab
      if (activeTab === 'posts') {
        loadUserPosts();
      }

      // Reset on unfocus
      return () => {
        hasLoadedRef.current = false;
      };
    }, [activeTab, loadUserPosts])
  );

  const handleAvatarPress = useCallback(async () => {
    if (!user) return;

    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Berechtigung benötigt', 'Bitte erlaube den Zugriff auf deine Fotos, um ein Profilbild auszuwählen.');
      return;
    }

    // Launch picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (result.canceled || !result.assets?.[0]) return;

    setIsUploadingAvatar(true);
    try {
      const asset = result.assets[0];
      const fileName = `${user.id}.jpg`;

      // Fetch the image as a blob and convert to ArrayBuffer
      const response = await fetch(asset.uri);
      const blob = await response.blob();
      const arrayBuffer = await new Response(blob).arrayBuffer();

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, arrayBuffer, {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (uploadError) {
        Alert.alert('Upload fehlgeschlagen', uploadError.message);
        return;
      }

      // Get the public URL with cache-busting timestamp
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Add timestamp to bust cache when image is updated
      const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;

      // Update users table with cache-busted URL
      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar: publicUrl })
        .eq('id', user.id);

      if (updateError) {
        console.error('Failed to update user avatar in DB:', updateError);
        Alert.alert('Fehler', 'Avatar konnte nicht gespeichert werden.');
        return;
      }

      // Update local state
      updateProfile({ avatarUrl: publicUrl });
    } catch (error) {
      console.error('Avatar upload failed:', error);
      Alert.alert('Fehler', 'Profilbild konnte nicht hochgeladen werden.');
    } finally {
      setIsUploadingAvatar(false);
    }
  }, [user, updateProfile]);

  const handleDeletePost = useCallback((post: CommunityPost) => {
    Alert.alert(
      'Beitrag löschen',
      'Möchtest du diesen Beitrag wirklich löschen?',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Löschen',
          style: 'destructive',
          onPress: async () => {
            await deletePost(post.id);
            setUserPosts(prev => prev.filter(p => p.id !== post.id));
          },
        },
      ]
    );
  }, [deletePost]);

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

  const handleLanguageToggle = () => {
    setLanguage(language === 'de' ? 'en' : 'de');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Title Bar */}
      <View style={styles.titleBar}>
        <Text style={styles.titleText}>{t('title', { defaultValue: 'Profil' })}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.header}>
          <Pressable onPress={handleAvatarPress} style={styles.avatarContainer}>
            <Image
              source={{
                uri: user.avatarUrl ||
                     `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}&backgroundColor=b6e3f4`
              }}
              style={styles.avatar}
            />
            {isUploadingAvatar ? (
              <View style={styles.avatarOverlay}>
                <ActivityIndicator size="small" color="#fff" />
              </View>
            ) : (
              <View style={styles.avatarEditIcon}>
                <MaterialCommunityIcons name="camera" size={16} color="#fff" />
              </View>
            )}
          </Pressable>
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
              {t('level')} {currentLevelInfo.level} - {t(`levels.${currentLevelInfo.key}`)}
            </Text>
          </View>
        </View>

        {/* XP Progress Card */}
        <Surface style={styles.xpCard} elevation={1}>
          <View style={styles.xpHeader}>
            <Text variant="titleMedium" style={styles.xpTitle}>
              {t('progress.title')}
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
                {t('progress.nextLevel', { level: t(`levels.${nextLevelInfo.key}`) })}
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
              {t('stats.challenges')}
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
              {t('stats.contributed')}
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
              {t('stats.badges')}
            </Text>
          </Surface>
        </View>

        {/* Tab Switcher: Posts / Badges */}
        <View style={styles.tabSwitcher}>
          <Pressable
            style={[styles.tab, activeTab === 'posts' && styles.tabActive]}
            onPress={() => setActiveTab('posts')}
          >
            <MaterialCommunityIcons
              name="grid"
              size={24}
              color={activeTab === 'posts' ? Colors.textPrimary : Colors.textMuted}
            />
          </Pressable>
          <Pressable
            style={[styles.tab, activeTab === 'badges' && styles.tabActive]}
            onPress={() => setActiveTab('badges')}
          >
            <MaterialCommunityIcons
              name="medal-outline"
              size={24}
              color={activeTab === 'badges' ? Colors.textPrimary : Colors.textMuted}
            />
          </Pressable>
        </View>

        {/* Posts Grid */}
        {activeTab === 'posts' && (
          <View>
            {isLoadingPosts ? (
              <View style={styles.postsLoading}>
                <ActivityIndicator size="small" color={Colors.primary[600]} />
              </View>
            ) : userPosts.length > 0 ? (
              <View style={styles.postsGrid}>
                {userPosts.map(post => (
                  <Pressable
                    key={post.id}
                    onPress={() => router.push(`/post/${post.id}`)}
                    onLongPress={() => handleDeletePost(post)}
                    style={styles.postTile}
                  >
                    {post.imageUrl ? (
                      <Image
                        source={{ uri: post.imageUrl }}
                        style={styles.postTileImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.postTileNoImage}>
                        <MaterialCommunityIcons
                          name="text-box-outline"
                          size={24}
                          color={Colors.neutral[400]}
                        />
                      </View>
                    )}
                    {/* Overlay with like count */}
                    <View style={styles.postTileOverlay}>
                      <MaterialCommunityIcons name="heart" size={12} color="#fff" />
                      <Text style={styles.postTileCount}>{post.likesCount}</Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            ) : (
              <View style={styles.emptyPosts}>
                <MaterialCommunityIcons
                  name="camera-outline"
                  size={48}
                  color={Colors.neutral[300]}
                />
                <Text style={styles.emptyPostsTitle}>
                  Noch keine Beiträge
                </Text>
                <Text style={styles.emptyPostsSubtitle}>
                  Schließe eine Challenge ab und teile deinen Erfolg!
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Badges Grid */}
        {activeTab === 'badges' && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                {t('badges.title')}
              </Text>
              <Pressable onPress={() => router.push('/badges')}>
                <Text style={styles.seeAll}>{t('badges.seeAll')}</Text>
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
                  const displayIcon = BADGE_ICONS[badgeId] || '🏅';
                  const displayName = t(`badgeNames.${badgeId}`, { defaultValue: userBadge.badge?.name || 'Badge' });

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
                  {t('badges.empty')}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Settings Section */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            {t('settings.title')}
          </Text>

          <Surface style={styles.settingsCard} elevation={1}>
            <Pressable style={styles.settingsItem} onPress={() => router.push('/profile/notifications')}>
              <MaterialCommunityIcons
                name="bell-outline"
                size={22}
                color={Colors.textPrimary}
              />
              <Text variant="bodyLarge" style={styles.settingsText}>
                {t('notifications.title')}
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
                {t('settings.account')}
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
                {t('settings.privacy')}
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
                {t('settings.help')}
              </Text>
              <MaterialCommunityIcons
                name="chevron-right"
                size={22}
                color={Colors.textMuted}
              />
            </Pressable>

            <View style={styles.settingsDivider} />

            {/* Language Switch */}
            <Pressable style={styles.settingsItem} onPress={handleLanguageToggle}>
              <MaterialCommunityIcons
                name="translate"
                size={22}
                color={Colors.textPrimary}
              />
              <Text variant="bodyLarge" style={styles.settingsText}>
                {t('settings.language')}
              </Text>
              <View style={styles.languageToggle}>
                <Text style={[
                  styles.languageOption,
                  language === 'de' && styles.languageOptionActive
                ]}>
                  DE
                </Text>
                <Text style={styles.languageDivider}>/</Text>
                <Text style={[
                  styles.languageOption,
                  language === 'en' && styles.languageOptionActive
                ]}>
                  EN
                </Text>
              </View>
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
            {t('logout')}
          </Button>
        </View>

        {/* App Version */}
        <Text variant="bodySmall" style={styles.version}>
          {t('version', { version: '1.0.0' })}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  titleBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.neutral[200],
  },
  titleText: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  header: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    backgroundColor: '#fff',
  },
  avatarContainer: {
    width: 96,
    height: 96,
    marginBottom: spacing.md,
    position: 'relative',
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.neutral[200],
  },
  avatarOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 48,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEditIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary[600],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
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
  languageToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral[100],
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  languageOption: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textMuted,
    paddingHorizontal: 4,
  },
  languageOptionActive: {
    color: Colors.primary[600],
    fontWeight: '700',
  },
  languageDivider: {
    color: Colors.textMuted,
    fontSize: 13,
  },

  // Tab Switcher
  tabSwitcher: {
    flexDirection: 'row',
    borderTopWidth: 0.5,
    borderTopColor: Colors.neutral[200],
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.neutral[200],
    marginTop: spacing.xl,
    backgroundColor: '#fff',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: Colors.textPrimary,
  },

  // Posts Grid
  postsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_GAP,
  },
  postTile: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    position: 'relative',
  },
  postTileImage: {
    width: '100%',
    height: '100%',
  },
  postTileNoImage: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  postTileOverlay: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  postTileCount: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
  postsLoading: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyPosts: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 40,
  },
  emptyPostsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginTop: 14,
  },
  emptyPostsSubtitle: {
    fontSize: 14,
    color: Colors.textMuted,
    marginTop: 6,
    textAlign: 'center',
    lineHeight: 20,
  },
});
