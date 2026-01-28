// User Profile Screen
// Abgespeckte Profilansicht für andere Nutzer

import { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Text, Surface, ProgressBar } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, spacing } from '@/constants/theme';
import { useCommunityStore } from '@/store';
import { supabase } from '@/lib/supabase';
import type { CommunityPost, UserLevel } from '@solvterra/shared';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_GAP = 2;
const GRID_COLUMNS = 3;
const TILE_SIZE = (SCREEN_WIDTH - GRID_GAP * (GRID_COLUMNS - 1)) / GRID_COLUMNS;

const LEVELS = [
  { level: 1, key: 'starter', minXp: 0, maxXp: 100 },
  { level: 2, key: 'helper', minXp: 100, maxXp: 300 },
  { level: 3, key: 'supporter', minXp: 300, maxXp: 600 },
  { level: 4, key: 'champion', minXp: 600, maxXp: 1000 },
  { level: 5, key: 'legend', minXp: 1000, maxXp: 2000 },
];

const LEVEL_NAMES: Record<string, string> = {
  starter: 'Starter',
  helper: 'Helfer',
  supporter: 'Unterstützer',
  champion: 'Champion',
  legend: 'Legende',
};

interface UserProfile {
  id: string;
  name: string;
  avatar: string | null;
  xp: number;
  level: number;
  completedChallenges: number;
  hoursContributed: number;
}

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getUserPosts } = useCommunityStore();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userPosts, setUserPosts] = useState<CommunityPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);

  useEffect(() => {
    if (!id) return;
    loadProfile();
    loadPosts();
  }, [id]);

  const loadProfile = async () => {
    setIsLoading(true);

    // Fetch user row
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, name, avatar, xp, level')
      .eq('id', id)
      .single();

    if (userError || !userData) {
      console.error('Failed to load user profile:', userError);
      setIsLoading(false);
      return;
    }

    // Count approved submissions for stats
    const { count: completedCount } = await supabase
      .from('submissions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', id)
      .eq('status', 'approved');

    // Sum duration_minutes from completed challenges
    const { data: completedSubs } = await supabase
      .from('submissions')
      .select('challenges(duration_minutes)')
      .eq('user_id', id)
      .eq('status', 'approved');

    const totalMinutes = (completedSubs || []).reduce((sum, s) => {
      const mins = (s.challenges as any)?.duration_minutes || 0;
      return sum + mins;
    }, 0);

    setProfile({
      id: userData.id,
      name: userData.name || 'Unbekannt',
      avatar: userData.avatar,
      xp: userData.xp || 0,
      level: userData.level || 1,
      completedChallenges: completedCount || 0,
      hoursContributed: Math.round((totalMinutes / 60) * 10) / 10,
    });
    setIsLoading(false);
  };

  const loadPosts = async () => {
    if (!id) return;
    setIsLoadingPosts(true);
    const posts = await getUserPosts(id);
    setUserPosts(posts);
    setIsLoadingPosts(false);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary[600]} />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.loadingContainer}>
        <MaterialCommunityIcons name="account-off-outline" size={48} color={Colors.neutral[300]} />
        <Text style={styles.errorText}>Nutzer nicht gefunden</Text>
      </View>
    );
  }

  const xpTotal = profile.xp;
  const currentLevelInfo = LEVELS.find(
    l => xpTotal >= l.minXp && xpTotal < l.maxXp
  ) || LEVELS[LEVELS.length - 1];

  const nextLevelInfo = LEVELS.find(l => l.level === currentLevelInfo.level + 1);
  const xpInCurrentLevel = xpTotal - currentLevelInfo.minXp;
  const xpNeededForNextLevel = currentLevelInfo.maxXp - currentLevelInfo.minXp;
  const levelProgress = xpInCurrentLevel / xpNeededForNextLevel;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile Header */}
      <View style={styles.header}>
        <Image
          source={{ uri: profile.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${profile.name}` }}
          style={styles.avatar}
        />
        <Text style={styles.name}>{profile.name}</Text>

        {/* Level Badge */}
        <View style={styles.levelBadge}>
          <MaterialCommunityIcons
            name="shield-star"
            size={20}
            color={Colors.primary[600]}
          />
          <Text style={styles.levelText}>
            Level {currentLevelInfo.level} - {LEVEL_NAMES[currentLevelInfo.key]}
          </Text>
        </View>
      </View>

      {/* XP Progress Card */}
      <Surface style={styles.xpCard} elevation={1}>
        <View style={styles.xpHeader}>
          <Text style={styles.xpTitle}>Fortschritt</Text>
          <View style={styles.xpBadge}>
            <MaterialCommunityIcons name="star" size={16} color={Colors.accent[500]} />
            <Text style={styles.xpValue}>{xpTotal} XP</Text>
          </View>
        </View>

        <ProgressBar
          progress={levelProgress}
          color={Colors.primary[600]}
          style={styles.progressBar}
        />

        <View style={styles.xpLabels}>
          <Text style={styles.xpLabelLeft}>
            {xpInCurrentLevel} / {xpNeededForNextLevel} XP
          </Text>
          {nextLevelInfo && (
            <Text style={styles.xpLabelRight}>
              Nächstes Level: {LEVEL_NAMES[nextLevelInfo.key]}
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
          <Text style={styles.statValue}>
            {profile.completedChallenges}
          </Text>
          <Text style={styles.statLabel}>Challenges</Text>
        </Surface>

        <Surface style={styles.statCard} elevation={1}>
          <MaterialCommunityIcons
            name="clock-outline"
            size={28}
            color={Colors.primary[600]}
          />
          <Text style={styles.statValue}>
            {profile.hoursContributed}h
          </Text>
          <Text style={styles.statLabel}>Beigetragen</Text>
        </Surface>
      </View>

      {/* Posts Section */}
      <View style={styles.postsSection}>
        <Text style={styles.postsSectionTitle}>Beiträge</Text>

        {isLoadingPosts ? (
          <View style={styles.postsLoading}>
            <ActivityIndicator size="small" color={Colors.primary[600]} />
          </View>
        ) : userPosts.length > 0 ? (
          <View style={styles.postsGrid}>
            {userPosts.map(post => (
              <Pressable
                key={post.id}
                style={styles.postTile}
                onPress={() => router.push(`/post/${post.id}`)}
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
            <Text style={styles.emptyPostsTitle}>Noch keine Beiträge</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    gap: 12,
  },
  errorText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },

  // Header
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
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
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

  // XP Card
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
    fontSize: 16,
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
    fontSize: 12,
    color: Colors.textMuted,
  },
  xpLabelRight: {
    fontSize: 12,
    color: Colors.primary[600],
    fontWeight: '500',
  },

  // Stats
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
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: spacing.xs,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },

  // Posts
  postsSection: {
    marginTop: spacing.xl,
  },
  postsSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
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
});
