import { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  Image,
  Animated,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Text, Button, TextInput, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Colors, spacing } from '@/constants/theme';
import { pickImage, takePhoto, uploadProofPhoto } from '@/lib/storage';

interface PhotoSubmissionModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: { type: 'photo'; url: string; caption?: string }) => Promise<void>;
  submissionId: string;
  challengeTitle: string;
  /** Pre-fill with existing proof data for editing */
  existingProof?: {
    proofUrl?: string;
    caption?: string;
  };
}

type Step = 'source' | 'preview' | 'uploading';

export default function PhotoSubmissionModal({
  visible,
  onClose,
  onSubmit,
  submissionId,
  challengeTitle,
  existingProof,
}: PhotoSubmissionModalProps) {
  const isEditMode = !!existingProof;
  const { t } = useTranslation('challenges');
  const [step, setStep] = useState<Step>('source');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const slideAnim = useRef(new Animated.Value(300)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // In edit mode, start at preview with existing data; otherwise reset
      if (existingProof?.proofUrl) {
        setStep('preview');
        setImageUri(existingProof.proofUrl);
        setImageBase64(null); // No base64 for existing remote image
        setCaption(existingProof.caption || '');
      } else {
        setStep('source');
        setImageUri(null);
        setImageBase64(null);
        setCaption(existingProof?.caption || '');
      }
      setUploadProgress(0);
      setIsUploading(false);

      // Animate in
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animate out
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 300,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handlePickFromCamera = async () => {
    const result = await takePhoto();
    if (result) {
      setImageUri(result.uri);
      setImageBase64(result.base64);
      setStep('preview');
    }
  };

  const handlePickFromGallery = async () => {
    const result = await pickImage();
    if (result) {
      setImageUri(result.uri);
      setImageBase64(result.base64);
      setStep('preview');
    }
  };

  const handleRetake = () => {
    setImageUri(null);
    setImageBase64(null);
    setStep('source');
  };

  const handleSubmit = async () => {
    if (!imageUri) return;

    // If user kept the existing photo (no new base64), submit with existing URL
    if (!imageBase64 && isEditMode && existingProof?.proofUrl) {
      setStep('uploading');
      setIsUploading(true);
      setUploadProgress(100);
      try {
        await onSubmit({
          type: 'photo',
          url: existingProof.proofUrl,
          caption: caption.trim() || undefined,
        });
        onClose();
      } catch (error) {
        Alert.alert('Fehler', 'Ein unerwarteter Fehler ist aufgetreten.', [{ text: 'OK' }]);
        setStep('preview');
        setUploadProgress(0);
      } finally {
        setIsUploading(false);
      }
      return;
    }

    if (!imageBase64) return;

    setStep('uploading');
    setIsUploading(true);

    // Simulate progress (actual upload doesn't provide progress callbacks)
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      const publicUrl = await uploadProofPhoto(imageBase64, submissionId);

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (publicUrl) {
        await onSubmit({
          type: 'photo',
          url: publicUrl,
          caption: caption.trim() || undefined,
        });
        onClose();
      } else {
        Alert.alert(
          'Upload fehlgeschlagen',
          'Das Foto konnte nicht hochgeladen werden. Bitte versuche es erneut.',
          [{ text: 'OK' }]
        );
        setStep('preview');
        setUploadProgress(0);
      }
    } catch (error) {
      clearInterval(progressInterval);
      Alert.alert(
        'Fehler',
        'Ein unerwarteter Fehler ist aufgetreten.',
        [{ text: 'OK' }]
      );
      setStep('preview');
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    if (isUploading) return; // Prevent closing during upload
    onClose();
  };

  const renderSourcePicker = () => (
    <View style={styles.sourceContainer}>
      <Text variant="headlineSmall" style={styles.title}>
        {isEditMode ? 'Foto ersetzen' : 'Foto aufnehmen'}
      </Text>
      <Text variant="bodyMedium" style={styles.subtitle}>
        {isEditMode
          ? `Neues Foto für "${challengeTitle}" auswählen`
          : `Dokumentiere deinen Beitrag für "${challengeTitle}"`}
      </Text>

      <View style={styles.sourceButtons}>
        <Pressable
          style={styles.sourceButton}
          onPress={handlePickFromCamera}
          android_ripple={{ color: Colors.primary[100] }}
        >
          <View style={[styles.sourceIcon, { backgroundColor: Colors.primary[50] }]}>
            <MaterialCommunityIcons name="camera" size={32} color={Colors.primary[600]} />
          </View>
          <Text variant="titleMedium" style={styles.sourceLabel}>Kamera</Text>
          <Text variant="bodySmall" style={styles.sourceHint}>Foto jetzt aufnehmen</Text>
        </Pressable>

        <Pressable
          style={styles.sourceButton}
          onPress={handlePickFromGallery}
          android_ripple={{ color: Colors.secondary[100] }}
        >
          <View style={[styles.sourceIcon, { backgroundColor: Colors.secondary[50] }]}>
            <MaterialCommunityIcons name="image-multiple" size={32} color={Colors.secondary[600]} />
          </View>
          <Text variant="titleMedium" style={styles.sourceLabel}>Galerie</Text>
          <Text variant="bodySmall" style={styles.sourceHint}>Aus Fotos wählen</Text>
        </Pressable>
      </View>

      <Button
        mode="text"
        onPress={handleClose}
        style={styles.cancelButton}
        textColor={Colors.textMuted}
      >
        Abbrechen
      </Button>
    </View>
  );

  const renderPreview = () => (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.previewContainer}
    >
      <View style={styles.previewHeader}>
        <IconButton
          icon="arrow-left"
          onPress={handleRetake}
          iconColor={Colors.textPrimary}
        />
        <Text variant="titleMedium" style={styles.previewTitle}>Vorschau</Text>
        <View style={{ width: 48 }} />
      </View>

      <View style={styles.imageContainer}>
        <Image source={{ uri: imageUri! }} style={styles.previewImage} />
        <Pressable style={styles.retakeOverlay} onPress={handleRetake}>
          <MaterialCommunityIcons name="camera-retake" size={24} color="#fff" />
          <Text style={styles.retakeText}>Neu aufnehmen</Text>
        </Pressable>
      </View>

      <View style={styles.captionContainer}>
        <TextInput
          mode="outlined"
          placeholder="Beschreibung hinzufügen (optional)"
          value={caption}
          onChangeText={setCaption}
          multiline
          numberOfLines={2}
          style={styles.captionInput}
          outlineColor={Colors.neutral[300]}
          activeOutlineColor={Colors.primary[600]}
        />
      </View>

      <View style={styles.previewActions}>
        <Button
          mode="outlined"
          onPress={handleRetake}
          style={styles.actionButton}
          textColor={Colors.textSecondary}
        >
          Anderes Foto
        </Button>
        <Button
          mode="contained"
          onPress={handleSubmit}
          style={[styles.actionButton, styles.submitButton]}
          buttonColor={Colors.primary[600]}
          icon="check"
        >
          {isEditMode ? 'Erneut einreichen' : 'Einreichen'}
        </Button>
      </View>
    </KeyboardAvoidingView>
  );

  const renderUploading = () => (
    <View style={styles.uploadingContainer}>
      <View style={styles.uploadingContent}>
        <View style={styles.progressCircle}>
          <ActivityIndicator size="large" color={Colors.primary[600]} />
          <Text style={styles.progressText}>{uploadProgress}%</Text>
        </View>
        <Text variant="titleMedium" style={styles.uploadingTitle}>
          Wird hochgeladen...
        </Text>
        <Text variant="bodyMedium" style={styles.uploadingSubtitle}>
          Bitte warte einen Moment
        </Text>

        {/* Progress bar */}
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${uploadProgress}%` }]} />
        </View>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <Pressable style={styles.backdrop} onPress={handleClose} />
      </Animated.View>

      <Animated.View
        style={[
          styles.sheet,
          { transform: [{ translateY: slideAnim }] },
        ]}
      >
        <View style={styles.handle} />
        {step === 'source' && renderSourcePicker()}
        {step === 'preview' && renderPreview()}
        {step === 'uploading' && renderUploading()}
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdrop: {
    flex: 1,
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.neutral[300],
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },

  // Source picker
  sourceContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  title: {
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
  },
  sourceButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  sourceButton: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
    borderRadius: 16,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  sourceIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  sourceLabel: {
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  sourceHint: {
    color: Colors.textMuted,
    marginTop: 2,
  },
  cancelButton: {
    marginTop: spacing.lg,
  },

  // Preview
  previewContainer: {
    flex: 1,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  previewTitle: {
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  imageContainer: {
    margin: spacing.lg,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    aspectRatio: 4 / 3,
    backgroundColor: Colors.neutral[100],
  },
  retakeOverlay: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  retakeText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
  },
  captionContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  captionInput: {
    backgroundColor: '#fff',
    fontSize: 14,
  },
  previewActions: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
  },
  submitButton: {
    flex: 2,
  },

  // Uploading
  uploadingContainer: {
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
    alignItems: 'center',
  },
  uploadingContent: {
    alignItems: 'center',
  },
  progressCircle: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  progressText: {
    position: 'absolute',
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary[600],
  },
  uploadingTitle: {
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: spacing.xs,
  },
  uploadingSubtitle: {
    color: Colors.textMuted,
    marginBottom: spacing.lg,
  },
  progressBar: {
    width: 200,
    height: 6,
    backgroundColor: Colors.neutral[200],
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary[600],
    borderRadius: 3,
  },
});
