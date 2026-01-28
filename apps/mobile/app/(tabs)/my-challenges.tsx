// My Challenges Screen
// Shows user's active, pending, and completed challenges with timeline view

import { useState, useMemo, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, Pressable, Image, SectionList, Alert } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, spacing } from '@/constants/theme';
import { useChallengeStore, useCommunityStore } from '@/store';
import { MAX_ACTIVE_CHALLENGES } from '@solvterra/shared';
import type { Submission, Challenge, CommunityPost } from '@solvterra/shared';
import CreatePostModal from '@/components/CreatePostModal';
import PhotoSubmissionModal from '@/components/PhotoSubmissionModal';

type TabValue = 'active' | 'pending' | 'completed';

// Tab configuration with icons and short labels
const TABS: { value: TabValue; label: string; icon: string }[] = [
  { value: 'active', label: 'Aktiv', icon: 'play-circle-outline' },
  { value: 'pending', label: 'Wartend', icon: 'clock-outline' },
  { value: 'completed', label: 'Fertig', icon: 'check-circle-outline' },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  accepted: { label: 'Angenommen', color: Colors.primary[600], icon: 'check' },
  in_progress: { label: 'In Bearbeitung', color: Colors.primary[600], icon: 'progress-clock' },
  submitted: { label: 'Eingereicht', color: Colors.accent[500], icon: 'clock-outline' },
  approved: { label: 'Genehmigt', color: Colors.success, icon: 'check-circle' },
  rejected: { label: 'Abgelehnt', color: Colors.error, icon: 'close-circle' },
};

// Timeline helper functions
const getDeadline = (challenge: Challenge): Date | null => {
  if (challenge.schedule?.deadline) return new Date(challenge.schedule.deadline);
  if (challenge.schedule?.endDate) return new Date(challenge.schedule.endDate);
  if (challenge.deadline) return new Date(challenge.deadline);
  return null;
};

const getDaysUntil = (date: Date | null): number | null => {
  if (!date) return null;
  const diff = date.getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const getUrgencyLevel = (daysLeft: number | null): 'urgent' | 'soon' | 'normal' | 'flexible' => {
  if (daysLeft === null) return 'flexible';
  if (daysLeft <= 1) return 'urgent';
  if (daysLeft <= 3) return 'soon';
  return 'normal';
};

const getTimelineLabel = (challenge: Challenge, submission: Submission): { text: string; icon: string; color: string } => {
  const deadline = getDeadline(challenge);
  const daysLeft = getDaysUntil(deadline);
  const urgency = getUrgencyLevel(daysLeft);

  if (urgency === 'flexible') {
    return {
      text: challenge.schedule?.type === 'recurring'
        ? challenge.schedule.timeSlots?.[0] || 'Flexibel'
        : 'Jederzeit',
      icon: 'calendar-check',
      color: Colors.success,
    };
  }

  if (daysLeft !== null) {
    if (daysLeft <= 0) {
      return { text: 'Heute fällig!', icon: 'alert-circle', color: Colors.error };
    }
    if (daysLeft === 1) {
      return { text: 'Morgen fällig', icon: 'alert', color: Colors.error };
    }
    if (daysLeft <= 3) {
      return { text: `Noch ${daysLeft} Tage`, icon: 'clock-alert', color: Colors.accent[600] };
    }
    return { text: `Noch ${daysLeft} Tage`, icon: 'clock-outline', color: Colors.textSecondary };
  }

  return { text: 'Flexibel', icon: 'calendar-check', color: Colors.success };
};

export default function MyChallengesScreen() {
  const { submissions, challenges, getActiveCount, updateProof } = useChallengeStore();
  const { getPostBySubmissionId, deletePost } = useCommunityStore();
  const [activeTab, setActiveTab] = useState<TabValue>('active');
  const activeCount = getActiveCount();

  // Post management state
  const [showPostModal, setShowPostModal] = useState(false);
  const [postSubmissionData, setPostSubmissionData] = useState<{
    submissionId: string;
    challengeId: string;
    challengeTitle: string;
    proofUrl?: string;
    xpEarned?: number;
  } | undefined>(undefined);
  const [editPostData, setEditPostData] = useState<{
    id: string;
    content: string;
    challengeTitle: string;
    imageUrl?: string;
    xpEarned?: number;
  } | undefined>(undefined);
  // Map submission ID -> existing post (null = no post, undefined = not yet loaded)
  const [submissionPosts, setSubmissionPosts] = useState<Record<string, CommunityPost | null>>({});

  // Edit submission state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editSubmission, setEditSubmission] = useState<Submission | null>(null);
  const [editChallenge, setEditChallenge] = useState<Challenge | null>(null);

  // Load post status for approved submissions
  const loadSubmissionPosts = useCallback(async () => {
    const approved = submissions.filter(s => s.status === 'approved');
    const results: Record<string, CommunityPost | null> = {};
    await Promise.all(
      approved.map(async (sub) => {
        const post = await getPostBySubmissionId(sub.id);
        results[sub.id] = post;
      })
    );
    setSubmissionPosts(results);
  }, [submissions, getPostBySubmissionId]);

  useEffect(() => {
    if (activeTab === 'completed') {
      loadSubmissionPosts();
    }
  }, [activeTab, submissions]);

  const handleCreatePost = (submission: Submission, challenge: Challenge) => {
    setEditPostData(undefined);
    setPostSubmissionData({
      submissionId: submission.id,
      challengeId: challenge.id,
      challengeTitle: challenge.title,
      proofUrl: submission.proofUrl,
      xpEarned: challenge.xpReward,
    });
    setShowPostModal(true);
  };

  const handleEditPost = (post: CommunityPost, challenge: Challenge) => {
    setPostSubmissionData(undefined);
    setEditPostData({
      id: post.id,
      content: post.content || '',
      challengeTitle: challenge.title,
      imageUrl: post.imageUrl,
      xpEarned: post.xpEarned,
    });
    setShowPostModal(true);
  };

  const handleDeletePost = (post: CommunityPost, submissionId: string) => {
    Alert.alert(
      'Beitrag löschen',
      'Möchtest du diesen Beitrag wirklich löschen?',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Löschen',
          style: 'destructive',
          onPress: async () => {
            await deletePost(post.id);
            setSubmissionPosts(prev => ({ ...prev, [submissionId]: null }));
          },
        },
      ]
    );
  };

  const handlePostModalClose = () => {
    setShowPostModal(false);
    setPostSubmissionData(undefined);
    setEditPostData(undefined);
    // Refresh posts after create/edit
    loadSubmissionPosts();
  };

  const handleEditSubmission = (submission: Submission, challenge: Challenge) => {
    setEditSubmission(submission);
    setEditChallenge(challenge);
    setShowEditModal(true);
  };

  const handleEditSubmit = async (data: { type: 'photo'; url: string; caption?: string }) => {
    if (!editSubmission) return;
    await updateProof(editSubmission.id, data);
  };

  const handleEditModalClose = () => {
    setShowEditModal(false);
    setEditSubmission(null);
    setEditChallenge(null);
  };

  // Group submissions by status and sort active ones by urgency
  const groupedSubmissions = useMemo(() => {
    const activeUnsorted = submissions.filter(s => s.status === 'in_progress');

    // Sort active by deadline (most urgent first)
    const active = [...activeUnsorted].sort((a, b) => {
      const challengeA = challenges.find(c => c.id === a.challengeId);
      const challengeB = challenges.find(c => c.id === b.challengeId);
      const deadlineA = challengeA ? getDeadline(challengeA) : null;
      const deadlineB = challengeB ? getDeadline(challengeB) : null;

      // Items with deadlines come before items without
      if (deadlineA && !deadlineB) return -1;
      if (!deadlineA && deadlineB) return 1;
      if (!deadlineA && !deadlineB) return 0;

      return deadlineA!.getTime() - deadlineB!.getTime();
    });

    const pending = submissions.filter(s => s.status === 'submitted');
    const completed = submissions.filter(s =>
      s.status === 'approved' || s.status === 'rejected'
    ).sort((a, b) =>
      // Most recent first for completed
      new Date(b.reviewedAt || b.createdAt).getTime() -
      new Date(a.reviewedAt || a.createdAt).getTime()
    );

    return { active, pending, completed };
  }, [submissions, challenges]);

  const currentSubmissions = groupedSubmissions[activeTab];

  const getChallengeForSubmission = (challengeId: string) => {
    return challenges.find(c => c.id === challengeId);
  };

  const handleSubmissionPress = (submission: typeof submissions[0]) => {
    if (submission.status === 'in_progress') {
      router.push(`/challenge/${submission.challengeId}`);
    }
  };

  const renderSubmissionCard = ({ item, index }: { item: typeof submissions[0]; index: number }) => {
    const challenge = getChallengeForSubmission(item.challengeId);
    if (!challenge) return null;

    const statusConfig = STATUS_CONFIG[item.status];
    const timelineInfo = getTimelineLabel(challenge, item);
    const deadline = getDeadline(challenge);
    const daysLeft = getDaysUntil(deadline);
    const urgency = getUrgencyLevel(daysLeft);

    // For active tab, use timeline wrapper; for others, render card directly
    const cardContent = (
      <Surface style={[
        styles.card,
        activeTab === 'active' && styles.cardWithTimeline,
        activeTab === 'active' && urgency === 'urgent' && styles.cardUrgent,
      ]} elevation={1}>
            {/* Urgency banner for active challenges */}
            {activeTab === 'active' && urgency !== 'normal' && (
              <View style={[
                styles.urgencyBanner,
                urgency === 'urgent' && styles.urgencyBannerUrgent,
                urgency === 'soon' && styles.urgencyBannerSoon,
                urgency === 'flexible' && styles.urgencyBannerFlexible,
              ]}>
                <MaterialCommunityIcons
                  name={timelineInfo.icon as any}
                  size={12}
                  color={urgency === 'urgent' ? Colors.error : urgency === 'soon' ? Colors.accent[600] : Colors.success}
                />
                <Text style={[
                  styles.urgencyText,
                  { color: urgency === 'urgent' ? Colors.error : urgency === 'soon' ? Colors.accent[600] : Colors.success }
                ]}>
                  {timelineInfo.text}
                </Text>
              </View>
            )}

            <View style={styles.cardContent}>
              {/* Image */}
              <Image
                source={{ uri: challenge.imageUrl }}
                style={styles.cardImage}
              />

              {/* Info */}
              <View style={styles.cardInfo}>
                <Text variant="labelSmall" style={styles.orgName}>
                  {challenge.organization.name}
                </Text>
                <Text variant="titleSmall" style={styles.cardTitle} numberOfLines={2}>
                  {challenge.title}
                </Text>

                {/* Status row with duration */}
                <View style={styles.statusRow}>
                  <View style={[styles.statusBadge, { backgroundColor: `${statusConfig.color}15` }]}>
                    <MaterialCommunityIcons
                      name={statusConfig.icon as any}
                      size={14}
                      color={statusConfig.color}
                    />
                    <Text style={[styles.statusText, { color: statusConfig.color }]}>
                      {statusConfig.label}
                    </Text>
                  </View>

                  {/* Duration badge */}
                  <View style={styles.durationBadge}>
                    <MaterialCommunityIcons name="clock-outline" size={12} color={Colors.textMuted} />
                    <Text style={styles.durationText}>{challenge.durationMinutes} Min</Text>
                  </View>

                  {item.status === 'approved' && (
                    <View style={styles.xpBadge}>
                      <MaterialCommunityIcons name="star" size={12} color={Colors.accent[500]} />
                      <Text style={styles.xpBadgeText}>+{challenge.xpReward} XP</Text>
                    </View>
                  )}
                </View>

                {/* Feedback if rejected */}
                {item.status === 'rejected' && item.ngoFeedback && (
                  <Text variant="bodySmall" style={styles.feedback} numberOfLines={2}>
                    {item.ngoFeedback}
                  </Text>
                )}
              </View>

              {/* Chevron for active */}
              {item.status === 'in_progress' && (
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={24}
                  color={Colors.textMuted}
                />
              )}

              {/* Edit button for submitted/rejected */}
              {(item.status === 'submitted' || item.status === 'rejected') && (
                <Pressable
                  onPress={(e) => {
                    e.stopPropagation();
                    handleEditSubmission(item, challenge);
                  }}
                  style={styles.editButton}
                  hitSlop={8}
                >
                  <MaterialCommunityIcons
                    name="pencil-outline"
                    size={20}
                    color={Colors.primary[600]}
                  />
                </Pressable>
              )}
            </View>

            {/* Location & deadline info for active */}
            {item.status === 'in_progress' && (
              <View style={styles.metaContainer}>
                {/* Location if on-site */}
                {challenge.type === 'onsite' && challenge.location && (
                  <View style={styles.metaItem}>
                    <MaterialCommunityIcons name="map-marker" size={14} color={Colors.textMuted} />
                    <Text style={styles.metaText} numberOfLines={1}>
                      {challenge.location.name}
                    </Text>
                  </View>
                )}
                {/* Timeline info if not shown in banner */}
                {urgency === 'normal' && (
                  <View style={styles.metaItem}>
                    <MaterialCommunityIcons name={timelineInfo.icon as any} size={14} color={timelineInfo.color} />
                    <Text style={[styles.metaText, { color: timelineInfo.color }]}>
                      {timelineInfo.text}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Post actions for approved submissions */}
            {item.status === 'approved' && activeTab === 'completed' && (() => {
              const existingPost = submissionPosts[item.id];
              if (existingPost === undefined) return null; // still loading
              return (
                <View style={styles.postActions}>
                  {existingPost ? (
                    <>
                      <Pressable
                        style={styles.postActionButton}
                        onPress={() => handleEditPost(existingPost, challenge)}
                      >
                        <MaterialCommunityIcons name="pencil-outline" size={16} color={Colors.primary[600]} />
                        <Text style={styles.postActionText}>Bearbeiten</Text>
                      </Pressable>
                      <Pressable
                        style={styles.postActionButtonDanger}
                        onPress={() => handleDeletePost(existingPost, item.id)}
                      >
                        <MaterialCommunityIcons name="delete-outline" size={16} color={Colors.error} />
                        <Text style={styles.postActionTextDanger}>Löschen</Text>
                      </Pressable>
                    </>
                  ) : (
                    <Pressable
                      style={styles.postActionButtonPrimary}
                      onPress={() => handleCreatePost(item, challenge)}
                    >
                      <MaterialCommunityIcons name="share-outline" size={16} color="#fff" />
                      <Text style={styles.postActionTextPrimary}>Erfolg teilen</Text>
                    </Pressable>
                  )}
                </View>
              );
            })()}
          </Surface>
    );

    // For active tab: wrap with timeline connector
    if (activeTab === 'active') {
      return (
        <Pressable onPress={() => handleSubmissionPress(item)}>
          <View style={styles.cardWrapper}>
            <View style={styles.timelineConnector}>
              <View style={[
                styles.timelineDot,
                urgency === 'urgent' && styles.timelineDotUrgent,
                urgency === 'soon' && styles.timelineDotSoon,
                urgency === 'flexible' && styles.timelineDotFlexible,
              ]}>
                <MaterialCommunityIcons
                  name={timelineInfo.icon as any}
                  size={14}
                  color="#fff"
                />
              </View>
              {index < currentSubmissions.length - 1 && (
                <View style={styles.timelineLine} />
              )}
            </View>
            {cardContent}
          </View>
        </Pressable>
      );
    }

    // For pending/completed tabs: render card directly without timeline wrapper
    return (
      <Pressable onPress={() => handleSubmissionPress(item)}>
        {cardContent}
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Title Bar */}
      <View style={styles.titleBar}>
        <Text style={styles.titleText}>Meine Challenges</Text>
        {/* Active challenge counter */}
        <View style={[
          styles.activeCounter,
          activeCount >= MAX_ACTIVE_CHALLENGES && styles.activeCounterFull
        ]}>
          <MaterialCommunityIcons
            name={activeCount >= MAX_ACTIVE_CHALLENGES ? 'clipboard-check' : 'clipboard-list-outline'}
            size={16}
            color={activeCount >= MAX_ACTIVE_CHALLENGES ? Colors.error : Colors.primary[600]}
          />
          <Text style={[
            styles.activeCounterText,
            activeCount >= MAX_ACTIVE_CHALLENGES && styles.activeCounterTextFull
          ]}>
            {activeCount}/{MAX_ACTIVE_CHALLENGES}
          </Text>
        </View>
      </View>

      {/* Custom Tab Bar */}
      <View style={styles.tabsContainer}>
        <View style={styles.tabBar}>
          {TABS.map(tab => {
            const isActive = activeTab === tab.value;
            const count = groupedSubmissions[tab.value].length;

            return (
              <Pressable
                key={tab.value}
                style={[styles.tab, isActive && styles.tabActive]}
                onPress={() => setActiveTab(tab.value)}
              >
                <View style={styles.tabIconContainer}>
                  <MaterialCommunityIcons
                    name={isActive ? tab.icon.replace('-outline', '') as any : tab.icon as any}
                    size={22}
                    color={isActive ? Colors.primary[600] : Colors.textMuted}
                  />
                  {count > 0 && (
                    <View style={[styles.tabBadge, isActive && styles.tabBadgeActive]}>
                      <Text style={[styles.tabBadgeText, isActive && styles.tabBadgeTextActive]}>
                        {count}
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* List */}
      <FlatList
        data={currentSubmissions}
        keyExtractor={item => item.id}
        renderItem={renderSubmissionCard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name={
                activeTab === 'active'
                  ? 'clipboard-outline'
                  : activeTab === 'pending'
                  ? 'clock-outline'
                  : 'check-all'
              }
              size={64}
              color={Colors.neutral[300]}
            />
            <Text variant="titleMedium" style={styles.emptyTitle}>
              {activeTab === 'active'
                ? 'Keine aktiven Challenges'
                : activeTab === 'pending'
                ? 'Keine ausstehenden Einreichungen'
                : 'Noch keine abgeschlossenen Challenges'}
            </Text>
            <Text variant="bodyMedium" style={styles.emptyText}>
              {activeTab === 'active'
                ? 'Starte eine neue Challenge aus dem Feed!'
                : activeTab === 'pending'
                ? 'Reiche deine aktiven Challenges ein'
                : 'Schließe Challenges ab, um XP zu verdienen'}
            </Text>
          </View>
        }
      />

      {/* Post Create/Edit Modal */}
      <CreatePostModal
        visible={showPostModal}
        onClose={handlePostModalClose}
        submissionData={postSubmissionData}
        editPost={editPostData}
      />

      {/* Submission Edit Modal */}
      <PhotoSubmissionModal
        visible={showEditModal}
        onClose={handleEditModalClose}
        onSubmit={handleEditSubmit}
        submissionId={editSubmission?.id || ''}
        challengeTitle={editChallenge?.title || ''}
        existingProof={editSubmission ? {
          proofUrl: editSubmission.proofUrl,
          caption: editSubmission.caption,
        } : undefined}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  titleBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.neutral[200],
  },
  titleText: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  activeCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary[50],
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.primary[100],
  },
  activeCounterFull: {
    backgroundColor: `${Colors.error}10`,
    borderColor: `${Colors.error}30`,
  },
  activeCounterText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary[700],
  },
  activeCounterTextFull: {
    color: Colors.error,
  },
  tabsContainer: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.neutral[50],
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabIconContainer: {
    position: 'relative',
    marginBottom: 2,
  },
  tabBadge: {
    position: 'absolute',
    top: -4,
    right: -10,
    backgroundColor: Colors.neutral[200],
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  tabBadgeActive: {
    backgroundColor: Colors.primary[100],
  },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  tabBadgeTextActive: {
    color: Colors.primary[700],
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textMuted,
    marginTop: 2,
  },
  tabLabelActive: {
    color: Colors.primary[600],
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
    padding: spacing.md,
    alignItems: 'center',
  },
  cardImage: {
    width: 72,
    height: 72,
    borderRadius: 8,
    backgroundColor: Colors.neutral[100],
  },
  cardInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  orgName: {
    color: Colors.textMuted,
    marginBottom: 2,
  },
  cardTitle: {
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: spacing.xs,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  xpBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.accent[600],
  },
  feedback: {
    color: Colors.error,
    marginTop: spacing.xs,
    fontStyle: 'italic',
  },
  progressContainer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.neutral[200],
    borderRadius: 2,
    marginBottom: spacing.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary[500],
    borderRadius: 2,
  },
  progressText: {
    color: Colors.textMuted,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyTitle: {
    color: Colors.textPrimary,
    marginTop: spacing.md,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyText: {
    color: Colors.textMuted,
    marginTop: spacing.xs,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  // Timeline styles
  cardWrapper: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  timelineConnector: {
    width: 36,
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  timelineDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  timelineDotUrgent: {
    backgroundColor: Colors.error,
  },
  timelineDotSoon: {
    backgroundColor: Colors.accent[500],
  },
  timelineDotFlexible: {
    backgroundColor: Colors.success,
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: Colors.neutral[200],
    marginTop: -2,
  },
  cardWithTimeline: {
    flex: 1,
    marginBottom: 0,
  },
  cardUrgent: {
    borderWidth: 1,
    borderColor: `${Colors.error}40`,
  },
  urgencyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    gap: 6,
  },
  urgencyBannerUrgent: {
    backgroundColor: `${Colors.error}10`,
  },
  urgencyBannerSoon: {
    backgroundColor: `${Colors.accent[500]}15`,
  },
  urgencyBannerFlexible: {
    backgroundColor: `${Colors.success}10`,
  },
  urgencyText: {
    fontSize: 12,
    fontWeight: '600',
  },
  metaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  editButton: {
    padding: 8,
    backgroundColor: Colors.primary[50],
    borderRadius: 20,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  durationText: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '500',
  },

  // Post action buttons for approved submissions
  postActions: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  postActionButtonPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.primary[600],
    paddingVertical: 10,
    borderRadius: 8,
  },
  postActionTextPrimary: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  postActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.primary[50],
    paddingVertical: 10,
    borderRadius: 8,
  },
  postActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary[600],
  },
  postActionButtonDanger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: `${Colors.error}10`,
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
  },
  postActionTextDanger: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.error,
  },
});
