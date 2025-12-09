// Language Toggle Component
// Compact language switcher for auth screens and settings

import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, spacing } from '@/constants/theme';
import { useLanguageStore, Language } from '@/store/languageStore';

interface LanguageToggleProps {
  // Optional style variant
  variant?: 'compact' | 'full';
}

export default function LanguageToggle({ variant = 'compact' }: LanguageToggleProps) {
  const { language, setLanguage } = useLanguageStore();

  const toggleLanguage = () => {
    const newLanguage: Language = language === 'de' ? 'en' : 'de';
    setLanguage(newLanguage);
  };

  if (variant === 'full') {
    return (
      <View style={styles.fullContainer}>
        <Pressable
          style={[
            styles.fullOption,
            language === 'de' && styles.fullOptionActive,
          ]}
          onPress={() => setLanguage('de')}
        >
          <Text
            style={[
              styles.fullOptionText,
              language === 'de' && styles.fullOptionTextActive,
            ]}
          >
            Deutsch
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.fullOption,
            language === 'en' && styles.fullOptionActive,
          ]}
          onPress={() => setLanguage('en')}
        >
          <Text
            style={[
              styles.fullOptionText,
              language === 'en' && styles.fullOptionTextActive,
            ]}
          >
            English
          </Text>
        </Pressable>
      </View>
    );
  }

  // Compact variant - globe icon with language code
  return (
    <Pressable style={styles.compactContainer} onPress={toggleLanguage}>
      <MaterialCommunityIcons
        name="web"
        size={16}
        color={Colors.textSecondary}
      />
      <Text style={styles.compactText}>
        {language.toUpperCase()}
      </Text>
      <MaterialCommunityIcons
        name="chevron-down"
        size={14}
        color={Colors.textMuted}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // Compact variant styles
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.neutral[100],
  },
  compactText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  // Full variant styles
  fullContainer: {
    flexDirection: 'row',
    borderRadius: 20,
    backgroundColor: Colors.neutral[100],
    padding: 4,
  },
  fullOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  fullOptionActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  fullOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textMuted,
  },
  fullOptionTextActive: {
    color: Colors.primary[600],
    fontWeight: '600',
  },
});
