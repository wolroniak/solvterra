// AchievementModal Component
// Celebratory modal shown when user earns a new badge

import { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Pressable } from 'react-native';
import { Text, Portal, Modal, Button } from 'react-native-paper';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Colors, spacing } from '@/constants/theme';
import type { UserBadge, Badge } from '@solvterra/shared';

// Badge icon mapping from ID to emoji
const BADGE_ICONS: Record<string, string> = {
  'first-challenge': '🌱',
  'five-challenges': '🤝',
  'ten-challenges': '💪',
  'twentyfive-challenges': '🏆',
  'eco-warrior': '🌿',
  'social-butterfly': '❤️',
  'knowledge-seeker': '📚',
  'health-hero': '🏥',
  'early-bird': '🌅',
  'night-owl': '🦉',
  'five-star': '⭐',
  'week-streak': '🔥',
};

interface AchievementModalProps {
  badge: UserBadge | null;
  visible: boolean;
  onDismiss: () => void;
}

export default function AchievementModal({
  badge,
  visible,
  onDismiss,
}: AchievementModalProps) {
  const { t, i18n } = useTranslation('profile');
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  // Get localized badge name
  const getBadgeName = (b: Badge): string => {
    const key = `badgeNames.${b.id}`;
    const translated = t(key);
    // If translation returns the key itself, use fallback
    if (translated === key) {
      return i18n.language === 'en' && b.name ? b.name : b.name;
    }
    return translated;
  };

  // Get localized badge description
  const getBadgeDescription = (b: Badge): string => {
    if (i18n.language === 'en' && b.description) {
      return b.description;
    }
    return b.criteria || b.description;
  };

  useEffect(() => {
    if (visible) {
      // Animate in
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-dismiss after 5 seconds
      const timer = setTimeout(() => {
        handleDismiss();
      }, 5000);

      return () => clearTimeout(timer);
    } else {
      // Reset animations
      scaleAnim.setValue(0.5);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.5,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  };

  if (!badge) return null;

  const emoji = BADGE_ICONS[badge.badge.id] || '🏅';

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={handleDismiss}
        contentContainerStyle={styles.modalContainer}
      >
        <Pressable onPress={handleDismiss} style={styles.pressableOverlay}>
          <Animated.View
            style={[
              styles.content,
              {
                transform: [{ scale: scaleAnim }],
                opacity: opacityAnim,
              },
            ]}
          >
            {/* Celebration header */}
            <View style={styles.header}>
              <Text style={styles.celebrationText}>🎉</Text>
              <Text variant="titleLarge" style={styles.congratsText}>
                {t('achievement.congratulations', 'Glückwunsch!')}
              </Text>
            </View>

            {/* Badge icon */}
            <View style={styles.badgeContainer}>
              <View style={styles.badgeCircle}>
                <Text style={styles.badgeEmoji}>{emoji}</Text>
              </View>
              {/* Glow effect */}
              <View style={styles.badgeGlow} />
            </View>

            {/* Badge info */}
            <Text variant="titleMedium" style={styles.badgeName}>
              {getBadgeName(badge.badge)}
            </Text>
            <Text style={styles.badgeDescription}>
              {getBadgeDescription(badge.badge)}
            </Text>

            {/* XP bonus */}
            {badge.badge.xpBonus && badge.badge.xpBonus > 0 && (
              <View style={styles.xpBonusContainer}>
                <Feather name="zap" size={18} color={Colors.accent[500]} />
                <Text style={styles.xpBonusText}>
                  +{badge.badge.xpBonus} XP
                </Text>
              </View>
            )}

            {/* Dismiss button */}
            <Button
              mode="contained"
              onPress={handleDismiss}
              style={styles.button}
              labelStyle={styles.buttonLabel}
            >
              {t('achievement.continue', 'Weiter')}
            </Button>

            {/* Tap to dismiss hint */}
            <Text style={styles.tapHint}>
              {t('achievement.tapToDismiss', 'Tippen zum Schließen')}
            </Text>
          </Animated.View>
        </Pressable>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pressableOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  content: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: spacing.xl,
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    maxWidth: 320,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  celebrationText: {
    fontSize: 48,
    marginBottom: spacing.xs,
  },
  congratsText: {
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  badgeContainer: {
    position: 'relative',
    marginBottom: spacing.lg,
  },
  badgeCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.accent[100],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.accent[300],
  },
  badgeGlow: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: 60,
    backgroundColor: Colors.accent[200],
    opacity: 0.3,
    zIndex: -1,
  },
  badgeEmoji: {
    fontSize: 48,
  },
  badgeName: {
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  badgeDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  xpBonusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accent[50],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    marginBottom: spacing.lg,
    gap: spacing.xs,
  },
  xpBonusText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.accent[600],
  },
  button: {
    borderRadius: 12,
    minWidth: 160,
  },
  buttonLabel: {
    fontWeight: '600',
    paddingVertical: 4,
  },
  tapHint: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: spacing.md,
  },
});
