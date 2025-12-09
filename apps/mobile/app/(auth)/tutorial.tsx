// Tutorial Screen
// Swipeable introduction to the app features

import { useState, useRef, useMemo } from 'react';
import { View, StyleSheet, Dimensions, FlatList, Animated } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Colors, spacing } from '@/constants/theme';
import { useUserStore } from '@/store';

const { width } = Dimensions.get('window');

// Slide configuration (non-translated)
const SLIDE_CONFIG = [
  { id: '1', icon: 'clock-outline', iconColor: Colors.primary[600], step: 'step1' },
  { id: '2', icon: 'trophy-outline', iconColor: Colors.secondary[500], step: 'step2' },
  { id: '3', icon: 'hand-heart-outline', iconColor: Colors.accent[500], step: 'step3' },
];

interface TutorialSlide {
  id: string;
  icon: string;
  iconColor: string;
  title: string;
  description: string;
}

export default function TutorialScreen() {
  const { t } = useTranslation('auth');
  const { completeOnboarding } = useUserStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  // Build slides with translations
  const tutorialSlides: TutorialSlide[] = useMemo(() =>
    SLIDE_CONFIG.map(config => ({
      id: config.id,
      icon: config.icon,
      iconColor: config.iconColor,
      title: t(`onboarding.tutorialStep.${config.step}.title`),
      description: t(`onboarding.tutorialStep.${config.step}.description`),
    })), [t]);

  const handleNext = () => {
    if (currentIndex < tutorialSlides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    completeOnboarding();
    router.replace('/(tabs)');
  };

  const handleSkip = () => {
    completeOnboarding();
    router.replace('/(tabs)');
  };

  const renderSlide = ({ item }: { item: TutorialSlide }) => (
    <View style={styles.slide}>
      <View style={[styles.iconCircle, { backgroundColor: `${item.iconColor}15` }]}>
        <MaterialCommunityIcons
          name={item.icon as any}
          size={80}
          color={item.iconColor}
        />
      </View>
      <Text variant="headlineSmall" style={styles.slideTitle}>
        {item.title}
      </Text>
      <Text variant="bodyLarge" style={styles.slideDescription}>
        {item.description}
      </Text>
    </View>
  );

  const renderDots = () => (
    <View style={styles.dotsContainer}>
      {tutorialSlides.map((_, index) => {
        const inputRange = [
          (index - 1) * width,
          index * width,
          (index + 1) * width,
        ];
        const dotWidth = scrollX.interpolate({
          inputRange,
          outputRange: [8, 24, 8],
          extrapolate: 'clamp',
        });
        const opacity = scrollX.interpolate({
          inputRange,
          outputRange: [0.3, 1, 0.3],
          extrapolate: 'clamp',
        });
        return (
          <Animated.View
            key={index}
            style={[
              styles.dot,
              {
                width: dotWidth,
                opacity,
                backgroundColor: Colors.primary[600],
              },
            ]}
          />
        );
      })}
    </View>
  );

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  return (
    <SafeAreaView style={styles.container}>
      {/* Skip Button */}
      <View style={styles.header}>
        <Button
          mode="text"
          onPress={handleSkip}
          textColor={Colors.textSecondary}
        >
          {t('onboarding.interestsStep.skip')}
        </Button>
      </View>

      {/* Slides */}
      <Animated.FlatList
        ref={flatListRef}
        data={tutorialSlides}
        renderItem={renderSlide}
        keyExtractor={item => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        scrollEventThrottle={16}
      />

      {/* Dots */}
      {renderDots()}

      {/* Button */}
      <View style={styles.footer}>
        <Button
          mode="contained"
          onPress={handleNext}
          style={styles.button}
          contentStyle={styles.buttonContent}
        >
          {currentIndex === tutorialSlides.length - 1
            ? t('onboarding.completeButton')
            : t('onboarding.interestsStep.continue')}
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
  header: {
    alignItems: 'flex-end',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  slide: {
    width,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  iconCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxl,
  },
  slideTitle: {
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  slideDescription: {
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: spacing.md,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  button: {
    borderRadius: 12,
  },
  buttonContent: {
    paddingVertical: spacing.sm,
  },
});
