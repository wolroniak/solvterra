// Friends Screen
// Displays pending requests, suggestions, and friend list

import { useEffect, useCallback, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Pressable } from 'react-native';
import { Text, Searchbar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Colors } from '@/constants/theme';
import { useFriendStore } from '@/store';
import FriendRequestCard from '@/components/FriendRequestCard';
import FriendSuggestionCard from '@/components/FriendSuggestionCard';
import FriendListItem from '@/components/FriendListItem';
import type { FriendListItem as FriendListItemType, FriendRequest, FriendSuggestion, UserSearchResult } from '@solvterra/shared';

type SectionType = 'requests' | 'suggestions' | 'friends' | 'search';

interface Section {
  type: SectionType;
  title: string;
  data: FriendRequest[] | FriendSuggestion[] | FriendListItemType[] | UserSearchResult[];
}

export default function FriendsScreen() {
  const { t } = useTranslation('friends');
  const router = useRouter();

  const {
    friends,
    pendingRequests,
    suggestions,
    isLoading,
    fetchFriends,
    fetchPendingRequests,
    fetchSuggestions,
    sendFriendRequest,
    acceptRequest,
    declineRequest,
    unfriend,
    searchUsers,
  } = useFriendStore();

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    fetchFriends();
    fetchPendingRequests();
    fetchSuggestions();
  }, []);

  // Search debounce
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      const results = await searchUsers(searchQuery);
      setSearchResults(results);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      fetchFriends(),
      fetchPendingRequests(),
      fetchSuggestions(),
    ]);
    setRefreshing(false);
  }, []);

  const handleAddFromSearch = async (userId: string) => {
    const success = await sendFriendRequest(userId);
    if (success) {
      // Update search results to show pending status
      setSearchResults(prev =>
        prev.map(u => u.id === userId ? { ...u, friendshipStatus: 'pending' as const } : u)
      );
    }
    return success;
  };

  const sections: Section[] = [];

  // Show search results if searching
  if (searchQuery.length >= 2) {
    sections.push({
      type: 'search',
      title: t('search.title'),
      data: searchResults,
    });
  } else {
    // Show normal sections
    if (pendingRequests.length > 0) {
      sections.push({
        type: 'requests',
        title: `${t('sections.requests')} (${pendingRequests.length})`,
        data: pendingRequests,
      });
    }

    if (suggestions.length > 0) {
      sections.push({
        type: 'suggestions',
        title: t('sections.suggestions'),
        data: suggestions,
      });
    }

    sections.push({
      type: 'friends',
      title: `${t('sections.friends')} (${friends.length})`,
      data: friends,
    });
  }

  const renderSectionHeader = (title: string) => (
    <Text style={styles.sectionTitle}>{title}</Text>
  );

  const renderItem = ({ item, section }: { item: unknown; section: Section }) => {
    switch (section.type) {
      case 'requests':
        return (
          <FriendRequestCard
            request={item as FriendRequest}
            onAccept={acceptRequest}
            onDecline={declineRequest}
          />
        );
      case 'suggestions':
        return (
          <FriendSuggestionCard
            suggestion={item as FriendSuggestion}
            onAdd={sendFriendRequest}
          />
        );
      case 'friends':
        return (
          <FriendListItem
            friend={item as FriendListItemType}
            onUnfriend={unfriend}
            onPress={(userId) => router.push(`/user/${userId}`)}
          />
        );
      case 'search':
        const user = item as UserSearchResult;
        return (
          <FriendSuggestionCard
            suggestion={{
              ...user,
              sharedChallenges: 0,
            }}
            onAdd={handleAddFromSearch}
          />
        );
      default:
        return null;
    }
  };

  const renderEmpty = (type: SectionType) => {
    if (type === 'search' && isSearching) {
      return <Text style={styles.emptyText}>...</Text>;
    }
    if (type === 'search' && searchQuery.length >= 2) {
      return <Text style={styles.emptyText}>{t('search.noResults')}</Text>;
    }
    if (type === 'friends' && friends.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="account-group-outline" size={48} color={Colors.neutral[300]} />
          <Text style={styles.emptyText}>{t('empty.friends')}</Text>
          <Text style={styles.emptyHint}>{t('empty.friendsHint')}</Text>
        </View>
      );
    }
    return null;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={Colors.textPrimary} />
        </Pressable>
        <Text style={styles.title}>{t('title')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder={t('search.placeholder')}
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
          inputStyle={styles.searchInput}
          iconColor={Colors.neutral[400]}
        />
      </View>

      {/* Content */}
      <FlatList
        data={sections}
        keyExtractor={(section) => section.type}
        renderItem={({ item: section }) => (
          <View style={styles.section}>
            {renderSectionHeader(section.title)}
            {section.data.length === 0 ? (
              renderEmpty(section.type)
            ) : (
              section.data.map((item, index) => (
                <View key={index}>
                  {renderItem({ item, section })}
                </View>
              ))
            )}
          </View>
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.primary[600]}
          />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  headerSpacer: {
    width: 32,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchbar: {
    backgroundColor: Colors.neutral[100],
    borderRadius: 12,
    elevation: 0,
  },
  searchInput: {
    fontSize: 15,
  },
  listContent: {
    paddingBottom: 20,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 15,
    color: Colors.textMuted,
    marginTop: 12,
    textAlign: 'center',
  },
  emptyHint: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 4,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
