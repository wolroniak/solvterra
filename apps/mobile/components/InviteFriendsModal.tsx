// InviteFriendsModal Component
// Modal for inviting friends to team challenges

import { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Image, Pressable, Share, Alert } from 'react-native';
import { Text, Button, Portal, Modal, Checkbox, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, spacing } from '@/constants/theme';
import { LEVELS } from '@solvterra/shared';
import type { FriendListItem, Challenge } from '@solvterra/shared';
import { useFriendStore, useTeamStore } from '@/store';

interface InviteFriendsModalProps {
  visible: boolean;
  onDismiss: () => void;
  challenge: Challenge;
  onInviteComplete: (friends: string[]) => void;
}

// Get level color
const getLevelColor = (level: FriendListItem['level']) => {
  const levelConfig = LEVELS.find(l => l.level === level);
  return levelConfig?.color || Colors.neutral[500];
};

export default function InviteFriendsModal({
  visible,
  onDismiss,
  challenge,
  onInviteComplete,
}: InviteFriendsModalProps) {
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [inviteSent, setInviteSent] = useState(false);

  const { friends, fetchFriends, isLoading: isFriendsLoading } = useFriendStore();
  const { createTeam } = useTeamStore();

  useEffect(() => {
    if (visible) {
      fetchFriends();
    }
  }, [visible, fetchFriends]);

  const minRequired = challenge.minTeamSize ? challenge.minTeamSize - 1 : 1;
  const maxAllowed = challenge.maxTeamSize ? challenge.maxTeamSize - 1 : 3;

  const toggleFriend = (friendId: string) => {
    setSelectedFriends(prev => {
      if (prev.includes(friendId)) {
        return prev.filter(id => id !== friendId);
      }
      if (prev.length < maxAllowed) {
        return [...prev, friendId];
      }
      return prev;
    });
  };

  const handleShareLink = async () => {
    try {
      await Share.share({
        message: `Hey! Mach mit mir bei der Challenge "${challenge.title}" mit! Zusammen schaffen wir mehr. 💪\n\nJetzt in der SolvTerra App: https://solvterra.de/challenge/${challenge.id}`,
        title: 'Team-Challenge Einladung',
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const handleSendInvites = async () => {
    setInviteSent(true);

    // Create team with selected friends
    const team = await createTeam(challenge.id, selectedFriends);

    if (team) {
      setTimeout(() => {
        onInviteComplete(selectedFriends);
      }, 1500);
    } else {
      // Handle error
      setInviteSent(false);
      Alert.alert('Fehler', 'Team konnte nicht erstellt werden');
    }
  };

  const handleClose = () => {
    setSelectedFriends([]);
    setInviteSent(false);
    onDismiss();
  };

  const renderFriendItem = ({ item }: { item: FriendListItem }) => {
    const isSelected = selectedFriends.includes(item.id);
    const isDisabled = !isSelected && selectedFriends.length >= maxAllowed;
    const levelConfig = LEVELS.find(l => l.level === item.level);

    return (
      <Pressable
        style={[
          styles.friendItem,
          isSelected && styles.friendItemSelected,
          isDisabled && styles.friendItemDisabled,
        ]}
        onPress={() => !isDisabled && toggleFriend(item.id)}
      >
        {item.avatarUrl ? (
          <Image source={{ uri: item.avatarUrl }} style={styles.friendAvatar} />
        ) : (
          <View style={[styles.friendAvatar, styles.avatarPlaceholder]}>
            <MaterialCommunityIcons name="account" size={20} color={Colors.neutral[400]} />
          </View>
        )}
        <View style={styles.friendInfo}>
          <Text style={styles.friendName}>{item.name}</Text>
          <View style={styles.friendMeta}>
            <View style={[styles.levelDot, { backgroundColor: getLevelColor(item.level) }]} />
            <Text style={styles.friendXp}>{levelConfig?.name || item.level}</Text>
          </View>
        </View>
        <Checkbox
          status={isSelected ? 'checked' : 'unchecked'}
          onPress={() => !isDisabled && toggleFriend(item.id)}
          disabled={isDisabled}
          color={Colors.primary[600]}
        />
      </Pressable>
    );
  };

  // Success State
  if (inviteSent) {
    const invitedNames = friends
      .filter(f => selectedFriends.includes(f.id))
      .map(f => f.name.split(' ')[0]);

    return (
      <Portal>
        <Modal visible={visible} onDismiss={handleClose} contentContainerStyle={styles.modal}>
          <View style={styles.successContainer}>
            <View style={styles.successIcon}>
              <MaterialCommunityIcons name="check-circle" size={64} color={Colors.success} />
            </View>
            <Text variant="titleLarge" style={styles.successTitle}>
              Einladungen gesendet!
            </Text>
            <Text style={styles.successText}>
              Du hast {invitedNames.join(', ')} eingeladen.
            </Text>
            <Text style={styles.waitingText}>
              Warte auf ihre Bestätigung...
            </Text>

            {/* Team Preview */}
            <View style={styles.teamPreview}>
              <Text style={styles.teamPreviewTitle}>Dein Team:</Text>
              <View style={styles.teamAvatars}>
                {/* Current user */}
                <View style={styles.teamAvatarContainer}>
                  <View style={[styles.teamAvatar, styles.currentUserAvatar]}>
                    <MaterialCommunityIcons name="account" size={20} color="#fff" />
                  </View>
                  <Text style={styles.teamAvatarName}>Du</Text>
                </View>
                {/* Invited friends */}
                {friends
                  .filter(f => selectedFriends.includes(f.id))
                  .map(friend => (
                    <View key={friend.id} style={styles.teamAvatarContainer}>
                      <Image source={{ uri: friend.avatarUrl }} style={styles.teamAvatar} />
                      <MaterialCommunityIcons
                        name="clock-outline"
                        size={14}
                        color={Colors.accent[500]}
                        style={styles.pendingIcon}
                      />
                      <Text style={styles.teamAvatarName}>{friend.name.split(' ')[0]}</Text>
                    </View>
                  ))}
              </View>
            </View>

            <Button mode="contained" onPress={handleClose} style={styles.successButton}>
              Schließen
            </Button>
          </View>
        </Modal>
      </Portal>
    );
  }

  return (
    <Portal>
      <Modal visible={visible} onDismiss={handleClose} contentContainerStyle={styles.modal}>
        {/* Header */}
        <View style={styles.header}>
          <MaterialCommunityIcons name="account-group" size={32} color={Colors.secondary[600]} />
          <Text variant="titleLarge" style={styles.title}>
            Team zusammenstellen
          </Text>
          <Text style={styles.subtitle}>
            Lade {minRequired}-{maxAllowed} Freunde ein, um gemeinsam teilzunehmen
          </Text>
        </View>

        {/* Friends List */}
        <View style={styles.friendsSection}>
          <Text style={styles.sectionTitle}>Freunde einladen</Text>
          <FlatList
            data={friends}
            keyExtractor={item => item.id}
            renderItem={renderFriendItem}
            style={styles.friendsList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              isFriendsLoading ? (
                <Text style={styles.emptyText}>Lade Freunde...</Text>
              ) : (
                <Text style={styles.emptyText}>Noch keine Freunde hinzugefügt</Text>
              )
            }
          />

          {selectedFriends.length > 0 && (
            <Text style={styles.selectedCount}>
              {selectedFriends.length} von {maxAllowed} ausgewählt
            </Text>
          )}
        </View>

        <Divider style={styles.divider} />

        {/* Share Link Section */}
        <View style={styles.shareSection}>
          <Text style={styles.sectionTitle}>Oder Link teilen</Text>
          <Pressable style={styles.shareButton} onPress={handleShareLink}>
            <MaterialCommunityIcons name="share-variant" size={20} color={Colors.primary[600]} />
            <Text style={styles.shareButtonText}>Link teilen (WhatsApp, SMS, ...)</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color={Colors.textMuted} />
          </Pressable>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Button mode="outlined" onPress={handleClose} style={styles.actionButton}>
            Abbrechen
          </Button>
          <Button
            mode="contained"
            onPress={handleSendInvites}
            style={styles.actionButton}
            disabled={selectedFriends.length < minRequired}
          >
            Einladen ({selectedFriends.length})
          </Button>
        </View>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modal: {
    backgroundColor: '#fff',
    margin: spacing.lg,
    borderRadius: 20,
    maxHeight: '85%',
    overflow: 'hidden',
  },
  header: {
    alignItems: 'center',
    padding: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  title: {
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: spacing.sm,
  },
  subtitle: {
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
    fontSize: 14,
  },
  friendsSection: {
    padding: spacing.md,
    paddingBottom: 0,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: spacing.sm,
  },
  friendsList: {
    maxHeight: 200,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: 12,
    marginBottom: spacing.xs,
    backgroundColor: Colors.neutral[50],
  },
  friendItemSelected: {
    backgroundColor: Colors.primary[50],
    borderWidth: 1,
    borderColor: Colors.primary[200],
  },
  friendItemDisabled: {
    opacity: 0.5,
  },
  friendAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.neutral[200],
  },
  avatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  friendInfo: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  friendName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  friendMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  levelDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  friendXp: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  selectedCount: {
    fontSize: 12,
    color: Colors.primary[600],
    fontWeight: '500',
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.textMuted,
    fontSize: 14,
    paddingVertical: spacing.md,
  },
  divider: {
    marginVertical: spacing.md,
  },
  shareSection: {
    paddingHorizontal: spacing.md,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: Colors.neutral[50],
    borderRadius: 12,
    gap: spacing.sm,
  },
  shareButtonText: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  actions: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[100],
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
  },

  // Success state styles
  successContainer: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  successIcon: {
    marginBottom: spacing.md,
  },
  successTitle: {
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: spacing.xs,
  },
  successText: {
    color: Colors.textSecondary,
    textAlign: 'center',
    fontSize: 14,
  },
  waitingText: {
    color: Colors.accent[600],
    fontSize: 13,
    fontWeight: '500',
    marginTop: spacing.xs,
  },
  teamPreview: {
    width: '100%',
    marginTop: spacing.xl,
    padding: spacing.md,
    backgroundColor: Colors.neutral[50],
    borderRadius: 12,
  },
  teamPreviewTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  teamAvatars: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  teamAvatarContainer: {
    alignItems: 'center',
  },
  teamAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.neutral[200],
  },
  currentUserAvatar: {
    backgroundColor: Colors.primary[600],
    alignItems: 'center',
    justifyContent: 'center',
  },
  pendingIcon: {
    position: 'absolute',
    top: 0,
    right: -4,
    backgroundColor: '#fff',
    borderRadius: 7,
    padding: 2,
  },
  teamAvatarName: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  successButton: {
    marginTop: spacing.xl,
    borderRadius: 12,
    minWidth: 120,
  },
});
