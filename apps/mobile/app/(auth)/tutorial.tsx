// Tutorial Screen
// Swipeable introduction to the app features

import { useState, useRef } from 'react';
import { View, StyleSheet, Dimensions, FlatList, Animated } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, spacing } from '@/constants/theme';
import { useUserStore } from '@/store';

const { width } = Dimensions.get('window');

const TUTORIAL_SLIDES = [
  {
    id: '1',
    icon: 'clock-outline',
    iconColor: Colors.primary[600],
    title: 'Micro-Volunteering',
    description: 'Hilf in nur 5-30 Minuten. Perfekt für deinen vollen Stundenplan als Student.',
  },
  {
    id: '2',
    icon: 'trophy-outline',
    iconColor: Colors.secondary[500],
    title: 'Punkte & Badges',
    description: 'Sammle XP für jede Challenge. Steige Level auf und verdiene einzigartige Badges.',
  },
  {
    id: '3',
    icon: 'hand-heart-outline',
    iconColor: Colors.accent[500],
    title: 'Echte Wirkung',
    description: 'Unterstütze verifizierte NGOs und sieh, wie dein Beitrag die Welt verändert.',
  },
];

export default function TutorialScreen() {
  const { completeOnboarding } = useUserStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleNext = () => {
    if (currentIndex < TUTORIAL_SLIDES.length - 1) {
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

  const renderSlide = ({ item }: { item: typeof TUTORIAL_SLIDES[0] }) => (
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
      {TUTORIAL_SLIDES.map((_, index) => {
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
          Überspringen
        </Button>
      </View>

      {/* Slides */}
      <Animated.FlatList
        ref={flatListRef}
        data={TUTORIAL_SLIDES}
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
          {currentIndex === TUTORIAL_SLIDES.length - 1 ? 'Los geht\'s!' : 'Weiter'}
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
