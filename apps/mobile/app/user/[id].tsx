// User Profile Screen
// Displays another user's public profile

import { useEffect, useState } from 'react';
import { View, StyleSheet, Image, ScrollView } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { Stack, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Colors } from '@/constants/theme';
import { LEVELS } from '@solvterra/shared';
import type { UserLevel } from '@solvterra/shared';
import { supabase } from '@/lib/supabase';

interface UserProfile {
  id: string;
  name: string;
  username?: string;
  avatar?: string;
  level: number;
  xp: number;
  completed_challenges: number;
}

// Convert numeric level (1-5) to UserLevel string
const LEVEL_MAP: UserLevel[] = ['starter', 'helper', 'supporter', 'champion', 'legend'];

const getLevelConfig = (level: number | UserLevel) => {
  const levelStr = typeof level === 'string' ? level : LEVEL_MAP[Math.max(0, Math.min(level - 1, LEVEL_MAP.length - 1))] || 'starter';
  return LEVELS.find(l => l.level === levelStr) || LEVELS[0];
};

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation('friends');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (!id) return;

      try {
        const { data, error } = await supabase
          .from('users')
          .select('id, name, username, avatar, level, xp, completed_challenges')
          .eq('id', id)
          .single();

        if (error) throw error;
        setUser(data);
      } catch (error) {
        console.error('Failed to fetch user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Stack.Screen options={{ title: '' }} />
        <ActivityIndicator size="large" color={Colors.primary[600]} />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Stack.Screen options={{ title: t('userProfile.notFound') }} />
        <MaterialCommunityIcons name="account-off" size={64} color={Colors.neutral[300]} />
        <Text style={styles.notFoundText}>{t('userProfile.notFoundText')}</Text>
      </View>
    );
  }

  const levelConfig = getLevelConfig(user.level);

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ title: user.name }} />

      {/* Profile Header */}
      <View style={styles.header}>
        {user.avatar ? (
          <Image source={{ uri: user.avatar }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <MaterialCommunityIcons name="account" size={48} color={Colors.neutral[400]} />
          </View>
        )}

        <Text style={styles.name}>{user.name}</Text>
        {user.username && (
          <Text style={styles.username}>@{user.username}</Text>
        )}

        {/* Level Badge */}
        <View style={[styles.levelBadge, { backgroundColor: levelConfig.color + '20' }]}>
          <MaterialCommunityIcons name="star" size={16} color={levelConfig.color} />
          <Text style={[styles.levelText, { color: levelConfig.color }]}>
            {levelConfig.name}
          </Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{user.xp}</Text>
          <Text style={styles.statLabel}>XP</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{user.completed_challenges}</Text>
          <Text style={styles.statLabel}>{t('userProfile.challenges')}</Text>
        </View>
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  notFoundText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    backgroundColor: Colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 16,
  },
  username: {
    fontSize: 15,
    color: Colors.textMuted,
    marginTop: 4,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 12,
    gap: 6,
  },
  levelText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  statLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.neutral[200],
    marginHorizontal: 16,
  },
});
