// TeamStatusSection Component
// Displays team progress on challenge detail screen

import { View, StyleSheet, Image } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Colors } from '@/constants/theme';
import type { Team, TeamMember } from '@solvterra/shared';

interface TeamStatusSectionProps {
  team: Team;
  currentUserId: string;
}

const getStatusIcon = (member: TeamMember) => {
  if (member.submission?.status === 'approved') {
    return { name: 'check-circle', color: Colors.secondary[500] };
  }
  if (member.submission?.status === 'submitted') {
    return { name: 'clock-outline', color: Colors.accent[500] };
  }
  if (member.status === 'accepted') {
    return { name: 'circle-outline', color: Colors.neutral[400] };
  }
  if (member.status === 'invited') {
    return { name: 'clock-outline', color: Colors.neutral[400] };
  }
  return { name: 'close-circle-outline', color: Colors.neutral[400] };
};

const getStatusText = (member: TeamMember) => {
  if (member.submission?.status === 'approved') return 'Approved';
  if (member.submission?.status === 'submitted') return 'Submitted';
  if (member.status === 'accepted') return 'Ready';
  if (member.status === 'invited') return 'Pending';
  return 'Declined';
};

export default function TeamStatusSection({
  team,
  currentUserId,
}: TeamStatusSectionProps) {
  const { t } = useTranslation('friends');

  const acceptedMembers = team.members?.filter(m => m.status === 'accepted') || [];
  const completedCount = acceptedMembers.filter(
    m => m.submission?.status === 'approved'
  ).length;
  const totalCount = acceptedMembers.length;
  const allCompleted = completedCount === totalCount && totalCount > 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('team.yourTeam')}</Text>
        <Text style={styles.progress}>
          {t('team.completedCount', { completed: completedCount, total: totalCount })}
        </Text>
      </View>

      <View style={styles.membersList}>
        {team.members?.map(member => {
          const isCurrentUser = member.userId === currentUserId;
          const icon = getStatusIcon(member);

          return (
            <View key={member.id} style={styles.memberRow}>
              <MaterialCommunityIcons
                name={icon.name as 'check-circle'}
                size={20}
                color={icon.color}
              />
              {member.user?.avatarUrl ? (
                <Image
                  source={{ uri: member.user.avatarUrl }}
                  style={styles.memberAvatar}
                />
              ) : (
                <View style={[styles.memberAvatar, styles.avatarPlaceholder]}>
                  <MaterialCommunityIcons
                    name="account"
                    size={14}
                    color={Colors.neutral[400]}
                  />
                </View>
              )}
              <Text style={styles.memberName}>
                {isCurrentUser ? t('team.you') : member.user?.name || 'Unknown'}
              </Text>
              <Text style={styles.memberStatus}>
                {getStatusText(member)}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Bonus hint or earned message */}
      {allCompleted ? (
        <View style={[styles.bonusBanner, styles.bonusEarned]}>
          <MaterialCommunityIcons name="star" size={18} color="#f59e0b" />
          <Text style={styles.bonusEarnedText}>
            {t('team.bonusEarned', { xp: Math.round((team.challenge?.xpReward || 0) * 0.2) })}
          </Text>
        </View>
      ) : team.status === 'active' ? (
        <View style={styles.bonusBanner}>
          <MaterialCommunityIcons name="information-outline" size={16} color={Colors.primary[600]} />
          <Text style={styles.bonusHintText}>{t('team.bonusHint')}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  progress: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  membersList: {
    gap: 10,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  memberAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  avatarPlaceholder: {
    backgroundColor: Colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberName: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  memberStatus: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  bonusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[100],
  },
  bonusHintText: {
    fontSize: 13,
    color: Colors.primary[600],
    flex: 1,
  },
  bonusEarned: {
    backgroundColor: '#fef3c7',
    marginTop: 14,
    marginHorizontal: -16,
    marginBottom: -16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    borderTopWidth: 0,
  },
  bonusEarnedText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400e',
    flex: 1,
  },
});
