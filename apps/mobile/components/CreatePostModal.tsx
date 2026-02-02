// CreatePostModal Component
// Fullscreen view for creating or editing community posts
// Triggered after challenge approval or from my-challenges tab

import { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  Image,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, spacing } from '@/constants/theme';
import { useCommunityStore } from '@/store';

interface CreatePostModalProps {
  visible: boolean;
  onClose: () => void;
  submissionData?: {
    submissionId: string;
    challengeId: string;
    challengeTitle: string;
    proofUrl?: string;
    caption?: string;
    xpEarned?: number;
  };
  // Edit mode: pass existing post to edit text only
  editPost?: {
    id: string;
    content: string;
    challengeTitle: string;
    imageUrl?: string;
    xpEarned?: number;
  };
}

export default function CreatePostModal({ visible, onClose, submissionData, editPost }: CreatePostModalProps) {
  const { createPost, updatePost } = useCommunityStore();
  const [content, setContent] = useState('');
  const [includeImage, setIncludeImage] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  const isEditMode = !!editPost;

  useEffect(() => {
    if (visible) {
      if (editPost) {
        setContent(editPost.content || '');
        setIncludeImage(!!editPost.imageUrl);
      } else {
        // Create mode: start empty, placeholder guides the user
        setContent('');
        setIncludeImage(!!submissionData?.proofUrl);
      }
    }
  }, [visible, submissionData, editPost]);

  const handlePost = async () => {
    if (isPosting) return;

    if (isEditMode && editPost) {
      setIsPosting(true);
      await updatePost(editPost.id, content.trim());
      setIsPosting(false);
      onClose();
      return;
    }

    if (!submissionData) return;

    setIsPosting(true);
    await createPost({
      type: 'success_story',
      content: content.trim(),
      imageUrl: includeImage ? submissionData.proofUrl : undefined,
      submissionId: submissionData.submissionId,
      challengeId: submissionData.challengeId,
    });
    setIsPosting(false);
    onClose();
  };

  const displayTitle = isEditMode
    ? editPost!.challengeTitle
    : submissionData?.challengeTitle;
  const displayXp = isEditMode
    ? editPost!.xpEarned
    : submissionData?.xpEarned;
  const displayImageUrl = isEditMode
    ? editPost!.imageUrl
    : submissionData?.proofUrl;

  if (!submissionData && !editPost) return null;

  const canPost = content.trim().length > 0 && !isPosting;

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
            <Text style={styles.headerTitle}>
              {isEditMode ? 'Beitrag bearbeiten' : 'Erfolg teilen'}
            </Text>
            <Pressable
              onPress={handlePost}
              disabled={!canPost}
              style={[styles.shareButton, !canPost && styles.shareButtonDisabled]}
            >
              {isPosting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={[styles.shareButtonText, !canPost && styles.shareButtonTextDisabled]}>
                  {isEditMode ? 'Speichern' : 'Teilen'}
                </Text>
              )}
            </Pressable>
          </View>

          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Challenge Info Badge */}
            <View style={styles.challengeBadge}>
              <MaterialCommunityIcons name="trophy" size={16} color={Colors.primary[600]} />
              <Text style={styles.challengeTitle} numberOfLines={1}>
                {displayTitle}
              </Text>
              {displayXp ? (
                <View style={styles.xpTag}>
                  <MaterialCommunityIcons name="lightning-bolt" size={12} color="#f59e0b" />
                  <Text style={styles.xpText}>+{displayXp} XP</Text>
                </View>
              ) : null}
            </View>

            {/* Image Preview */}
            {displayImageUrl && (
              <View style={styles.imageSection}>
                {(isEditMode || includeImage) && (
                  <Image
                    source={{ uri: displayImageUrl }}
                    style={styles.previewImage}
                    resizeMode="cover"
                  />
                )}
                {!isEditMode && (
                  <Pressable
                    style={styles.imageToggle}
                    onPress={() => setIncludeImage(!includeImage)}
                  >
                    <MaterialCommunityIcons
                      name={includeImage ? 'image-check' : 'image-off-outline'}
                      size={20}
                      color={includeImage ? Colors.primary[600] : Colors.textMuted}
                    />
                    <Text style={[styles.imageToggleText, includeImage && styles.imageToggleTextActive]}>
                      {includeImage ? 'Foto wird geteilt' : 'Ohne Foto teilen'}
                    </Text>
                  </Pressable>
                )}
              </View>
            )}

            {/* Text Input */}
            <View style={styles.inputSection}>
              <TextInput
                style={styles.captionInput}
                placeholder="Erzähle, wie es war..."
                placeholderTextColor={Colors.neutral[400]}
                value={content}
                onChangeText={setContent}
                multiline
                maxLength={500}
                textAlignVertical="top"
                autoFocus={!displayImageUrl}
              />
            </View>
          </ScrollView>

          {/* Bottom Bar with character count */}
          <View style={styles.bottomBar}>
            <Text style={[styles.charCount, content.length > 450 && styles.charCountWarn]}>
              {content.length}/500
            </Text>
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
  shareButton: {
    backgroundColor: Colors.primary[600],
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 80,
    alignItems: 'center',
  },
  shareButtonDisabled: {
    backgroundColor: Colors.neutral[200],
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  shareButtonTextDisabled: {
    color: Colors.neutral[400],
  },

  // Scroll content
  scrollContent: {
    paddingBottom: 20,
  },

  // Challenge badge
  challengeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: Colors.neutral[50],
    borderRadius: 10,
    gap: 8,
  },
  challengeTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  xpTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  xpText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#b45309',
  },

  // Image section
  imageSection: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  previewImage: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: 12,
    backgroundColor: Colors.neutral[100],
  },
  imageToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  imageToggleText: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  imageToggleTextActive: {
    color: Colors.primary[600],
  },

  // Input section
  inputSection: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  captionInput: {
    fontSize: 16,
    color: Colors.textPrimary,
    minHeight: 120,
    lineHeight: 24,
  },

  // Bottom bar
  bottomBar: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 0.5,
    borderTopColor: Colors.neutral[200],
    alignItems: 'flex-end',
  },
  charCount: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  charCountWarn: {
    color: '#ef4444',
  },
});
