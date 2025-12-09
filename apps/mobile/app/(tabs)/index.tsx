// Home / Feed Screen
// Challenge discovery with micro-volunteering emphasis

import { useState, useMemo, useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import { Text, Searchbar } from 'react-native-paper';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, spacing } from '@/constants/theme';
import { useChallengeStore, useUserStore } from '@/store';
import ChallengeCard from '@/components/ChallengeCard';
import ChallengeFilters from '@/components/ChallengeFilters';

export default function FeedScreen() {
  const { user } = useUserStore();
  const { challenges, isLoading, loadChallenges } = useChallengeStore();

  // Load challenges on mount
  useEffect(() => {
    loadChallenges();
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);
  const [selectedType, setSelectedType] = useState<'digital' | 'onsite' | null>(null);
  const [showQuickOnly, setShowQuickOnly] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Filter challenges
  const filteredChallenges = useMemo(() => {
    let result = challenges.filter(c => c.status === 'active');

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

    if (selectedDuration) {
      result = result.filter(c => c.durationMinutes === selectedDuration);
    }

    if (selectedType) {
      result = result.filter(c => c.type === selectedType);
    }

    // Quick filter: show only 5-10 min challenges
    if (showQuickOnly) {
      result = result.filter(c => c.durationMinutes <= 10);
    }

    // Sort by duration (shortest first) when quick filter is active
    if (showQuickOnly) {
      result = [...result].sort((a, b) => a.durationMinutes - b.durationMinutes);
    }

    return result;
  }, [challenges, searchQuery, selectedCategory, selectedDuration, selectedType, showQuickOnly]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadChallenges();
    setRefreshing(false);
  };

  const handleChallengePress = (challengeId: string) => {
    router.push(`/challenge/${challengeId}`);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Guten Morgen';
    if (hour < 18) return 'Guten Tag';
    return 'Guten Abend';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header with Micro-Volunteering Branding */}
      <View style={styles.header}>
        <View style={styles.greetingRow}>
          <View>
            <Text variant="titleLarge" style={styles.greeting}>
              {getGreeting()}, {user?.name.split(' ')[0] || 'Nutzer'}!
            </Text>
            <View style={styles.subtitleRow}>
              <MaterialCommunityIcons name="clock-fast" size={16} color={Colors.primary[600]} />
              <Text variant="bodyMedium" style={styles.subtitle}>
                Micro-Volunteering in 5-30 Min
              </Text>
            </View>
          </View>
          <View style={styles.xpBadge}>
            <MaterialCommunityIcons name="star" size={18} color={Colors.accent[500]} />
            <Text style={styles.xpText}>{user?.xpTotal || 0} XP</Text>
          </View>
        </View>

        {/* Motivational Tagline */}
        <View style={styles.taglineContainer}>
          <Text style={styles.tagline}>Hilf der Welt - schon in 5 Minuten!</Text>
        </View>

        {/* Search */}
        <Searchbar
          placeholder="Challenges suchen..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
          inputStyle={styles.searchInput}
          iconColor={Colors.textMuted}
        />
      </View>

      {/* Filters with Quick Filter */}
      <ChallengeFilters
        selectedCategory={selectedCategory}
        selectedDuration={selectedDuration}
        selectedType={selectedType}
        showQuickOnly={showQuickOnly}
        onCategoryChange={setSelectedCategory}
        onDurationChange={setSelectedDuration}
        onTypeChange={setSelectedType}
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
                  Challenges werden geladen...
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
                  Keine Challenges gefunden
                </Text>
                <Text variant="bodyMedium" style={styles.emptyText}>
                  Versuche andere Filter oder eine andere Suche
                </Text>
              </>
            )}
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: '#fff',
  },
  greetingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  greeting: {
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  subtitle: {
    color: Colors.primary[600],
    fontWeight: '500',
  },
  taglineContainer: {
    backgroundColor: Colors.primary[50],
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.md,
  },
  tagline: {
    color: Colors.primary[700],
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accent[50],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    gap: 4,
  },
  xpText: {
    color: Colors.accent[700],
    fontWeight: '600',
    fontSize: 14,
  },
  searchbar: {
    backgroundColor: Colors.neutral[100],
    borderRadius: 12,
    elevation: 0,
  },
  searchInput: {
    fontSize: 14,
  },
  listContent: {
    padding: spacing.lg,
    paddingTop: spacing.sm,
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
