// CommentSheet Component
// Fullscreen modal for viewing and adding comments

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  Pressable,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useCommunityStore, useUserStore } from '@/store';
import type { CommunityComment } from '@solvterra/shared';

interface CommentSheetProps {
  visible: boolean;
  postId: string | null;
  onClose: () => void;
}

const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  if (diffMins < 1) return 'jetzt';
  if (diffMins < 60) return `${diffMins}m`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d`;
};

export default function CommentSheet({ visible, postId, onClose }: CommentSheetProps) {
  const router = useRouter();
  const { comments, isLoadingComments, loadComments, addComment } = useCommunityStore();
  const { user } = useUserStore();
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const flatListRef = useRef<FlatList>(null);

  const handleCommentAvatarPress = useCallback((comment: CommunityComment) => {
    onClose();
    if (user && comment.userId === user.id) {
      router.push('/(tabs)/profile');
    } else if (comment.organizationId) {
      router.push(`/organization/${comment.organizationId}`);
    } else {
      router.push(`/user/${comment.userId}`);
    }
  }, [user, router, onClose]);

  useEffect(() => {
    if (visible && postId) {
      loadComments(postId);
      setText('');
    }
  }, [visible, postId]);

  const handleSend = async () => {
    if (!text.trim() || !postId || isSending) return;

    setIsSending(true);
    await addComment(postId, text.trim());
    setText('');
    setIsSending(false);

    // Scroll to bottom to show new comment
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const renderComment = ({ item }: { item: CommunityComment }) => (
    <View style={styles.commentRow}>
      <Pressable onPress={() => handleCommentAvatarPress(item)}>
        <Image
          source={{ uri: item.userAvatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${item.userName}` }}
          style={styles.commentAvatar}
        />
      </Pressable>
      <View style={styles.commentContent}>
        <Text style={styles.commentText}>
          {item.content}
        </Text>
        <Text style={styles.commentTime}>{formatTimeAgo(item.createdAt)}</Text>
      </View>
    </View>
  );

  const renderEmpty = () => {
    if (isLoadingComments) return null;
    return (
      <View style={styles.emptyState}>
        <MaterialCommunityIcons name="comment-outline" size={48} color={Colors.neutral[300]} />
        <Text style={styles.emptyTitle}>Noch keine Kommentare</Text>
        <Text style={styles.emptySubtitle}>Schreibe den ersten!</Text>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.flex}
        >
          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={onClose} style={styles.closeButton} hitSlop={8}>
              <MaterialCommunityIcons name="close" size={24} color={Colors.textPrimary} />
            </Pressable>
            <Text style={styles.headerTitle}>Kommentare</Text>
            <View style={styles.headerSpacer} />
          </View>

          {/* Comments List */}
          {isLoadingComments ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={Colors.primary[600]} />
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={comments}
              keyExtractor={(item) => item.id}
              renderItem={renderComment}
              ListEmptyComponent={renderEmpty}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          )}

          {/* Input */}
          <View style={styles.inputRow}>
            <TextInput
              ref={inputRef}
              style={styles.input}
              placeholder="Kommentar hinzufügen..."
              placeholderTextColor={Colors.neutral[400]}
              value={text}
              onChangeText={setText}
              multiline
              maxLength={500}
            />
            <Pressable
              style={[styles.sendButton, (!text.trim() || isSending) && styles.sendButtonDisabled]}
              onPress={handleSend}
              disabled={!text.trim() || isSending}
            >
              {isSending ? (
                <ActivityIndicator size="small" color={Colors.primary[600]} />
              ) : (
                <Text style={[styles.sendText, !text.trim() && styles.sendTextDisabled]}>
                  Senden
                </Text>
              )}
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  flex: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.neutral[200],
  },
  closeButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  headerSpacer: {
    width: 36,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // List
  listContent: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 8,
    flexGrow: 1,
  },

  // Comment row
  commentRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 10,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.neutral[100],
  },
  commentContent: {
    flex: 1,
  },
  commentText: {
    fontSize: 14,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  commentTime: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 4,
  },

  // Empty state
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textMuted,
    marginTop: 4,
  },

  // Input row
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 0.5,
    borderTopColor: Colors.neutral[200],
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
    maxHeight: 80,
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: Colors.neutral[50],
    borderRadius: 20,
  },
  sendButton: {
    paddingHorizontal: 4,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary[600],
  },
  sendTextDisabled: {
    color: Colors.textMuted,
  },
});
