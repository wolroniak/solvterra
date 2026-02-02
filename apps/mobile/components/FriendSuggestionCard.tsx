// FriendSuggestionCard Component
// Displays a friend suggestion with shared challenge count

import { useState } from 'react';
import { View, StyleSheet, Image, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Colors } from '@/constants/theme';
import { LEVELS } from '@solvterra/shared';
import type { FriendSuggestion } from '@solvterra/shared';

interface FriendSuggestionCardProps {
  suggestion: FriendSuggestion;
  onAdd: (userId: string) => Promise<boolean>;
}

const getLevelColor = (level: string) => {
  const levelConfig = LEVELS.find(l => l.level === level);
  return levelConfig?.color || Colors.neutral[500];
};

export default function FriendSuggestionCard({
  suggestion,
  onAdd,
}: FriendSuggestionCardProps) {
  const { t } = useTranslation('friends');
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAdd = async () => {
    setIsAdding(true);
    const success = await onAdd(suggestion.id);
    setIsAdding(false);
    if (success) {
      setAdded(true);
    }
  };

  return (
    <View style={styles.container}>
      {suggestion.avatarUrl ? (
        <Image source={{ uri: suggestion.avatarUrl }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.avatarPlaceholder]}>
          <MaterialCommunityIcons name="account" size={24} color={Colors.neutral[400]} />
        </View>
      )}

      <View style={styles.info}>
        <Text style={styles.name}>{suggestion.name}</Text>
        <View style={styles.metaRow}>
          <View style={[styles.levelDot, { backgroundColor: getLevelColor(suggestion.level) }]} />
          <Text style={styles.sharedText}>
            {t('suggestion.sharedChallenges', { count: suggestion.sharedChallenges })}
          </Text>
        </View>
      </View>

      <Pressable
        style={[
          styles.addButton,
          added && styles.addedButton,
          isAdding && styles.addingButton,
        ]}
        onPress={handleAdd}
        disabled={added || isAdding}
      >
        {added ? (
          <MaterialCommunityIcons name="check" size={20} color={Colors.primary[600]} />
        ) : (
          <MaterialCommunityIcons
            name="plus"
            size={20}
            color={isAdding ? Colors.neutral[400] : Colors.primary[600]}
          />
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: Colors.neutral[50],
    borderRadius: 12,
    marginBottom: 8,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarPlaceholder: {
    backgroundColor: Colors.neutral[200],
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  levelDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  sharedText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primary[200],
  },
  addedButton: {
    backgroundColor: Colors.primary[100],
    borderColor: Colors.primary[300],
  },
  addingButton: {
    opacity: 0.5,
  },
});
