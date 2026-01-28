// Challenge Filters Component
// Single horizontal scrollable row with Quick, Categories, Type, and Team filters

import { ScrollView, StyleSheet, View } from 'react-native';
import { Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Colors, spacing } from '@/constants/theme';
import { useLanguageStore } from '@/store';
import { CATEGORIES as SHARED_CATEGORIES } from '@solvterra/shared';

interface FiltersProps {
  selectedCategory: string | null;
  selectedType: 'digital' | 'onsite' | null;
  selectedTeamMode: 'solo' | 'team' | null;
  showQuickOnly?: boolean;
  onCategoryChange: (category: string | null) => void;
  onTypeChange: (type: 'digital' | 'onsite' | null) => void;
  onTeamModeChange: (mode: 'solo' | 'team' | null) => void;
  onQuickFilterChange?: (quickOnly: boolean) => void;
}

// Map category IDs to Material Community Icons
const CATEGORY_ICONS: Record<string, string> = {
  environment: 'leaf',
  social: 'hand-heart',
  education: 'book-open-variant',
  health: 'heart-pulse',
  animals: 'paw',
  culture: 'palette',
};

export default function ChallengeFilters({
  selectedCategory,
  selectedType,
  selectedTeamMode,
  showQuickOnly = false,
  onCategoryChange,
  onTypeChange,
  onTeamModeChange,
  onQuickFilterChange,
}: FiltersProps) {
  const { t } = useTranslation('challenges');
  const { language } = useLanguageStore();

  const getCategoryLabel = (categoryId: string) => {
    const category = SHARED_CATEGORIES.find(c => c.id === categoryId);
    if (!category) return categoryId;
    return language === 'de' ? category.labelDe : category.label;
  };

  const categories = SHARED_CATEGORIES
    .filter(c => c.id !== 'other')
    .map(c => ({
      id: c.id,
      icon: CATEGORY_ICONS[c.id] || 'dots-horizontal',
    }));

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Quick Challenge Filter */}
        <Chip
          mode="flat"
          selected={showQuickOnly}
          onPress={() => onQuickFilterChange?.(!showQuickOnly)}
          style={[styles.quickChip, showQuickOnly && styles.quickChipSelected]}
          textStyle={[styles.quickChipText, showQuickOnly && styles.quickChipTextSelected]}
          icon={() => (
            <MaterialCommunityIcons
              name="lightning-bolt"
              size={16}
              color={showQuickOnly ? '#fbbf24' : Colors.accent[500]}
            />
          )}
        >
          {t('card.quick')}
        </Chip>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Category filters */}
        {categories.map(category => (
          <Chip
            key={category.id}
            mode="flat"
            selected={selectedCategory === category.id}
            onPress={() =>
              onCategoryChange(selectedCategory === category.id ? null : category.id)
            }
            style={[styles.chip, selectedCategory === category.id && styles.chipSelected]}
            textStyle={[styles.chipText, selectedCategory === category.id && styles.chipTextSelected]}
            icon={() => (
              <MaterialCommunityIcons
                name={category.icon as any}
                size={16}
                color={selectedCategory === category.id ? Colors.primary[600] : Colors.textSecondary}
              />
            )}
          >
            {getCategoryLabel(category.id)}
          </Chip>
        ))}

        {/* Divider */}
        <View style={styles.divider} />

        {/* Type filters */}
        <Chip
          mode="flat"
          selected={selectedType === 'digital'}
          onPress={() => onTypeChange(selectedType === 'digital' ? null : 'digital')}
          style={[styles.chip, selectedType === 'digital' && styles.chipSelected]}
          textStyle={[styles.chipText, selectedType === 'digital' && styles.chipTextSelected]}
          icon={() => (
            <MaterialCommunityIcons
              name="laptop"
              size={14}
              color={selectedType === 'digital' ? Colors.primary[600] : Colors.textSecondary}
            />
          )}
        >
          {t('filters.digital')}
        </Chip>
        <Chip
          mode="flat"
          selected={selectedType === 'onsite'}
          onPress={() => onTypeChange(selectedType === 'onsite' ? null : 'onsite')}
          style={[styles.chip, selectedType === 'onsite' && styles.chipSelected]}
          textStyle={[styles.chipText, selectedType === 'onsite' && styles.chipTextSelected]}
          icon={() => (
            <MaterialCommunityIcons
              name="map-marker"
              size={14}
              color={selectedType === 'onsite' ? Colors.primary[600] : Colors.textSecondary}
            />
          )}
        >
          {t('filters.onsite')}
        </Chip>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Team mode filters */}
        <Chip
          mode="flat"
          selected={selectedTeamMode === 'solo'}
          onPress={() => onTeamModeChange(selectedTeamMode === 'solo' ? null : 'solo')}
          style={[styles.chip, selectedTeamMode === 'solo' && styles.chipSelected]}
          textStyle={[styles.chipText, selectedTeamMode === 'solo' && styles.chipTextSelected]}
          icon={() => (
            <MaterialCommunityIcons
              name="account"
              size={14}
              color={selectedTeamMode === 'solo' ? Colors.primary[600] : Colors.textSecondary}
            />
          )}
        >
          {t('filters.solo')}
        </Chip>
        <Chip
          mode="flat"
          selected={selectedTeamMode === 'team'}
          onPress={() => onTeamModeChange(selectedTeamMode === 'team' ? null : 'team')}
          style={[styles.chip, selectedTeamMode === 'team' && styles.chipSelected]}
          textStyle={[styles.chipText, selectedTeamMode === 'team' && styles.chipTextSelected]}
          icon={() => (
            <MaterialCommunityIcons
              name="account-group"
              size={14}
              color={selectedTeamMode === 'team' ? Colors.primary[600] : Colors.textSecondary}
            />
          )}
        >
          {t('filters.team')}
        </Chip>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.sm,
  },
  scrollContent: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: spacing.xs,
    alignItems: 'center',
  },
  quickChip: {
    backgroundColor: Colors.accent[50],
    borderRadius: 20,
    height: 32,
    borderWidth: 1,
    borderColor: Colors.accent[200],
  },
  quickChipSelected: {
    backgroundColor: Colors.accent[100],
    borderColor: Colors.accent[400],
  },
  quickChipText: {
    fontSize: 13,
    color: Colors.accent[700],
    fontWeight: '600',
  },
  quickChipTextSelected: {
    color: Colors.accent[800],
    fontWeight: '700',
  },
  chip: {
    backgroundColor: Colors.neutral[100],
    borderRadius: 20,
    height: 32,
  },
  chipSelected: {
    backgroundColor: Colors.primary[50],
    borderColor: Colors.primary[200],
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  chipTextSelected: {
    color: Colors.primary[700],
    fontWeight: '500',
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: Colors.neutral[200],
    marginHorizontal: spacing.xs,
  },
});
