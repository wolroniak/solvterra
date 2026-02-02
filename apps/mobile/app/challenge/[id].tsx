// Challenge Detail Screen
// Full challenge info with accept button and team invite flow

import { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, Alert, Linking, Pressable } from 'react-native';
import { Text, Button, Chip, Portal, Modal, Surface } from 'react-native-paper';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Colors, spacing } from '@/constants/theme';
import { useChallengeStore, useUserStore, useLanguageStore, useTeamStore } from '@/store';
import { useTranslatedChallenge } from '@/hooks';
import { CATEGORIES, MOCK_FRIENDS, MAX_ACTIVE_CHALLENGES } from '@solvterra/shared';
import type { ChallengeSchedule, ChallengeLocation, ChallengeContact, TeammateSeeker } from '@solvterra/shared';
import InviteFriendsModal from '@/components/InviteFriendsModal';
import PhotoSubmissionModal from '@/components/PhotoSubmissionModal';

// Get days until deadline
const getDaysUntilDeadline = (deadline?: Date): number | null => {
  if (!deadline) return null;
  const diff = new Date(deadline).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

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

// Get category config from shared constants
const getCategoryConfig = (categoryId: string) => {
  const category = CATEGORIES.find(c => c.id === categoryId);
  return {
    icon: CATEGORY_ICONS[categoryId] || 'dots-horizontal',
    color: category?.color || Colors.neutral[500],
  };
};

export default function ChallengeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation('challenges');
  const { language } = useLanguageStore();
  const { challenges, submissions, acceptChallenge, submitProof, getActiveCount, canAcceptChallenge } = useChallengeStore();
  const { user } = useUserStore();
  const { myTeams, fetchMyTeams, getTeamForChallenge } = useTeamStore();

  const activeCount = getActiveCount();
  const canAccept = canAcceptChallenge();

  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch teams on mount to get current team status
  useEffect(() => {
    fetchMyTeams();
  }, []);

  // Check if user already has a team for this challenge
  const existingTeam = id ? getTeamForChallenge(id) : undefined;
  const teamInvited = !!existingTeam;
  const invitedFriends = existingTeam?.members
    ?.filter(m => m.role === 'member' && m.status === 'invited')
    ?.map(m => m.userId) || [];

  const rawChallenge = challenges.find(c => c.id === id);
  const existingSubmission = submissions.find(
    s => s.challengeId === id && (s.status === 'in_progress' || s.status === 'submitted')
  );

  // Translate challenge content based on language
  const challenge = useTranslatedChallenge(rawChallenge);

  // Helper to get category label based on language
  const getCategoryLabel = (categoryId: string) => {
    const category = CATEGORIES.find(c => c.id === categoryId);
    if (!category) return t('categories.other');
    return language === 'de' ? category.labelDe : category.label;
  };

  // Helper to format schedule with translations
  const getScheduleDisplay = (schedule?: ChallengeSchedule): { label: string; detail: string; icon: string; urgent?: boolean } => {
    if (!schedule) return { label: t('schedule.anytime'), detail: t('schedule.flexible'), icon: 'calendar-check' };

    const locale = language === 'de' ? 'de-DE' : 'en-US';
    const formatDate = (date: Date) => {
      return new Date(date).toLocaleDateString(locale, {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const formatDateOnly = (date: Date) => {
      return new Date(date).toLocaleDateString(locale, {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    };

    const isUrgent = schedule.deadline &&
      (new Date(schedule.deadline).getTime() - Date.now()) < 3 * 24 * 60 * 60 * 1000;

    switch (schedule.type) {
      case 'fixed':
        return {
          label: t('schedule.fixedDate'),
          detail: schedule.startDate ? formatDate(schedule.startDate) : t('schedule.dateToBeAnnounced'),
          icon: 'calendar-clock',
          urgent: isUrgent,
        };
      case 'range':
        return {
          label: schedule.deadline ? t('schedule.deadline') : t('schedule.dateRange'),
          detail: schedule.deadline
            ? t('schedule.until', { date: formatDateOnly(schedule.deadline) })
            : `${formatDateOnly(schedule.startDate!)} - ${formatDateOnly(schedule.endDate!)}`,
          icon: 'calendar-range',
          urgent: isUrgent,
        };
      case 'recurring':
        return {
          label: t('schedule.recurring'),
          detail: schedule.timeSlots?.join('\n') || t('schedule.timesOnRequest'),
          icon: 'calendar-sync',
          urgent: isUrgent,
        };
      default:
        return { label: t('schedule.anytime'), detail: t('schedule.flexible'), icon: 'calendar-check' };
    }
  };

  // Get days until deadline display
  const getDeadlineText = (daysLeft: number | null) => {
    if (daysLeft === null) return '';
    if (daysLeft <= 0) return t('schedule.dueToday');
    return daysLeft > 1
      ? t('schedule.daysLeftPlural', { count: daysLeft })
      : t('schedule.daysLeft', { count: daysLeft });
  };

  if (!rawChallenge || !challenge) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorState}>
          <MaterialCommunityIcons name="alert-circle" size={64} color={Colors.neutral[300]} />
          <Text variant="titleMedium" style={styles.errorTitle}>
            {t('detail.notFound')}
          </Text>
          <Button mode="contained" onPress={() => router.back()}>
            {t('detail.back')}
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  const categoryConfig = getCategoryConfig(challenge.category);
  const spotsLeft = challenge.maxParticipants - challenge.currentParticipants;
  const canAcceptThis = !existingSubmission && spotsLeft > 0 && canAccept;

  const handleAccept = () => {
    acceptChallenge(challenge.id);
    setShowAcceptModal(false);
    Alert.alert(
      t('alerts.challengeAccepted'),
      t('alerts.challengeAcceptedMessage'),
      [{ text: t('alerts.ok') }]
    );
  };

  const handleInviteComplete = (friendIds: string[]) => {
    setShowInviteModal(false);
    // Refresh teams to get the new team data
    fetchMyTeams();
    // DON'T start the challenge yet - wait for team members to accept
    // Team stays in 'forming' status until all required members accept
    Alert.alert(
      t('alerts.teamInvitesSent'),
      t('alerts.teamInvitesSentMessage'),
      [{ text: t('alerts.ok') }]
    );
  };

  const handleSubmit = async () => {
    if (!existingSubmission) return;

    if (challenge.verificationMethod === 'photo') {
      // Open the photo submission modal
      setShowSubmitModal(false);
      setShowPhotoModal(true);
    } else {
      // Text-based submission
      setIsSubmitting(true);
      await submitProof(existingSubmission.id, {
        type: 'text',
        text: 'Demo submission for presentation.',
      });
      setIsSubmitting(false);
      setShowSubmitModal(false);
      Alert.alert(t('alerts.submitted'), t('alerts.submittedMessage'), [{ text: t('alerts.ok') }]);
    }
  };

  const handlePhotoSubmit = async (data: { type: 'photo'; url: string; caption?: string }) => {
    if (!existingSubmission) return;
    await submitProof(existingSubmission.id, data);
    setShowPhotoModal(false);
    Alert.alert(t('alerts.submitted'), t('alerts.submittedMessage'), [{ text: t('alerts.ok') }]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <Image
          source={{ uri: challenge.imageUrl }}
          style={styles.heroImage}
        />

        {/* Content */}
        <View style={styles.content}>
          {/* Category & Duration */}
          <View style={styles.metaRow}>
            <Chip
              mode="flat"
              style={[styles.categoryChip, { backgroundColor: `${categoryConfig.color}15` }]}
              textStyle={{ color: categoryConfig.color, fontWeight: '600' }}
              icon={() => (
                <MaterialCommunityIcons
                  name={categoryConfig.icon as any}
                  size={16}
                  color={categoryConfig.color}
                />
              )}
            >
              {getCategoryLabel(challenge.category)}
            </Chip>

            <View style={styles.durationBadge}>
              <MaterialCommunityIcons name="clock-outline" size={16} color={Colors.textSecondary} />
              <Text style={styles.durationText}>{t('durations.minutes', { count: challenge.durationMinutes })}</Text>
            </View>

            <Chip
              mode="flat"
              compact
              style={styles.typeChip}
            >
              {challenge.type === 'digital' ? t('filters.digital') : t('filters.onsite')}
            </Chip>
          </View>

          {/* Title */}
          <Text variant="headlineSmall" style={styles.title}>
            {challenge.title}
          </Text>

          {/* Organization */}
          <View style={styles.orgCard}>
            <Image
              source={{ uri: challenge.organization.logoUrl }}
              style={styles.orgLogo}
            />
            <View style={styles.orgInfo}>
              <View style={styles.orgNameRow}>
                <Text variant="titleSmall" style={styles.orgName}>
                  {challenge.organization.name}
                </Text>
                {challenge.organization.verified && (
                  <MaterialCommunityIcons
                    name="check-decagram"
                    size={16}
                    color={Colors.primary[600]}
                  />
                )}
              </View>
              <Text variant="bodySmall" style={styles.orgDescription} numberOfLines={2}>
                {challenge.organization.description}
              </Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              {t('detail.description')}
            </Text>
            <Text variant="bodyLarge" style={styles.description}>
              {challenge.description}
            </Text>
          </View>

          {/* Instructions */}
          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              {t('detail.instructions')}
            </Text>
            <Text variant="bodyLarge" style={styles.description}>
              {challenge.instructions}
            </Text>
          </View>

          {/* When & Where Section */}
          {(challenge.location || challenge.schedule) && (
            <Surface style={styles.whenWhereCard} elevation={1}>
              <View style={styles.whenWhereHeader}>
                <MaterialCommunityIcons name="calendar-clock" size={22} color={Colors.primary[600]} />
                <Text variant="titleMedium" style={styles.whenWhereTitle}>
                  {t('detail.whenAndWhere')}
                </Text>
              </View>

              {/* Schedule Info */}
              {(() => {
                const scheduleInfo = getScheduleDisplay(challenge.schedule);
                const daysLeft = getDaysUntilDeadline(challenge.schedule?.deadline);
                return (
                  <View style={styles.whenWhereItem}>
                    <View style={[
                      styles.whenWhereIconContainer,
                      scheduleInfo.urgent && styles.urgentIconContainer
                    ]}>
                      <MaterialCommunityIcons
                        name={scheduleInfo.icon as any}
                        size={20}
                        color={scheduleInfo.urgent ? Colors.error : Colors.primary[600]}
                      />
                    </View>
                    <View style={styles.whenWhereContent}>
                      <View style={styles.whenWhereLabelRow}>
                        <Text style={styles.whenWhereLabel}>{scheduleInfo.label}</Text>
                        {scheduleInfo.urgent && daysLeft !== null && (
                          <View style={styles.urgentBadge}>
                            <MaterialCommunityIcons name="alert" size={12} color={Colors.error} />
                            <Text style={styles.urgentText}>
                              {getDeadlineText(daysLeft)}
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.whenWhereValue}>{scheduleInfo.detail}</Text>
                    </View>
                  </View>
                );
              })()}

              {/* Location Info for On-Site Challenges */}
              {challenge.type === 'onsite' && challenge.location && (
                <>
                  <View style={styles.whenWhereDivider} />
                  <View style={styles.whenWhereItem}>
                    <View style={styles.whenWhereIconContainer}>
                      <MaterialCommunityIcons name="map-marker" size={20} color={Colors.primary[600]} />
                    </View>
                    <View style={styles.whenWhereContent}>
                      <Text style={styles.whenWhereLabel}>{t('detail.location')}</Text>
                      <Text style={styles.whenWhereValue}>{challenge.location.name}</Text>
                      {challenge.location.address && (
                        <Text style={styles.whenWhereSubtext}>{challenge.location.address}</Text>
                      )}
                    </View>
                  </View>

                  {/* Meeting Point */}
                  {challenge.location.meetingPoint && (
                    <View style={styles.whenWhereItem}>
                      <View style={styles.whenWhereIconContainer}>
                        <MaterialCommunityIcons name="flag-variant" size={20} color={Colors.secondary[600]} />
                      </View>
                      <View style={styles.whenWhereContent}>
                        <Text style={styles.whenWhereLabel}>{t('detail.meetingPoint')}</Text>
                        <Text style={styles.whenWhereValue}>{challenge.location.meetingPoint}</Text>
                      </View>
                    </View>
                  )}

                  {/* Additional Info */}
                  {challenge.location.additionalInfo && (
                    <View style={styles.whenWhereHint}>
                      <MaterialCommunityIcons name="information-outline" size={16} color={Colors.textMuted} />
                      <Text style={styles.whenWhereHintText}>{challenge.location.additionalInfo}</Text>
                    </View>
                  )}

                  {/* Map Button */}
                  {challenge.location.coordinates && (
                    <Pressable
                      style={styles.mapButton}
                      onPress={() => {
                        const { lat, lng } = challenge.location!.coordinates!;
                        const url = `https://maps.google.com/?q=${lat},${lng}`;
                        Linking.openURL(url);
                      }}
                    >
                      <MaterialCommunityIcons name="google-maps" size={18} color={Colors.primary[600]} />
                      <Text style={styles.mapButtonText}>{t('detail.openInMaps')}</Text>
                      <MaterialCommunityIcons name="open-in-new" size={14} color={Colors.primary[600]} />
                    </Pressable>
                  )}
                </>
              )}
            </Surface>
          )}

          {/* Contact Section */}
          {challenge.contact && (
            <Surface style={styles.contactCard} elevation={1}>
              <View style={styles.contactHeader}>
                <MaterialCommunityIcons name="account-circle" size={22} color={Colors.primary[600]} />
                <Text variant="titleMedium" style={styles.contactTitle}>
                  {t('detail.contact')}
                </Text>
              </View>

              <View style={styles.contactPerson}>
                <View style={styles.contactAvatar}>
                  <Text style={styles.contactAvatarText}>
                    {challenge.contact.name.split(' ').map(n => n[0]).join('')}
                  </Text>
                </View>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactName}>{challenge.contact.name}</Text>
                  {challenge.contact.role && (
                    <Text style={styles.contactRole}>{challenge.contact.role}</Text>
                  )}
                  {challenge.contact.responseTime && (
                    <View style={styles.responseTimeRow}>
                      <MaterialCommunityIcons name="clock-fast" size={12} color={Colors.success} />
                      <Text style={styles.responseTimeText}>{challenge.contact.responseTime}</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Contact Actions */}
              <View style={styles.contactActions}>
                {challenge.contact.email && (
                  <Pressable
                    style={[
                      styles.contactAction,
                      challenge.contact.preferredMethod === 'email' && styles.contactActionPreferred
                    ]}
                    onPress={() => Linking.openURL(`mailto:${challenge.contact!.email}`)}
                  >
                    <MaterialCommunityIcons
                      name="email-outline"
                      size={18}
                      color={challenge.contact.preferredMethod === 'email' ? Colors.primary[600] : Colors.textSecondary}
                    />
                    <Text style={[
                      styles.contactActionText,
                      challenge.contact.preferredMethod === 'email' && styles.contactActionTextPreferred
                    ]}>
                      {t('detail.email')}
                    </Text>
                    {challenge.contact.preferredMethod === 'email' && (
                      <View style={styles.preferredBadge}>
                        <Text style={styles.preferredBadgeText}>{t('detail.preferred')}</Text>
                      </View>
                    )}
                  </Pressable>
                )}
                {challenge.contact.phone && (
                  <Pressable
                    style={[
                      styles.contactAction,
                      challenge.contact.preferredMethod === 'phone' && styles.contactActionPreferred
                    ]}
                    onPress={() => Linking.openURL(`tel:${challenge.contact!.phone}`)}
                  >
                    <MaterialCommunityIcons
                      name="phone-outline"
                      size={18}
                      color={challenge.contact.preferredMethod === 'phone' ? Colors.primary[600] : Colors.textSecondary}
                    />
                    <Text style={[
                      styles.contactActionText,
                      challenge.contact.preferredMethod === 'phone' && styles.contactActionTextPreferred
                    ]}>
                      {t('detail.call')}
                    </Text>
                    {challenge.contact.preferredMethod === 'phone' && (
                      <View style={styles.preferredBadge}>
                        <Text style={styles.preferredBadgeText}>{t('detail.preferred')}</Text>
                      </View>
                    )}
                  </Pressable>
                )}
                {challenge.contact.preferredMethod === 'app' && (
                  <View style={[styles.contactAction, styles.contactActionPreferred]}>
                    <MaterialCommunityIcons name="chat-outline" size={18} color={Colors.primary[600]} />
                    <Text style={[styles.contactActionText, styles.contactActionTextPreferred]}>
                      {t('detail.inAppChat')}
                    </Text>
                    <View style={styles.preferredBadge}>
                      <Text style={styles.preferredBadgeText}>{t('detail.preferred')}</Text>
                    </View>
                  </View>
                )}
              </View>
            </Surface>
          )}

          {/* Team Challenge Section */}
          {challenge.isMultiPerson && (
            <Surface style={styles.teamCard} elevation={1}>
              <View style={styles.teamHeader}>
                <View style={styles.teamIconContainer}>
                  <MaterialCommunityIcons name="account-group" size={24} color={Colors.secondary[600]} />
                </View>
                <View style={styles.teamHeaderText}>
                  <Text variant="titleMedium" style={styles.teamTitle}>
                    {t('detail.teamChallenge')}
                  </Text>
                  <Text style={styles.teamSubtitle}>
                    {t('detail.teamSizeNeeded', { min: challenge.minTeamSize, max: challenge.maxTeamSize })}
                  </Text>
                </View>
              </View>
              <Text style={styles.teamDescription}>
                {challenge.teamDescription || t('detail.teamDefaultDescription')}
              </Text>

              {/* Solo Join / Matchmaking Section */}
              {challenge.allowSoloJoin && (
                <View style={styles.matchmakingSection}>
                  <View style={styles.matchmakingHeader}>
                    <View style={styles.matchmakingIconContainer}>
                      <MaterialCommunityIcons name="account-search" size={20} color={Colors.accent[600]} />
                    </View>
                    <View style={styles.matchmakingHeaderText}>
                      <Text style={styles.matchmakingTitle}>{t('detail.joinSoloTitle')}</Text>
                      <Text style={styles.matchmakingSubtitle}>
                        {t('detail.joinSoloSubtitle')}
                      </Text>
                    </View>
                  </View>

                  {/* People already looking for teammates */}
                  {challenge.teammateSeekers && challenge.teammateSeekers.length > 0 && (
                    <View style={styles.seekersContainer}>
                      <Text style={styles.seekersLabel}>
                        {challenge.teammateSeekers.length > 1
                          ? t('detail.seekersLabelPlural', { count: challenge.teammateSeekers.length })
                          : t('detail.seekersLabel', { count: challenge.teammateSeekers.length })}
                      </Text>
                      <View style={styles.seekersList}>
                        {challenge.teammateSeekers.slice(0, 4).map((seeker, index) => (
                          <View key={seeker.id} style={[
                            styles.seekerItem,
                            index === 0 && styles.seekerItemFirst
                          ]}>
                            <Image
                              source={{ uri: seeker.avatarUrl || 'https://i.pravatar.cc/100?u=' + seeker.id }}
                              style={styles.seekerAvatar}
                            />
                            <View style={styles.seekerInfo}>
                              <Text style={styles.seekerName}>{seeker.name}</Text>
                              <View style={styles.seekerLevel}>
                                <MaterialCommunityIcons
                                  name="star"
                                  size={12}
                                  color={Colors.accent[500]}
                                />
                                <Text style={styles.seekerLevelText}>
                                  {seeker.level.charAt(0).toUpperCase() + seeker.level.slice(1)}
                                </Text>
                              </View>
                            </View>
                          </View>
                        ))}
                        {challenge.teammateSeekers.length > 4 && (
                          <View style={styles.moreSeekersContainer}>
                            <Text style={styles.moreSeekers}>
                              {t('detail.moreOthers', { count: challenge.teammateSeekers.length - 4 })}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  )}

                  <Pressable
                    style={styles.soloJoinButton}
                    onPress={() => {
                      acceptChallenge(challenge.id);
                      Alert.alert(
                        t('detail.youAreIn'),
                        t('detail.willNotifyWhenTeamReady'),
                        [{ text: t('alerts.great') }]
                      );
                    }}
                  >
                    <MaterialCommunityIcons name="handshake" size={18} color="#fff" />
                    <Text style={styles.soloJoinButtonText}>
                      {t('detail.soloJoinButton')}
                    </Text>
                  </Pressable>
                </View>
              )}

              {/* Team Preview if team exists */}
              {existingTeam && existingTeam.members && (
                <View style={styles.invitedTeam}>
                  <Text style={styles.invitedTeamTitle}>
                    {existingTeam.status === 'forming' ? t('detail.invitedFriends') : t('detail.yourTeam')}
                  </Text>
                  <View style={styles.invitedAvatars}>
                    {existingTeam.members
                      .filter(m => m.role === 'member')
                      .map(member => (
                        <View key={member.id} style={styles.invitedAvatarContainer}>
                          {member.user?.avatarUrl ? (
                            <Image source={{ uri: member.user.avatarUrl }} style={styles.invitedAvatar} />
                          ) : (
                            <View style={[styles.invitedAvatar, styles.avatarPlaceholder]}>
                              <MaterialCommunityIcons name="account" size={16} color={Colors.neutral[400]} />
                            </View>
                          )}
                          <MaterialCommunityIcons
                            name={member.status === 'accepted' ? 'check-circle' : 'clock-outline'}
                            size={12}
                            color={member.status === 'accepted' ? Colors.success : Colors.accent[500]}
                            style={styles.pendingBadge}
                          />
                        </View>
                      ))}
                  </View>
                  {existingTeam.status === 'forming' && (
                    <Text style={styles.waitingText}>{t('detail.waitingForConfirmation')}</Text>
                  )}
                  {existingTeam.status === 'active' && (
                    <Text style={[styles.waitingText, { color: Colors.success }]}>
                      {t('detail.teamReady')}
                    </Text>
                  )}
                </View>
              )}
            </Surface>
          )}

          {/* Requirements */}
          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              {t('detail.requirements')}
            </Text>
            <View style={styles.requirementItem}>
              <MaterialCommunityIcons
                name={challenge.verificationMethod === 'photo' ? 'camera-outline' : challenge.verificationMethod === 'text' ? 'text-box-outline' : 'check-decagram-outline'}
                size={20}
                color={Colors.primary[600]}
              />
              <Text variant="bodyMedium" style={styles.requirementText}>
                {t('detail.verificationLabel', { method: t(`detail.verification.${challenge.verificationMethod}`) })}
              </Text>
            </View>
            <View style={styles.requirementItem}>
              <MaterialCommunityIcons
                name="account-group-outline"
                size={20}
                color={Colors.primary[600]}
              />
              <Text variant="bodyMedium" style={styles.requirementText}>
                {t('detail.spotsAvailable', { available: spotsLeft, total: challenge.maxParticipants })}
              </Text>
            </View>
            {challenge.isMultiPerson && (
              <View style={styles.requirementItem}>
                <MaterialCommunityIcons
                  name="account-multiple"
                  size={20}
                  color={Colors.secondary[600]}
                />
                <Text variant="bodyMedium" style={[styles.requirementText, { color: Colors.secondary[700] }]}>
                  {t('detail.teamSize', { min: challenge.minTeamSize, max: challenge.maxTeamSize })}
                </Text>
              </View>
            )}
          </View>

          {/* Active Challenges Indicator */}
          <Surface style={[
            styles.activeLimitCard,
            !canAccept && styles.activeLimitCardFull
          ]} elevation={1}>
            <View style={styles.activeLimitContent}>
              <View style={[
                styles.activeLimitIconContainer,
                !canAccept && styles.activeLimitIconContainerFull
              ]}>
                <MaterialCommunityIcons
                  name={canAccept ? 'clipboard-list' : 'clipboard-alert'}
                  size={22}
                  color={canAccept ? Colors.primary[600] : Colors.error}
                />
              </View>
              <View style={styles.activeLimitInfo}>
                <Text style={[
                  styles.activeLimitTitle,
                  !canAccept && styles.activeLimitTitleFull
                ]}>
                  {t('detail.activeChallenges', { current: activeCount, max: MAX_ACTIVE_CHALLENGES })}
                </Text>
                <Text style={styles.activeLimitSubtitle}>
                  {canAccept
                    ? t('detail.canAcceptMore', { count: MAX_ACTIVE_CHALLENGES - activeCount })
                    : t('detail.completeOneFirst')}
                </Text>
              </View>
            </View>
            {/* Progress dots */}
            <View style={styles.activeLimitDots}>
              {Array.from({ length: MAX_ACTIVE_CHALLENGES }).map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.activeLimitDot,
                    i < activeCount && styles.activeLimitDotFilled,
                    i < activeCount && !canAccept && styles.activeLimitDotFull
                  ]}
                />
              ))}
            </View>
          </Surface>

          {/* XP Reward */}
          <Surface style={styles.rewardCard} elevation={1}>
            <MaterialCommunityIcons name="star" size={32} color={Colors.accent[500]} />
            <View style={styles.rewardInfo}>
              <Text variant="titleMedium" style={styles.rewardValue}>
                +{challenge.xpReward} XP
              </Text>
              <Text variant="bodySmall" style={styles.rewardLabel}>
                {t('detail.xpOnCompletion')}
              </Text>
            </View>
          </Surface>
        </View>
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomBar}>
        {existingSubmission?.status === 'in_progress' ? (
          <Button
            mode="contained"
            onPress={() => setShowSubmitModal(true)}
            style={styles.actionButton}
            contentStyle={styles.actionButtonContent}
          >
            {t('detail.uploadProof')}
          </Button>
        ) : existingSubmission?.status === 'submitted' ? (
          <Button
            mode="contained"
            disabled
            style={styles.actionButton}
            contentStyle={styles.actionButtonContent}
          >
            {t('detail.underReview')}
          </Button>
        ) : existingTeam?.status === 'forming' ? (
          // Team exists but waiting for members to accept
          <Button
            mode="contained"
            disabled
            style={[styles.actionButton, styles.teamActionButton]}
            contentStyle={styles.actionButtonContent}
            icon="clock-outline"
          >
            {t('detail.waitingForTeam')}
          </Button>
        ) : existingTeam?.status === 'active' ? (
          // Team is ready - user can start the challenge
          <Button
            mode="contained"
            onPress={() => {
              acceptChallenge(challenge.id);
              Alert.alert(
                t('alerts.challengeAccepted'),
                t('alerts.challengeAcceptedMessage'),
                [{ text: t('alerts.ok') }]
              );
            }}
            style={[styles.actionButton, styles.teamActionButton]}
            contentStyle={styles.actionButtonContent}
            icon="play"
          >
            {t('detail.startTeamChallenge')}
          </Button>
        ) : canAcceptThis ? (
          challenge.isMultiPerson ? (
            <Button
              mode="contained"
              onPress={() => setShowInviteModal(true)}
              style={[styles.actionButton, styles.teamActionButton]}
              contentStyle={styles.actionButtonContent}
              icon="account-group"
            >
              {t('detail.buildTeam')}
            </Button>
          ) : (
            <Button
              mode="contained"
              onPress={() => setShowAcceptModal(true)}
              style={styles.actionButton}
              contentStyle={styles.actionButtonContent}
            >
              {t('detail.acceptButton')}
            </Button>
          )
        ) : (
          <Button
            mode="contained"
            disabled
            style={styles.actionButton}
            contentStyle={styles.actionButtonContent}
          >
            {!canAccept
              ? t('detail.limitReached', { current: activeCount, max: MAX_ACTIVE_CHALLENGES })
              : spotsLeft === 0
              ? t('detail.fullyBooked')
              : t('detail.alreadyParticipated')}
          </Button>
        )}
      </View>

      {/* Accept Modal */}
      <Portal>
        <Modal
          visible={showAcceptModal}
          onDismiss={() => setShowAcceptModal(false)}
          contentContainerStyle={styles.modal}
        >
          <MaterialCommunityIcons
            name="rocket-launch"
            size={64}
            color={Colors.primary[600]}
          />
          <Text variant="titleLarge" style={styles.modalTitle}>
            {t('modals.readyForChallenge')}
          </Text>
          <Text variant="bodyMedium" style={styles.modalText}>
            {t('modals.timeAndProof', { minutes: challenge.durationMinutes })}
          </Text>
          <View style={styles.modalButtons}>
            <Button
              mode="outlined"
              onPress={() => setShowAcceptModal(false)}
              style={styles.modalButton}
            >
              {t('modals.cancel')}
            </Button>
            <Button
              mode="contained"
              onPress={handleAccept}
              style={styles.modalButton}
            >
              {t('modals.letsGo')}
            </Button>
          </View>
        </Modal>
      </Portal>

      {/* Submit Modal */}
      <Portal>
        <Modal
          visible={showSubmitModal}
          onDismiss={() => !isSubmitting && setShowSubmitModal(false)}
          contentContainerStyle={styles.modal}
        >
          <MaterialCommunityIcons
            name={challenge.verificationMethod === 'photo' ? 'camera' : 'text-box-outline'}
            size={64}
            color={Colors.secondary[500]}
          />
          <Text variant="titleLarge" style={styles.modalTitle}>
            {t('modals.uploadSubmission')}
          </Text>
          <Text variant="bodyMedium" style={styles.modalText}>
            {challenge.verificationMethod === 'photo'
              ? t('modals.uploadPhotoProof')
              : t('modals.describeWhatYouDid')}
          </Text>
          <Text variant="bodySmall" style={styles.modalNote}>
            {t('modals.demoNote')}
          </Text>
          <View style={styles.modalButtons}>
            <Button
              mode="outlined"
              onPress={() => setShowSubmitModal(false)}
              style={styles.modalButton}
              disabled={isSubmitting}
            >
              {t('modals.cancel')}
            </Button>
            <Button
              mode="contained"
              onPress={handleSubmit}
              style={styles.modalButton}
              loading={isSubmitting}
            >
              {t('modals.submit')}
            </Button>
          </View>
        </Modal>
      </Portal>

      {/* Invite Friends Modal for Team Challenges */}
      <InviteFriendsModal
        visible={showInviteModal}
        onDismiss={() => setShowInviteModal(false)}
        challenge={challenge}
        onInviteComplete={handleInviteComplete}
      />

      {existingSubmission && (
        <PhotoSubmissionModal
          visible={showPhotoModal}
          onClose={() => setShowPhotoModal(false)}
          onSubmit={handlePhotoSubmit}
          submissionId={existingSubmission.id}
          challengeTitle={challenge.title}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  heroImage: {
    width: '100%',
    height: 240,
    backgroundColor: Colors.neutral[200],
  },
  content: {
    padding: spacing.lg,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  categoryChip: {
    borderRadius: 20,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  durationText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  typeChip: {
    backgroundColor: Colors.neutral[100],
  },
  title: {
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: spacing.md,
  },
  orgCard: {
    flexDirection: 'row',
    backgroundColor: Colors.neutral[50],
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.lg,
  },
  orgLogo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.neutral[200],
  },
  orgInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  orgNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  orgName: {
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  orgDescription: {
    color: Colors.textSecondary,
    marginTop: 2,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: spacing.sm,
  },
  description: {
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  requirementText: {
    color: Colors.textSecondary,
  },
  rewardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accent[50],
    padding: spacing.md,
    borderRadius: 12,
    gap: spacing.md,
  },
  rewardInfo: {
    flex: 1,
  },
  rewardValue: {
    fontWeight: '700',
    color: Colors.accent[700],
  },
  rewardLabel: {
    color: Colors.accent[600],
  },
  bottomBar: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[200],
    backgroundColor: '#fff',
  },
  actionButton: {
    borderRadius: 12,
  },
  actionButtonContent: {
    paddingVertical: spacing.sm,
  },
  errorState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  errorTitle: {
    color: Colors.textPrimary,
  },
  modal: {
    backgroundColor: '#fff',
    margin: spacing.xl,
    padding: spacing.xl,
    borderRadius: 16,
    alignItems: 'center',
  },
  modalTitle: {
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  modalText: {
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 22,
  },
  modalNote: {
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xs,
    fontStyle: 'italic',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  modalButton: {
    flex: 1,
    borderRadius: 12,
  },
  teamActionButton: {
    backgroundColor: Colors.secondary[600],
  },
  teamCard: {
    backgroundColor: Colors.secondary[50],
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: Colors.secondary[200],
  },
  teamHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  teamIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.secondary[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  teamHeaderText: {
    marginLeft: spacing.md,
  },
  teamTitle: {
    fontWeight: '700',
    color: Colors.secondary[700],
  },
  teamSubtitle: {
    fontSize: 13,
    color: Colors.secondary[600],
  },
  teamDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  invitedTeam: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.secondary[200],
  },
  invitedTeamTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
    marginBottom: spacing.sm,
  },
  invitedAvatars: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  invitedAvatarContainer: {
    position: 'relative',
  },
  invitedAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.neutral[200],
  },
  avatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  pendingBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#fff',
    borderRadius: 6,
  },
  waitingText: {
    fontSize: 12,
    color: Colors.accent[600],
    marginTop: spacing.sm,
    fontStyle: 'italic',
  },
  // When & Where Section Styles
  whenWhereCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: Colors.neutral[100],
  },
  whenWhereHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  whenWhereTitle: {
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  whenWhereItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  whenWhereIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  urgentIconContainer: {
    backgroundColor: `${Colors.error}15`,
  },
  whenWhereContent: {
    flex: 1,
  },
  whenWhereLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: 2,
  },
  whenWhereLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  whenWhereValue: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  whenWhereSubtext: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  whenWhereDivider: {
    height: 1,
    backgroundColor: Colors.neutral[100],
    marginVertical: spacing.md,
  },
  whenWhereHint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.neutral[50],
    padding: spacing.sm,
    borderRadius: 8,
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  whenWhereHintText: {
    flex: 1,
    fontSize: 13,
    color: Colors.textMuted,
    lineHeight: 18,
  },
  urgentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${Colors.error}15`,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 4,
  },
  urgentText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.error,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary[50],
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 10,
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  mapButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary[600],
  },
  // Contact Section Styles
  contactCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: Colors.neutral[100],
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  contactTitle: {
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  contactPerson: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  contactAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactAvatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary[700],
  },
  contactInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  contactRole: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  responseTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  responseTimeText: {
    fontSize: 12,
    color: Colors.success,
    fontWeight: '500',
  },
  contactActions: {
    gap: spacing.sm,
  },
  contactAction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral[50],
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 10,
    gap: spacing.sm,
  },
  contactActionPreferred: {
    backgroundColor: Colors.primary[50],
    borderWidth: 1,
    borderColor: Colors.primary[200],
  },
  contactActionText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  contactActionTextPreferred: {
    color: Colors.primary[700],
  },
  preferredBadge: {
    marginLeft: 'auto',
    backgroundColor: Colors.primary[100],
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 8,
  },
  preferredBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.primary[700],
  },
  // Matchmaking Section Styles
  matchmakingSection: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.secondary[200],
  },
  matchmakingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  matchmakingIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.accent[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  matchmakingHeaderText: {
    marginLeft: spacing.sm,
  },
  matchmakingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.accent[700],
  },
  matchmakingSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  seekersContainer: {
    marginBottom: spacing.md,
  },
  seekersLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textMuted,
    marginBottom: spacing.sm,
  },
  seekersList: {
    gap: spacing.xs,
  },
  seekerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: spacing.sm,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.neutral[100],
  },
  seekerItemFirst: {
    borderColor: Colors.accent[200],
    backgroundColor: Colors.accent[50],
  },
  seekerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.neutral[200],
  },
  seekerInfo: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  seekerName: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  seekerLevel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 1,
  },
  seekerLevelText: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  moreSeekersContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  moreSeekers: {
    fontSize: 12,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
  soloJoinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accent[600],
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    gap: spacing.sm,
  },
  soloJoinButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  // Active Challenge Limit Styles
  activeLimitCard: {
    backgroundColor: Colors.primary[50],
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: Colors.primary[100],
  },
  activeLimitCardFull: {
    backgroundColor: `${Colors.error}08`,
    borderColor: `${Colors.error}30`,
  },
  activeLimitContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  activeLimitIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  activeLimitIconContainerFull: {
    backgroundColor: `${Colors.error}15`,
  },
  activeLimitInfo: {
    flex: 1,
  },
  activeLimitTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary[700],
  },
  activeLimitTitleFull: {
    color: Colors.error,
  },
  activeLimitSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  activeLimitDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingTop: spacing.sm,
  },
  activeLimitDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.neutral[200],
    borderWidth: 1,
    borderColor: Colors.neutral[300],
  },
  activeLimitDotFilled: {
    backgroundColor: Colors.primary[500],
    borderColor: Colors.primary[600],
  },
  activeLimitDotFull: {
    backgroundColor: Colors.error,
    borderColor: Colors.error,
  },
});
