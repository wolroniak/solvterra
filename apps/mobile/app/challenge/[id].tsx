// Challenge Detail Screen
// Full challenge info with accept button and team invite flow

import { useState } from 'react';
import { View, StyleSheet, ScrollView, Image, Alert, Linking, Pressable } from 'react-native';
import { Text, Button, Chip, Portal, Modal, Surface } from 'react-native-paper';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, spacing } from '@/constants/theme';
import { useChallengeStore, useUserStore } from '@/store';
import { CATEGORIES, MOCK_FRIENDS, MAX_ACTIVE_CHALLENGES } from '@solvterra/shared';
import type { ChallengeSchedule, ChallengeLocation, ChallengeContact, TeammateSeeker } from '@solvterra/shared';
import InviteFriendsModal from '@/components/InviteFriendsModal';

// Format schedule for display
const formatSchedule = (schedule?: ChallengeSchedule): { label: string; detail: string; icon: string; urgent?: boolean } => {
  if (!schedule) return { label: 'Jederzeit', detail: 'Flexibel durchführbar', icon: 'calendar-check' };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('de-DE', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateOnly = (date: Date) => {
    return new Date(date).toLocaleDateString('de-DE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Check if deadline is approaching (within 3 days)
  const isUrgent = schedule.deadline &&
    (new Date(schedule.deadline).getTime() - Date.now()) < 3 * 24 * 60 * 60 * 1000;

  switch (schedule.type) {
    case 'fixed':
      return {
        label: 'Fester Termin',
        detail: schedule.startDate ? formatDate(schedule.startDate) : 'Termin wird bekannt gegeben',
        icon: 'calendar-clock',
        urgent: isUrgent,
      };
    case 'range':
      return {
        label: schedule.deadline ? 'Deadline' : 'Zeitraum',
        detail: schedule.deadline
          ? `Bis ${formatDateOnly(schedule.deadline)}`
          : `${formatDateOnly(schedule.startDate!)} - ${formatDateOnly(schedule.endDate!)}`,
        icon: 'calendar-range',
        urgent: isUrgent,
      };
    case 'recurring':
      return {
        label: 'Regelmäßig',
        detail: schedule.timeSlots?.join('\n') || 'Zeiten auf Anfrage',
        icon: 'calendar-sync',
        urgent: isUrgent,
      };
    default:
      return { label: 'Jederzeit', detail: 'Flexibel durchführbar', icon: 'calendar-check' };
  }
};

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
    label: category?.labelDe || 'Sonstiges',
  };
};

const VERIFICATION_LABELS: Record<string, string> = {
  photo: 'Foto hochladen',
  text: 'Text einreichen',
  ngo_confirmation: 'NGO Bestätigung',
};

export default function ChallengeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { challenges, submissions, acceptChallenge, submitProof, simulateApproval, getActiveCount, canAcceptChallenge } = useChallengeStore();
  const { user } = useUserStore();

  const activeCount = getActiveCount();
  const canAccept = canAcceptChallenge();

  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [teamInvited, setTeamInvited] = useState(false);
  const [invitedFriends, setInvitedFriends] = useState<string[]>([]);

  const challenge = challenges.find(c => c.id === id);
  const existingSubmission = submissions.find(
    s => s.challengeId === id && (s.status === 'in_progress' || s.status === 'submitted')
  );

  if (!challenge) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorState}>
          <MaterialCommunityIcons name="alert-circle" size={64} color={Colors.neutral[300]} />
          <Text variant="titleMedium" style={styles.errorTitle}>
            Challenge nicht gefunden
          </Text>
          <Button mode="contained" onPress={() => router.back()}>
            Zurück
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
      'Challenge angenommen!',
      'Du findest sie jetzt unter "Meine Challenges".',
      [{ text: 'OK' }]
    );
  };

  const handleInviteComplete = (friendIds: string[]) => {
    setInvitedFriends(friendIds);
    setTeamInvited(true);
    setShowInviteModal(false);
    // After invite, accept the challenge
    acceptChallenge(challenge.id);
    Alert.alert(
      'Team-Challenge gestartet!',
      'Sobald deine Freunde zusagen, könnt ihr gemeinsam loslegen.',
      [{ text: 'Super!' }]
    );
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simulate submission
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (existingSubmission) {
      submitProof(existingSubmission.id, {
        type: challenge.verificationMethod === 'photo' ? 'photo' : 'text',
        url: 'https://picsum.photos/800/600',
        text: 'Demo-Einreichung für die Präsentation.',
      });
    }

    setIsSubmitting(false);
    setShowSubmitModal(false);

    // Simulate automatic approval for demo
    setTimeout(() => {
      if (existingSubmission) {
        simulateApproval(existingSubmission.id, 5);
        Alert.alert(
          'Glückwunsch!',
          `Deine Einreichung wurde genehmigt! Du hast ${challenge.xpReward} XP verdient.`,
          [{ text: 'Super!' }]
        );
      }
    }, 2000);

    Alert.alert(
      'Eingereicht!',
      'Deine Einreichung wird überprüft. Du erhältst eine Benachrichtigung.',
      [{ text: 'OK' }]
    );
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
              {categoryConfig.label}
            </Chip>

            <View style={styles.durationBadge}>
              <MaterialCommunityIcons name="clock-outline" size={16} color={Colors.textSecondary} />
              <Text style={styles.durationText}>{challenge.durationMinutes} Min</Text>
            </View>

            <Chip
              mode="flat"
              compact
              style={styles.typeChip}
            >
              {challenge.type === 'digital' ? 'Digital' : 'Vor Ort'}
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
              Beschreibung
            </Text>
            <Text variant="bodyLarge" style={styles.description}>
              {challenge.description}
            </Text>
          </View>

          {/* Instructions */}
          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Anleitung
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
                  Wann & Wo
                </Text>
              </View>

              {/* Schedule Info */}
              {(() => {
                const scheduleInfo = formatSchedule(challenge.schedule);
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
                              {daysLeft <= 0 ? 'Heute fällig!' : `Noch ${daysLeft} Tag${daysLeft > 1 ? 'e' : ''}`}
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
                      <Text style={styles.whenWhereLabel}>Ort</Text>
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
                        <Text style={styles.whenWhereLabel}>Treffpunkt</Text>
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
                      <Text style={styles.mapButtonText}>In Google Maps öffnen</Text>
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
                  Ansprechpartner
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
                      E-Mail
                    </Text>
                    {challenge.contact.preferredMethod === 'email' && (
                      <View style={styles.preferredBadge}>
                        <Text style={styles.preferredBadgeText}>Bevorzugt</Text>
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
                      Anrufen
                    </Text>
                    {challenge.contact.preferredMethod === 'phone' && (
                      <View style={styles.preferredBadge}>
                        <Text style={styles.preferredBadgeText}>Bevorzugt</Text>
                      </View>
                    )}
                  </Pressable>
                )}
                {challenge.contact.preferredMethod === 'app' && (
                  <View style={[styles.contactAction, styles.contactActionPreferred]}>
                    <MaterialCommunityIcons name="chat-outline" size={18} color={Colors.primary[600]} />
                    <Text style={[styles.contactActionText, styles.contactActionTextPreferred]}>
                      In-App Chat
                    </Text>
                    <View style={styles.preferredBadge}>
                      <Text style={styles.preferredBadgeText}>Bevorzugt</Text>
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
                    Team-Challenge
                  </Text>
                  <Text style={styles.teamSubtitle}>
                    {challenge.minTeamSize}-{challenge.maxTeamSize} Personen benötigt
                  </Text>
                </View>
              </View>
              <Text style={styles.teamDescription}>
                {challenge.teamDescription || 'Diese Challenge macht ihr gemeinsam! Lade Freunde ein und meistert sie zusammen.'}
              </Text>

              {/* Solo Join / Matchmaking Section */}
              {challenge.allowSoloJoin && (
                <View style={styles.matchmakingSection}>
                  <View style={styles.matchmakingHeader}>
                    <View style={styles.matchmakingIconContainer}>
                      <MaterialCommunityIcons name="account-search" size={20} color={Colors.accent[600]} />
                    </View>
                    <View style={styles.matchmakingHeaderText}>
                      <Text style={styles.matchmakingTitle}>Alleine mitmachen</Text>
                      <Text style={styles.matchmakingSubtitle}>
                        Lerne neue Leute kennen!
                      </Text>
                    </View>
                  </View>

                  {/* People already looking for teammates */}
                  {challenge.teammateSeekers && challenge.teammateSeekers.length > 0 && (
                    <View style={styles.seekersContainer}>
                      <Text style={styles.seekersLabel}>
                        {challenge.teammateSeekers.length} Person{challenge.teammateSeekers.length > 1 ? 'en' : ''} sucht{challenge.teammateSeekers.length > 1 ? 'en' : ''} Teammates:
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
                              +{challenge.teammateSeekers.length - 4} weitere
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
                        'Du bist dabei!',
                        'Wir benachrichtigen dich, sobald genug Teilnehmer gefunden wurden.',
                        [{ text: 'Super!' }]
                      );
                    }}
                  >
                    <MaterialCommunityIcons name="handshake" size={18} color="#fff" />
                    <Text style={styles.soloJoinButtonText}>
                      Alleine teilnehmen & Team finden
                    </Text>
                  </Pressable>
                </View>
              )}

              {/* Team Preview if invited */}
              {teamInvited && invitedFriends.length > 0 && (
                <View style={styles.invitedTeam}>
                  <Text style={styles.invitedTeamTitle}>Eingeladene Freunde:</Text>
                  <View style={styles.invitedAvatars}>
                    {MOCK_FRIENDS.filter(f => invitedFriends.includes(f.id)).map(friend => (
                      <View key={friend.id} style={styles.invitedAvatarContainer}>
                        <Image source={{ uri: friend.avatarUrl }} style={styles.invitedAvatar} />
                        <MaterialCommunityIcons
                          name="clock-outline"
                          size={12}
                          color={Colors.accent[500]}
                          style={styles.pendingBadge}
                        />
                      </View>
                    ))}
                  </View>
                  <Text style={styles.waitingText}>Warte auf Bestätigung...</Text>
                </View>
              )}
            </Surface>
          )}

          {/* Requirements */}
          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Anforderungen
            </Text>
            <View style={styles.requirementItem}>
              <MaterialCommunityIcons
                name={challenge.verificationMethod === 'photo' ? 'camera-outline' : challenge.verificationMethod === 'text' ? 'text-box-outline' : 'check-decagram-outline'}
                size={20}
                color={Colors.primary[600]}
              />
              <Text variant="bodyMedium" style={styles.requirementText}>
                Nachweis: {VERIFICATION_LABELS[challenge.verificationMethod]}
              </Text>
            </View>
            <View style={styles.requirementItem}>
              <MaterialCommunityIcons
                name="account-group-outline"
                size={20}
                color={Colors.primary[600]}
              />
              <Text variant="bodyMedium" style={styles.requirementText}>
                {spotsLeft} von {challenge.maxParticipants} Plätzen verfügbar
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
                  Teamgröße: {challenge.minTeamSize}-{challenge.maxTeamSize} Personen
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
                  {activeCount}/{MAX_ACTIVE_CHALLENGES} aktive Challenges
                </Text>
                <Text style={styles.activeLimitSubtitle}>
                  {canAccept
                    ? `Du kannst noch ${MAX_ACTIVE_CHALLENGES - activeCount} weitere annehmen`
                    : 'Schließe zuerst eine Challenge ab'}
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
                bei erfolgreicher Teilnahme
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
            Einreichung hochladen
          </Button>
        ) : existingSubmission?.status === 'submitted' ? (
          <Button
            mode="contained"
            disabled
            style={styles.actionButton}
            contentStyle={styles.actionButtonContent}
          >
            Wird überprüft...
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
              Team zusammenstellen
            </Button>
          ) : (
            <Button
              mode="contained"
              onPress={() => setShowAcceptModal(true)}
              style={styles.actionButton}
              contentStyle={styles.actionButtonContent}
            >
              Challenge annehmen
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
              ? 'Limit erreicht (5/5)'
              : spotsLeft === 0
              ? 'Ausgebucht'
              : 'Bereits teilgenommen'}
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
            Bereit für die Challenge?
          </Text>
          <Text variant="bodyMedium" style={styles.modalText}>
            Du hast {challenge.durationMinutes} Minuten Zeit. Nach Abschluss lädst du deinen Nachweis hoch.
          </Text>
          <View style={styles.modalButtons}>
            <Button
              mode="outlined"
              onPress={() => setShowAcceptModal(false)}
              style={styles.modalButton}
            >
              Abbrechen
            </Button>
            <Button
              mode="contained"
              onPress={handleAccept}
              style={styles.modalButton}
            >
              Los geht's!
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
            Einreichung hochladen
          </Text>
          <Text variant="bodyMedium" style={styles.modalText}>
            {challenge.verificationMethod === 'photo'
              ? 'Lade ein Foto als Nachweis hoch.'
              : 'Beschreibe, was du gemacht hast.'}
          </Text>
          <Text variant="bodySmall" style={styles.modalNote}>
            (Demo-Modus: Es wird eine Beispiel-Einreichung erstellt)
          </Text>
          <View style={styles.modalButtons}>
            <Button
              mode="outlined"
              onPress={() => setShowSubmitModal(false)}
              style={styles.modalButton}
              disabled={isSubmitting}
            >
              Abbrechen
            </Button>
            <Button
              mode="contained"
              onPress={handleSubmit}
              style={styles.modalButton}
              loading={isSubmitting}
            >
              Einreichen
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
