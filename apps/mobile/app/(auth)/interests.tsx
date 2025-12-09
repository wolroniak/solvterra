// Interests Selection Screen
// Users select their preferred challenge categories

import { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Colors, spacing } from '@/constants/theme';
import { useUserStore } from '@/store';
import { useLanguageStore } from '@/store/languageStore';
import { CATEGORIES as SHARED_CATEGORIES } from '@solvterra/shared';
import type { ChallengeCategory } from '@solvterra/shared';

// Map shared categories to Material Community Icons
const CATEGORY_ICONS: Record<ChallengeCategory, string> = {
  environment: 'leaf',
  social: 'hand-heart',
  education: 'book-open-variant',
  health: 'heart-pulse',
  animals: 'paw',
  culture: 'palette',
  other: 'dots-horizontal',
};

// Custom colors for interests screen (more vibrant)
const CATEGORY_COLORS: Record<ChallengeCategory, string> = {
  environment: '#10B981',
  social: '#EC4899',
  education: '#3B82F6',
  health: '#EF4444',
  animals: '#F59E0B',
  culture: '#8B5CF6',
  other: '#78756c',
};

export default function InterestsScreen() {
  const { t } = useTranslation('auth');
  const { language } = useLanguageStore();
  const { setInterests } = useUserStore();
  const [selected, setSelected] = useState<ChallengeCategory[]>([]);

  // Get category label based on current language
  const getCategoryLabel = (categoryId: ChallengeCategory) => {
    const category = SHARED_CATEGORIES.find(c => c.id === categoryId);
    if (!category) return categoryId;
    return language === 'de' ? category.labelDe : category.label;
  };

  // Filter out 'other' category for onboarding
  const displayCategories = SHARED_CATEGORIES.filter(c => c.id !== 'other');

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

  // Get selection text based on count
  const getSelectionText = () => {
    if (selected.length === 0) {
      return t('onboarding.interestsStep.minSelection');
    }
    return selected.length === 1
      ? t('onboarding.interestsStep.selectedSingular', { count: selected.length })
      : t('onboarding.interestsStep.selectedPlural', { count: selected.length });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text variant="headlineMedium" style={styles.title}>
            {t('onboarding.interestsStep.title')}
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            {t('onboarding.interestsStep.subtitle')}
          </Text>
        </View>

        {/* Category Grid */}
        <View style={styles.grid}>
          {displayCategories.map(category => {
            const isSelected = selected.includes(category.id);
            const color = CATEGORY_COLORS[category.id];
            const icon = CATEGORY_ICONS[category.id];
            return (
              <Pressable
                key={category.id}
                onPress={() => toggleCategory(category.id)}
                style={[
                  styles.categoryCard,
                  isSelected && { borderColor: color, backgroundColor: `${color}10` },
                ]}
              >
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: `${color}20` },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={icon as any}
                    size={32}
                    color={color}
                  />
                </View>
                <Text
                  variant="titleMedium"
                  style={[
                    styles.categoryLabel,
                    isSelected && { color: color },
                  ]}
                >
                  {getCategoryLabel(category.id)}
                </Text>
                {isSelected && (
                  <View style={[styles.checkmark, { backgroundColor: color }]}>
                    <MaterialCommunityIcons name="check" size={14} color="#fff" />
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>

        {/* Selection indicator */}
        <Text variant="bodyMedium" style={styles.selectionText}>
          {getSelectionText()}
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
          {t('onboarding.interestsStep.continue')}
        </Button>
        <Button
          mode="text"
          onPress={handleSkip}
          textColor={Colors.textSecondary}
        >
          {t('onboarding.interestsStep.skip')}
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
