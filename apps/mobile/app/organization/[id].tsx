// Organization Profile Screen
// Public profile view for NGOs/organizations

import { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  Dimensions,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Colors, spacing } from '@/constants/theme';
import { supabase } from '@/lib/supabase';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CATEGORY_COLORS: Record<string, string> = {
  environment: '#22c55e',
  social: '#ec4899',
  education: '#8b5cf6',
  health: '#ef4444',
  animals: '#f97316',
  culture: '#06b6d4',
};

const CATEGORY_ICONS: Record<string, string> = {
  environment: 'leaf',
  social: 'account-group',
  education: 'school',
  health: 'heart-pulse',
  animals: 'paw',
  culture: 'palette',
};

interface OrgProfile {
  id: string;
  name: string;
  description: string | null;
  mission: string | null;
  logo: string | null;
  website: string | null;
  contact_email: string | null;
  category: string | null;
  is_verified: boolean;
  created_at: string;
}

interface OrgChallenge {
  id: string;
  title: string;
  image_url: string | null;
  xp_reward: number;
  duration_minutes: number;
  category: string;
  current_participants: number;
  max_participants: number;
}

export default function OrganizationProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation('challenges');

  const [org, setOrg] = useState<OrgProfile | null>(null);
  const [challenges, setChallenges] = useState<OrgChallenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingChallenges, setIsLoadingChallenges] = useState(false);

  useEffect(() => {
    if (!id) return;
    loadOrganization();
    loadChallenges();
  }, [id]);

  const loadOrganization = async () => {
    setIsLoading(true);

    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      console.error('Failed to load organization:', error);
      setIsLoading(false);
      return;
    }

    setOrg(data as OrgProfile);
    setIsLoading(false);
  };

  const loadChallenges = async () => {
    setIsLoadingChallenges(true);

    const { data, error } = await supabase
      .from('challenges')
      .select('id, title, image_url, xp_reward, duration_minutes, category, current_participants, max_participants')
      .eq('organization_id', id)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to load org challenges:', error);
    } else {
      setChallenges(data || []);
    }
    setIsLoadingChallenges(false);
  };

  const handleWebsite = () => {
    if (org?.website) {
      const url = org.website.startsWith('http') ? org.website : `https://${org.website}`;
      Linking.openURL(url);
    }
  };

  const handleEmail = () => {
    if (org?.contact_email) {
      Linking.openURL(`mailto:${org.contact_email}`);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary[600]} />
      </View>
    );
  }

  if (!org) {
    return (
      <View style={styles.loadingContainer}>
        <MaterialCommunityIcons name="office-building-outline" size={48} color={Colors.neutral[300]} />
        <Text style={styles.errorText}>Organisation nicht gefunden</Text>
      </View>
    );
  }

  const categoryColor = CATEGORY_COLORS[org.category || ''] || Colors.primary[600];
  const categoryIcon = CATEGORY_ICONS[org.category || ''] || 'office-building';

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.logoRing, { borderColor: Colors.primary[600] }]}>
          <Image
            source={{ uri: org.logo || `https://api.dicebear.com/7.x/initials/svg?seed=${org.name}` }}
            style={styles.logo}
          />
        </View>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{org.name}</Text>
          {org.is_verified && (
            <MaterialCommunityIcons name="check-decagram" size={22} color={Colors.primary[600]} />
          )}
        </View>

        {/* Category Badge */}
        {org.category && (
          <View style={[styles.categoryBadge, { backgroundColor: categoryColor + '18' }]}>
            <MaterialCommunityIcons
              name={categoryIcon as any}
              size={16}
              color={categoryColor}
            />
            <Text style={[styles.categoryText, { color: categoryColor }]}>
              {t(`categories.${org.category}`)}
            </Text>
          </View>
        )}

        {/* Member since */}
        <Text style={styles.memberSince}>
          Mitglied seit {formatDate(org.created_at)}
        </Text>
      </View>

      {/* Description */}
      {org.description && (
        <Surface style={styles.section} elevation={1}>
          <Text style={styles.sectionTitle}>Über uns</Text>
          <Text style={styles.sectionText}>{org.description}</Text>
        </Surface>
      )}

      {/* Mission */}
      {org.mission && (
        <Surface style={styles.section} elevation={1}>
          <Text style={styles.sectionTitle}>Unsere Mission</Text>
          <Text style={styles.sectionText}>{org.mission}</Text>
        </Surface>
      )}

      {/* Contact Info */}
      {(org.website || org.contact_email) && (
        <Surface style={styles.section} elevation={1}>
          <Text style={styles.sectionTitle}>Kontakt</Text>
          {org.website && (
            <Pressable style={styles.contactRow} onPress={handleWebsite}>
              <MaterialCommunityIcons name="web" size={20} color={Colors.primary[600]} />
              <Text style={styles.contactLink} numberOfLines={1}>{org.website}</Text>
              <MaterialCommunityIcons name="open-in-new" size={16} color={Colors.textMuted} />
            </Pressable>
          )}
          {org.contact_email && (
            <Pressable style={styles.contactRow} onPress={handleEmail}>
              <MaterialCommunityIcons name="email-outline" size={20} color={Colors.primary[600]} />
              <Text style={styles.contactLink} numberOfLines={1}>{org.contact_email}</Text>
              <MaterialCommunityIcons name="open-in-new" size={16} color={Colors.textMuted} />
            </Pressable>
          )}
        </Surface>
      )}

      {/* Active Challenges */}
      <View style={styles.challengesSection}>
        <Text style={styles.sectionTitle}>Aktive Challenges</Text>

        {isLoadingChallenges ? (
          <View style={styles.challengesLoading}>
            <ActivityIndicator size="small" color={Colors.primary[600]} />
          </View>
        ) : challenges.length > 0 ? (
          <View style={styles.challengesList}>
            {challenges.map(challenge => (
              <Pressable
                key={challenge.id}
                style={styles.challengeCard}
                onPress={() => router.push(`/challenge/${challenge.id}`)}
              >
                {challenge.image_url ? (
                  <Image
                    source={{ uri: challenge.image_url }}
                    style={styles.challengeImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[styles.challengeImage, styles.challengeImagePlaceholder]}>
                    <MaterialCommunityIcons name="trophy-outline" size={24} color={Colors.neutral[400]} />
                  </View>
                )}
                <View style={styles.challengeInfo}>
                  <Text style={styles.challengeTitle} numberOfLines={2}>{challenge.title}</Text>
                  <View style={styles.challengeMeta}>
                    <View style={styles.challengeMetaItem}>
                      <MaterialCommunityIcons name="lightning-bolt" size={14} color="#f59e0b" />
                      <Text style={styles.challengeMetaText}>{challenge.xp_reward} XP</Text>
                    </View>
                    <View style={styles.challengeMetaItem}>
                      <MaterialCommunityIcons name="clock-outline" size={14} color={Colors.textMuted} />
                      <Text style={styles.challengeMetaText}>{challenge.duration_minutes} Min</Text>
                    </View>
                    <View style={styles.challengeMetaItem}>
                      <MaterialCommunityIcons name="account-group-outline" size={14} color={Colors.textMuted} />
                      <Text style={styles.challengeMetaText}>
                        {challenge.current_participants}/{challenge.max_participants}
                      </Text>
                    </View>
                  </View>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={20} color={Colors.neutral[400]} />
              </Pressable>
            ))}
          </View>
        ) : (
          <View style={styles.emptyChallenges}>
            <MaterialCommunityIcons name="trophy-outline" size={40} color={Colors.neutral[300]} />
            <Text style={styles.emptyChallengesText}>Keine aktiven Challenges</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    gap: 12,
  },
  errorText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },

  // Header
  header: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    backgroundColor: '#fff',
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.neutral[200],
  },
  logoRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  logo: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.neutral[200],
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: spacing.sm,
    gap: 6,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
  },
  memberSince: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: spacing.sm,
  },

  // Sections
  section: {
    margin: spacing.md,
    marginBottom: 0,
    padding: spacing.md,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: spacing.sm,
  },
  sectionText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
  },

  // Contact
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.neutral[100],
  },
  contactLink: {
    flex: 1,
    fontSize: 14,
    color: Colors.primary[600],
  },

  // Challenges
  challengesSection: {
    padding: spacing.md,
    paddingTop: spacing.lg,
  },
  challengesLoading: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  challengesList: {
    gap: 10,
  },
  challengeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  challengeImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: Colors.neutral[100],
  },
  challengeImagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  challengeInfo: {
    flex: 1,
  },
  challengeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  challengeMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  challengeMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  challengeMetaText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  emptyChallenges: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyChallengesText: {
    fontSize: 14,
    color: Colors.textMuted,
    marginTop: 8,
  },
});
