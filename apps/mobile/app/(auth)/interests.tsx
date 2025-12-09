// Interests Selection Screen
// Users select their preferred challenge categories

import { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, spacing } from '@/constants/theme';
import { useUserStore } from '@/store';
import type { ChallengeCategory } from '@solvterra/shared';

const CATEGORIES: { id: ChallengeCategory; label: string; icon: string; color: string }[] = [
  { id: 'environment', label: 'Umwelt', icon: 'leaf', color: '#10B981' },
  { id: 'social', label: 'Soziales', icon: 'hand-heart', color: '#EC4899' },
  { id: 'education', label: 'Bildung', icon: 'book-open-variant', color: '#3B82F6' },
  { id: 'health', label: 'Gesundheit', icon: 'heart-pulse', color: '#EF4444' },
  { id: 'animals', label: 'Tierschutz', icon: 'paw', color: '#F59E0B' },
  { id: 'culture', label: 'Kultur', icon: 'palette', color: '#8B5CF6' },
];

export default function InterestsScreen() {
  const { setInterests } = useUserStore();
  const [selected, setSelected] = useState<ChallengeCategory[]>([]);

  const toggleCategory = (id: ChallengeCategory) => {
    setSelected(prev =>
      prev.includes(id)
        ? prev.filter(c => c !== id)
        : [...prev, id]
    );
  };

  const handleContinue = () => {
    setInterests(selected);
    router.push('/(auth)/tutorial');
  };

  const handleSkip = () => {
    setInterests([]);
    router.push('/(auth)/tutorial');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text variant="headlineMedium" style={styles.title}>
            Was interessiert dich?
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            Wähle Kategorien, die dir wichtig sind. Wir zeigen dir passende Challenges.
          </Text>
        </View>

        {/* Category Grid */}
        <View style={styles.grid}>
          {CATEGORIES.map(category => {
            const isSelected = selected.includes(category.id);
            return (
              <Pressable
                key={category.id}
                onPress={() => toggleCategory(category.id)}
                style={[
                  styles.categoryCard,
                  isSelected && { borderColor: category.color, backgroundColor: `${category.color}10` },
                ]}
              >
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: `${category.color}20` },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={category.icon as any}
                    size={32}
                    color={category.color}
                  />
                </View>
                <Text
                  variant="titleMedium"
                  style={[
                    styles.categoryLabel,
                    isSelected && { color: category.color },
                  ]}
                >
                  {category.label}
                </Text>
                {isSelected && (
                  <View style={[styles.checkmark, { backgroundColor: category.color }]}>
                    <MaterialCommunityIcons name="check" size={14} color="#fff" />
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>

        {/* Selection indicator */}
        <Text variant="bodyMedium" style={styles.selectionText}>
          {selected.length === 0
            ? 'Wähle mindestens eine Kategorie'
            : `${selected.length} ${selected.length === 1 ? 'Kategorie' : 'Kategorien'} ausgewählt`}
        </Text>
      </ScrollView>

      {/* Buttons */}
      <View style={styles.buttons}>
        <Button
          mode="contained"
          onPress={handleContinue}
          style={styles.continueButton}
          contentStyle={styles.buttonContent}
          disabled={selected.length === 0}
        >
          Weiter
        </Button>
        <Button
          mode="text"
          onPress={handleSkip}
          textColor={Colors.textSecondary}
        >
          Überspringen
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  categoryCard: {
    width: '47%',
    aspectRatio: 1,
    backgroundColor: Colors.neutral[50],
    borderRadius: 16,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  categoryLabel: {
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  checkmark: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectionText: {
    textAlign: 'center',
    color: Colors.textMuted,
    marginTop: spacing.md,
  },
  buttons: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.sm,
  },
  continueButton: {
    borderRadius: 12,
  },
  buttonContent: {
    paddingVertical: spacing.sm,
  },
});
