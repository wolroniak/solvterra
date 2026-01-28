'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Image as ImageIcon,
  Link as LinkIcon,
  Save,
  Sparkles,
  Pin,
  Clock,
  Users,
  Zap,
  Upload,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCommunityStore, useChallengeStore, useAuthStore } from '@/store';
import { uploadPostImage } from '@/lib/storage';

export default function EditPostPage() {
  const { t } = useTranslation('community');
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;
  const { getPost, updatePostDb, loadPosts, posts } = useCommunityStore();
  const { challenges } = useChallengeStore();
  const { organization } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loaded, setLoaded] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [linkedChallengeId, setLinkedChallengeId] = useState('');
  const [isHighlighted, setIsHighlighted] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [imageTab, setImageTab] = useState<'upload' | 'url'>('url');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  // Load posts if not already loaded, then populate form
  useEffect(() => {
    if (posts.length === 0) {
      loadPosts();
    }
  }, [posts.length, loadPosts]);

  useEffect(() => {
    if (loaded || posts.length === 0) return;
    const post = getPost(postId);
    if (post) {
      setTitle(post.title || '');
      setContent(post.content || '');
      setImageUrl(post.imageUrl || '');
      setLinkedChallengeId(post.linkedChallengeId || '');
      setIsHighlighted(post.isHighlighted ?? false);
      setIsPinned(post.isPinned ?? false);
      if (post.imageUrl) setImageTab('url');
      setLoaded(true);
    }
  }, [postId, posts, loaded, getPost]);

  const post = getPost(postId);
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

  const handleSave = async () => {
    if (!organization) return;
    setSaving(true);

    let finalImageUrl = imageUrl;

    if (imageFile) {
      const uploaded = await uploadPostImage(imageFile, organization.id);
      if (uploaded) {
        finalImageUrl = uploaded;
      }
    }

    await updatePostDb(postId, {
      title: title || undefined,
      content: content || undefined,
      imageUrl: finalImageUrl || undefined,
      linkedChallengeId: linkedChallengeId || undefined,
      isHighlighted,
      isPinned,
    });

    setSaving(false);
    router.push('/community');
  };

  // Not found state
  if (loaded || posts.length > 0) {
    if (!post) {
      return (
        <div className="p-6 max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/community">
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-slate-900">{t('editPostPage.notFound')}</h1>
          </div>
          <Card>
            <CardContent className="p-6">
              <p className="text-slate-600">{t('editPostPage.notFoundDescription')}</p>
              <Link href="/community" className="mt-4 inline-block">
                <Button variant="outline">{t('editPostPage.backToCommunity')}</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      );
    }
  }

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
          <h1 className="text-2xl font-bold text-slate-900">{t('editPostPage.heading')}</h1>
          <p className="text-slate-500">{t('editPostPage.description')}</p>
        </div>
      </div>

      <div className="space-y-6">
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
              <p className="text-xs text-slate-500">{t('newPostPage.form.contentHint')}</p>
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
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => { setImageUrl(e.target.value); setImageFile(null); setImagePreview(''); }}
                    placeholder="https://..."
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
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
                    <p className="font-medium text-slate-900">{selectedChallenge.title}</p>
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
                <p className="text-xs text-slate-600 mt-0.5">{t('newPostPage.options.highlightDescription')}</p>
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
                <p className="text-xs text-slate-600 mt-0.5">{t('newPostPage.options.pinDescription')}</p>
              </div>
            </label>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex gap-3">
          <Button
            onClick={handleSave}
            disabled={(!title && !content) || saving}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            {saving ? t('editPostPage.saving') : t('editPostPage.saveChanges')}
          </Button>
          <Link href="/community">
            <Button variant="outline">{t('editPostPage.backToCommunity')}</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
