// Home / Feed Screen
// Challenge discovery with micro-volunteering emphasis

import { useState, useMemo, useEffect, useRef } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, ActivityIndicator, Alert, Pressable, TextInput } from 'react-native';
import { Text } from 'react-native-paper';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Colors, spacing } from '@/constants/theme';
import { useChallengeStore, useUserStore } from '@/store';
import { useTranslatedChallenges } from '@/hooks';
import { supabase } from '@/lib/supabase';
import ChallengeCard from '@/components/ChallengeCard';
import ChallengeFilters from '@/components/ChallengeFilters';
import CreatePostModal from '@/components/CreatePostModal';

export default function FeedScreen() {
  const { t } = useTranslation('challenges');
  const { t: tCommon } = useTranslation('common');
  const { user, addXp } = useUserStore();
  const { challenges, isLoading, loadChallenges } = useChallengeStore();

  // Translate challenges for display
  const translatedChallenges = useTranslatedChallenges(challenges);

  const initialLoadDone = useRef(false);

  // Post creation modal state
  const [showPostModal, setShowPostModal] = useState(false);
  const [postSubmissionData, setPostSubmissionData] = useState<{
    submissionId: string;
    challengeId: string;
    challengeTitle: string;
    proofUrl?: string;
    xpEarned?: number;
  } | undefined>(undefined);

  // Load challenges on mount and subscribe to real-time updates
  useEffect(() => {
    loadChallenges().then(() => {
      initialLoadDone.current = true;
    });

    // Real-time: listen for new/updated challenges
    const challengeChannel = supabase
      .channel('mobile-challenges')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'challenges',
      }, () => {
        loadChallenges();
      })
      .subscribe();

    // Real-time: listen for submission status updates (approval/rejection from NGO)
    const submissionChannel = supabase
      .channel('mobile-submissions')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'submissions',
      }, (payload) => {
        loadChallenges();

        if (!initialLoadDone.current) return;

        const sub = payload.new as {
          id?: string;
          status?: string;
          xp_earned?: number;
          challenge_id?: string;
          ngo_feedback?: string;
          proof_url?: string;
        };

        // Look up challenge title from local state
        const challenge = challenges.find(c => c.id === sub.challenge_id);
        const challengeTitle = challenge?.title || 'Aufgabe';

        if (sub.status === 'approved') {
          const xpEarned = sub.xp_earned || 0;
          if (xpEarned > 0) {
            addXp(xpEarned);
          }
          Alert.alert(
            '🎉 Genehmigt!',
            `"${challengeTitle}" wurde genehmigt! +${xpEarned} XP\n\nMöchtest du deinen Erfolg mit der Community teilen?`,
            [
              { text: 'Später', style: 'cancel' },
              {
                text: 'Teilen',
                onPress: () => {
                  setPostSubmissionData({
                    submissionId: sub.id || '',
                    challengeId: sub.challenge_id || '',
                    challengeTitle,
                    proofUrl: sub.proof_url,
                    xpEarned,
                  });
                  setShowPostModal(true);
                },
              },
            ]
          );
        } else if (sub.status === 'rejected') {
          const feedback = sub.ngo_feedback
            ? `Feedback: "${sub.ngo_feedback}"`
            : 'Schau dir das Feedback an.';
          Alert.alert(
            `"${challengeTitle}" abgelehnt`,
            feedback,
            [{ text: 'OK' }]
          );
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(challengeChannel);
      supabase.removeChannel(submissionChannel);
    };
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const searchInputRef = useRef<TextInput>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<'digital' | 'onsite' | null>(null);
  const [selectedTeamMode, setSelectedTeamMode] = useState<'solo' | 'team' | null>(null);
  const [showQuickOnly, setShowQuickOnly] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Filter challenges (use translated version)
  const filteredChallenges = useMemo(() => {
    let result = translatedChallenges.filter(c => c.status === 'active');

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        c =>
          c.title.toLowerCase().includes(query) ||
          c.description.toLowerCase().includes(query) ||
          c.organization.name.toLowerCase().includes(query)
      );
    }

    if (selectedCategory) {
      result = result.filter(c => c.category === selectedCategory);
    }

    if (selectedType) {
      result = result.filter(c => c.type === selectedType);
    }

    if (selectedTeamMode === 'team') {
      result = result.filter(c => c.isMultiPerson);
    } else if (selectedTeamMode === 'solo') {
      result = result.filter(c => !c.isMultiPerson);
    }

    // Quick filter: show only 5-10 min challenges, sorted by duration
    if (showQuickOnly) {
      result = result.filter(c => c.durationMinutes <= 10);
      result = [...result].sort((a, b) => a.durationMinutes - b.durationMinutes);
    }

    return result;
  }, [translatedChallenges, searchQuery, selectedCategory, selectedType, selectedTeamMode, showQuickOnly]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadChallenges();
    setRefreshing(false);
  };

  const handleChallengePress = (challengeId: string) => {
    router.push(`/challenge/${challengeId}`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Title Bar / Search Bar */}
      <View style={styles.titleBar}>
        {isSearchActive ? (
          <View style={styles.searchRow}>
            <Pressable
              onPress={() => {
                setIsSearchActive(false);
                setSearchQuery('');
              }}
              style={styles.searchBackButton}
              hitSlop={8}
            >
              <MaterialCommunityIcons name="arrow-left" size={24} color={Colors.textPrimary} />
            </Pressable>
            <TextInput
              ref={searchInputRef}
              style={styles.searchInput}
              placeholder={t('discover.searchPlaceholder')}
              placeholderTextColor={Colors.neutral[400]}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
                <MaterialCommunityIcons name="close-circle" size={20} color={Colors.textMuted} />
              </Pressable>
            )}
          </View>
        ) : (
          <>
            <Text style={styles.titleText}>{t('discover.discoverTitle')}</Text>
            <Pressable
              onPress={() => setIsSearchActive(true)}
              style={styles.searchIconButton}
              hitSlop={8}
            >
              <MaterialCommunityIcons name="magnify" size={24} color={Colors.textPrimary} />
            </Pressable>
          </>
        )}
      </View>

      {/* Filters */}
      <ChallengeFilters
        selectedCategory={selectedCategory}
        selectedType={selectedType}
        selectedTeamMode={selectedTeamMode}
        showQuickOnly={showQuickOnly}
        onCategoryChange={setSelectedCategory}
        onTypeChange={setSelectedType}
        onTeamModeChange={setSelectedTeamMode}
        onQuickFilterChange={setShowQuickOnly}
      />

      {/* Challenge List */}
      <FlatList
        data={filteredChallenges}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <ChallengeCard
            challenge={item}
            onPress={() => handleChallengePress(item.id)}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.primary[600]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            {isLoading ? (
              <>
                <ActivityIndicator size="large" color={Colors.primary[600]} />
                <Text variant="bodyMedium" style={styles.emptyText}>
                  {tCommon('loading')}
                </Text>
              </>
            ) : (
              <>
                <MaterialCommunityIcons
                  name="magnify"
                  size={64}
                  color={Colors.neutral[300]}
                />
                <Text variant="titleMedium" style={styles.emptyTitle}>
                  {t('discover.noResults')}
                </Text>
                <Text variant="bodyMedium" style={styles.emptyText}>
                  {t('discover.tryDifferentFilters')}
                </Text>
              </>
            )}
          </View>
        }
      />

      {/* Post Creation Modal (triggered after approval) */}
      <CreatePostModal
        visible={showPostModal}
        onClose={() => {
          setShowPostModal(false);
          setPostSubmissionData(undefined);
        }}
        submissionData={postSubmissionData}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  titleBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.neutral[200],
    minHeight: 52,
  },
  titleText: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  searchIconButton: {
    padding: 4,
  },
  searchRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchBackButton: {
    padding: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.textPrimary,
    paddingVertical: 0,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyTitle: {
    color: Colors.textPrimary,
    marginTop: spacing.md,
    fontWeight: '600',
  },
  emptyText: {
    color: Colors.textMuted,
    marginTop: spacing.xs,
  },
});
