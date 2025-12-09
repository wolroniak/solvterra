// Challenge Filters Component
// Horizontal scrollable filter chips with micro-volunteering emphasis

import { ScrollView, StyleSheet, View } from 'react-native';
import { Chip, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, spacing } from '@/constants/theme';
import { CATEGORIES as SHARED_CATEGORIES } from '@solvterra/shared';

interface FiltersProps {
  selectedCategory: string | null;
  selectedDuration: number | null;
  selectedType: 'digital' | 'onsite' | null;
  showQuickOnly?: boolean;
  onCategoryChange: (category: string | null) => void;
  onDurationChange: (duration: number | null) => void;
  onTypeChange: (type: 'digital' | 'onsite' | null) => void;
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
  other: 'dots-horizontal',
};

// Filter out 'other' category for display and map to include icons
const CATEGORIES = SHARED_CATEGORIES
  .filter(c => c.id !== 'other')
  .map(c => ({
    id: c.id,
    label: c.labelDe,
    icon: CATEGORY_ICONS[c.id] || 'dots-horizontal',
  }));

const DURATIONS = [
  { value: 5, label: '5 Min' },
  { value: 10, label: '10 Min' },
  { value: 15, label: '15 Min' },
  { value: 30, label: '30 Min' },
];

const TYPES = [
  { value: 'digital' as const, label: 'Digital', icon: 'laptop' },
  { value: 'onsite' as const, label: 'Vor Ort', icon: 'map-marker' },
];

export default function ChallengeFilters({
  selectedCategory,
  selectedDuration,
  selectedType,
  showQuickOnly = false,
  onCategoryChange,
  onDurationChange,
  onTypeChange,
  onQuickFilterChange,
}: FiltersProps) {
  return (
    <View style={styles.container}>
      {/* Quick Filters Row - Micro-volunteering emphasis */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Quick Challenge Filter - Highlighted */}
        <Chip
          mode="flat"
          selected={showQuickOnly}
          onPress={() => onQuickFilterChange?.(!showQuickOnly)}
          style={[
            styles.quickChip,
            showQuickOnly && styles.quickChipSelected,
          ]}
          textStyle={[
            styles.quickChipText,
            showQuickOnly && styles.quickChipTextSelected,
          ]}
          icon={() => (
            <MaterialCommunityIcons
              name="lightning-bolt"
              size={16}
              color={showQuickOnly ? '#fbbf24' : Colors.accent[500]}
            />
          )}
        >
          Schnell erledigt
        </Chip>

        {/* Duration filters */}
        {DURATIONS.map(duration => (
          <Chip
            key={duration.value}
            mode="flat"
            selected={selectedDuration === duration.value}
            onPress={() =>
              onDurationChange(selectedDuration === duration.value ? null : duration.value)
            }
            style={[
              styles.chipSmall,
              selectedDuration === duration.value && styles.chipSelected,
            ]}
            textStyle={[
              styles.chipText,
              selectedDuration === duration.value && styles.chipTextSelected,
            ]}
            icon={() => (
              <MaterialCommunityIcons
                name="clock-outline"
                size={14}
                color={
                  selectedDuration === duration.value
                    ? Colors.primary[600]
                    : Colors.textSecondary
                }
              />
            )}
          >
            {duration.label}
          </Chip>
        ))}

        {/* Divider */}
        <View style={styles.divider} />

        {/* Type filters */}
        {TYPES.map(type => (
          <Chip
            key={type.value}
            mode="flat"
            selected={selectedType === type.value}
            onPress={() =>
              onTypeChange(selectedType === type.value ? null : type.value)
            }
            style={[
              styles.chipSmall,
              selectedType === type.value && styles.chipSelected,
            ]}
            textStyle={[
              styles.chipText,
              selectedType === type.value && styles.chipTextSelected,
            ]}
            icon={() => (
              <MaterialCommunityIcons
                name={type.icon as any}
                size={14}
                color={
                  selectedType === type.value
                    ? Colors.primary[600]
                    : Colors.textSecondary
                }
              />
            )}
          >
            {type.label}
          </Chip>
        ))}
      </ScrollView>

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {CATEGORIES.map(category => (
          <Chip
            key={category.id}
            mode="flat"
            selected={selectedCategory === category.id}
            onPress={() =>
              onCategoryChange(selectedCategory === category.id ? null : category.id)
            }
            style={[
              styles.chip,
              selectedCategory === category.id && styles.chipSelected,
            ]}
            textStyle={[
              styles.chipText,
              selectedCategory === category.id && styles.chipTextSelected,
            ]}
            icon={() => (
              <MaterialCommunityIcons
                name={category.icon as any}
                size={16}
                color={
                  selectedCategory === category.id
                    ? Colors.primary[600]
                    : Colors.textSecondary
                }
              />
            )}
          >
            {category.label}
          </Chip>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.xs,
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
  },
  chipSmall: {
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
    alignSelf: 'center',
  },
});
