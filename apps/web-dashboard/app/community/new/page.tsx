'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Image as ImageIcon,
  Link as LinkIcon,
  Eye,
  Save,
  Sparkles,
  Pin,
  Clock,
  Users,
  Zap,
  Upload,
  Heart,
  MessageCircle,
  Trophy,
  CheckCircle2,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCommunityStore, useChallengeStore, useAuthStore } from '@/store';
import { uploadPostImage } from '@/lib/storage';
import { useVerificationStatus } from '@/components/verification-banner';
import { AlertCircle } from 'lucide-react';

export default function NewPostPage() {
  const { t } = useTranslation('community');
  const router = useRouter();
  const { addPost } = useCommunityStore();
  const { challenges } = useChallengeStore();
  const { organization } = useAuthStore();
  const { isRejected, rejectionReason } = useVerificationStatus();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Block access for rejected organizations
  if (isRejected) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/community">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">{t('newPostPage.title')}</h1>
        </div>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-start gap-4 p-6">
            <AlertCircle className="h-6 w-6 text-red-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-800">{t('newPostPage.restricted.title')}</h3>
              <p className="text-sm text-red-700 mt-1">
                {t('newPostPage.restricted.description')}
              </p>
              {rejectionReason && (
                <p className="text-sm text-red-600 mt-2 p-2 bg-red-100 rounded">
                  <strong>{t('newPostPage.restricted.reason')}</strong> {rejectionReason}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [linkedChallengeId, setLinkedChallengeId] = useState('');
  const [isHighlighted, setIsHighlighted] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [imageTab, setImageTab] = useState<'upload' | 'url'>('upload');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  // Get active challenges for linking
  const activeChallenges = challenges.filter((c) => c.status === 'active');
  const selectedChallenge = activeChallenges.find((c) => c.id === linkedChallengeId);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setImageFile(file);
    setImageUrl('');
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    setImageUrl('');
  };

  const displayImageUrl = imagePreview || imageUrl;

  const handleSubmit = async (asDraft: boolean) => {
    if (!organization) return;

    setUploading(true);

    let finalImageUrl = imageUrl;

    // Upload file if selected
    if (imageFile) {
      const uploaded = await uploadPostImage(imageFile, organization.id);
      if (uploaded) {
        finalImageUrl = uploaded;
      }
    }

    const linkedChallenge = selectedChallenge
      ? {
          id: selectedChallenge.id,
          title: selectedChallenge.title,
          imageUrl: selectedChallenge.imageUrl,
          category: selectedChallenge.category,
          xpReward: selectedChallenge.xpReward,
          durationMinutes: selectedChallenge.duration,
        }
      : undefined;

    await addPost({
      type: 'ngo_promotion',
      authorType: 'organization',
      authorId: organization.id,
      authorName: organization.name,
      authorAvatarUrl: organization.logo,
      organizationId: organization.id,
      organizationLogoUrl: organization.logo,
      title: title || undefined,
      content: content || undefined,
      imageUrl: finalImageUrl || undefined,
      linkedChallengeId: linkedChallengeId || undefined,
      linkedChallenge,
      isHighlighted,
      isPinned,
      status: asDraft ? 'draft' : 'published',
      publishedAt: asDraft ? undefined : new Date(),
    });

    setUploading(false);
    router.push('/community');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/community"
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t('newPostPage.heading')}</h1>
          <p className="text-slate-500">
            {t('newPostPage.description')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('newPostPage.form.titleLabel')}</CardTitle>
            </CardHeader>
            <CardContent>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t('newPostPage.form.titlePlaceholder')}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-lg"
              />
              <p className="text-xs text-slate-500 mt-2">
                {t('newPostPage.form.titleHint')}
              </p>
            </CardContent>
          </Card>

          {/* Content */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('newPostPage.form.contentLabel')}</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={t('newPostPage.form.contentPlaceholder')}
                rows={5}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-slate-500">
                  {t('newPostPage.form.contentHint')}
                </p>
                <p className="text-xs text-slate-400">{content.length}/500</p>
              </div>
            </CardContent>
          </Card>

          {/* Image */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                {t('newPostPage.form.imageLabel')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {displayImageUrl ? (
                <div className="relative">
                  <div className="relative w-full h-48 rounded-lg overflow-hidden">
                    <Image
                      src={displayImageUrl}
                      alt="Post image"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <button
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 bg-white/90 hover:bg-white p-2 rounded-lg shadow"
                  >
                    {t('newPostPage.form.removeImage')}
                  </button>
                </div>
              ) : (
                <div>
                  {/* Tabs: Upload / URL */}
                  <div className="flex items-center gap-2 mb-4">
                    <button
                      onClick={() => setImageTab('upload')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        imageTab === 'upload'
                          ? 'bg-primary-100 text-primary-700'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Upload className="w-4 h-4 inline mr-1.5" />
                      {t('newPostPage.form.uploadImage')}
                    </button>
                    <button
                      onClick={() => setImageTab('url')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        imageTab === 'url'
                          ? 'bg-primary-100 text-primary-700'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <LinkIcon className="w-4 h-4 inline mr-1.5" />
                      {t('newPostPage.form.enterUrl')}
                    </button>
                  </div>

                  {imageTab === 'upload' ? (
                    <div
                      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`w-full border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                        dragOver
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-slate-300 hover:border-primary-400 hover:bg-primary-50/50'
                      }`}
                    >
                      <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm text-slate-600">{t('newPostPage.form.dragDrop')}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {t('newPostPage.form.imageHint')}
                      </p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileSelect(file);
                        }}
                      />
                    </div>
                  ) : (
                    <div>
                      <input
                        type="url"
                        value={imageUrl}
                        onChange={(e) => { setImageUrl(e.target.value); setImageFile(null); setImagePreview(''); }}
                        placeholder="https://..."
                        className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      <p className="text-xs text-slate-400 mt-2">
                        {t('newPostPage.form.imageHint')}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Link Challenge */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <LinkIcon className="h-5 w-5" />
                {t('newPostPage.form.linkChallenge')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <select
                value={linkedChallengeId}
                onChange={(e) => setLinkedChallengeId(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">{t('newPostPage.form.noChallengeLinked')}</option>
                {activeChallenges.map((challenge) => (
                  <option key={challenge.id} value={challenge.id}>
                    {challenge.title} ({challenge.xpReward} XP)
                  </option>
                ))}
              </select>
              {selectedChallenge && (
                <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {selectedChallenge.imageUrl && (
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={selectedChallenge.imageUrl}
                          alt={selectedChallenge.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-slate-900">
                        {selectedChallenge.title}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <Zap className="w-4 h-4 text-amber-500" />
                          {selectedChallenge.xpReward} XP
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {selectedChallenge.duration} {t('postCard.minutes')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {selectedChallenge.currentParticipants}/{selectedChallenge.maxParticipants}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <p className="text-xs text-slate-500 mt-2">
                {t('newPostPage.form.linkHint')}
              </p>
            </CardContent>
          </Card>

          {/* Options */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('newPostPage.options.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <label className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg cursor-pointer hover:bg-amber-100 transition-colors">
                <input
                  type="checkbox"
                  checked={isHighlighted}
                  onChange={(e) => setIsHighlighted(e.target.checked)}
                  className="w-5 h-5 text-amber-600 rounded focus:ring-amber-500"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span className="font-medium text-slate-900">{t('newPostPage.options.highlight')}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {t('newPostPage.options.highlightDescription')}
                  </p>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 bg-primary-50 rounded-lg cursor-pointer hover:bg-primary-100 transition-colors">
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Pin className="w-4 h-4 text-primary-600" />
                    <span className="font-medium text-slate-900">{t('newPostPage.options.pin')}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {t('newPostPage.options.pinDescription')}
                  </p>
                </div>
              </label>
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <h3 className="text-sm font-medium text-slate-500 uppercase mb-4">{t('newPostPage.preview.title')}</h3>
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                {/* Header — Instagram-style: avatar ring + name + verified badge */}
                <div className="flex items-center gap-3 px-3.5 py-2.5">
                  {organization && (
                    <div className="w-10 h-10 rounded-full border-[2.5px] border-primary-600 flex items-center justify-center">
                      <div className="relative w-[34px] h-[34px] rounded-full overflow-hidden">
                        <Image
                          src={organization.logo}
                          alt={organization.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-sm text-slate-900">{organization?.name}</span>
                      <CheckCircle2 className="w-4 h-4 text-primary-600 shrink-0" />
                    </div>
                    {title && (
                      <p className="text-xs text-slate-500 truncate">{title}</p>
                    )}
                  </div>
                </div>

                {/* Badges row */}
                {(isHighlighted || isPinned) && (
                  <div className="px-3.5 pb-1 flex gap-2">
                    {isPinned && (
                      <Badge variant="outline" className="bg-primary-50 border-primary-200 text-primary-700 text-xs">
                        <Pin className="w-3 h-3 mr-1" />
                        {t('postCard.pinned')}
                      </Badge>
                    )}
                    {isHighlighted && (
                      <Badge variant="outline" className="bg-amber-50 border-amber-200 text-amber-700 text-xs">
                        <Sparkles className="w-3 h-3 mr-1" />
                        {t('postCard.highlighted')}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Image — full-width like Instagram */}
                {displayImageUrl && (
                  <div className="relative w-full aspect-[4/3] bg-slate-100">
                    <Image src={displayImageUrl} alt="" fill className="object-cover" />
                  </div>
                )}

                {/* Action row — heart, comment, trophy */}
                <div className="flex items-center gap-4 px-3 pt-2.5 pb-1">
                  <div className="flex items-center gap-1">
                    <Heart className="w-[22px] h-[22px] text-slate-700" />
                    <span className="text-sm font-semibold text-slate-700">0</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-[21px] h-[21px] text-slate-700" />
                    <span className="text-sm font-semibold text-slate-700">0</span>
                  </div>
                  <Trophy className={`w-[21px] h-[21px] ${selectedChallenge ? 'text-primary-600' : 'text-slate-300'}`} />
                </div>

                {/* Caption */}
                <div className="px-3.5 pt-1 pb-1">
                  {content ? (
                    <p className="text-sm text-slate-800 line-clamp-3">{content}</p>
                  ) : (
                    <p className="text-sm text-slate-400 italic">
                      {t('newPostPage.preview.emptyPlaceholder')}
                    </p>
                  )}
                </div>

                {/* Linked Challenge Preview */}
                {selectedChallenge && (
                  <div className="mx-3.5 mt-1 mb-1 p-2.5 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      {selectedChallenge.imageUrl && (
                        <div className="relative w-10 h-10 rounded overflow-hidden flex-shrink-0">
                          <Image src={selectedChallenge.imageUrl} alt="" fill className="object-cover" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-slate-900 truncate">{selectedChallenge.title}</p>
                        <p className="text-xs text-slate-500">{selectedChallenge.xpReward} XP</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Timestamp */}
                <p className="text-[11px] text-slate-400 px-3.5 pt-1.5 pb-3.5">{t('newPostPage.preview.justNow')}</p>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="mt-6 space-y-3">
              <Button
                onClick={() => handleSubmit(false)}
                disabled={(!title && !content) || uploading}
                className="w-full gap-2"
              >
                <Eye className="h-4 w-4" />
                {uploading ? t('newPostPage.uploading') : t('newPostPage.publishButton')}
              </Button>
              <Button
                onClick={() => handleSubmit(true)}
                variant="outline"
                disabled={uploading}
                className="w-full gap-2"
              >
                <Save className="h-4 w-4" />
                {t('newPostPage.saveDraft')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
