'use client';

import { useState } from 'react';
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
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCommunityStore, useChallengeStore, useAuthStore } from '@/store';
import { REACTION_CONFIG } from '@/lib/mock-data';
import { useVerificationStatus } from '@/components/verification-banner';
import { AlertCircle } from 'lucide-react';

// Sample images for selection
const SAMPLE_IMAGES = [
  'https://images.unsplash.com/photo-1567393528677-d6adae7d4a0a?w=800',
  'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800',
  'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=800',
  'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800',
  'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800',
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800',
];

export default function NewPostPage() {
  const router = useRouter();
  const { addPost } = useCommunityStore();
  const { challenges } = useChallengeStore();
  const { organization } = useAuthStore();
  const { isRejected, rejectionReason } = useVerificationStatus();

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
          <h1 className="text-2xl font-bold text-slate-900">Neuer Post</h1>
        </div>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-start gap-4 p-6">
            <AlertCircle className="h-6 w-6 text-red-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-800">Zugang eingeschraenkt</h3>
              <p className="text-sm text-red-700 mt-1">
                Deine Organisation wurde abgelehnt und kann keine neuen Posts erstellen.
              </p>
              {rejectionReason && (
                <p className="text-sm text-red-600 mt-2 p-2 bg-red-100 rounded">
                  <strong>Grund:</strong> {rejectionReason}
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
  const [showImagePicker, setShowImagePicker] = useState(false);

  // Get active challenges for linking
  const activeChallenges = challenges.filter((c) => c.status === 'active');
  const selectedChallenge = activeChallenges.find((c) => c.id === linkedChallengeId);

  const handleSubmit = (asDraft: boolean) => {
    if (!organization) return;

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

    addPost({
      type: 'ngo_promotion',
      authorType: 'organization',
      authorId: organization.id,
      authorName: organization.name,
      authorAvatarUrl: organization.logo,
      organizationId: organization.id,
      organizationLogoUrl: organization.logo,
      title: title || undefined,
      content: content || undefined,
      imageUrl: imageUrl || undefined,
      linkedChallengeId: linkedChallengeId || undefined,
      linkedChallenge,
      isHighlighted,
      isPinned,
      status: asDraft ? 'draft' : 'published',
      publishedAt: asDraft ? undefined : new Date(),
    });

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
          <h1 className="text-2xl font-bold text-slate-900">Neuer Community-Post</h1>
          <p className="text-slate-500">
            Erstelle einen Post, um deine Challenge in der Community zu bewerben
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Titel</CardTitle>
            </CardHeader>
            <CardContent>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="z.B. 🌿 Gemeinsam für saubere Parks!"
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-lg"
              />
              <p className="text-xs text-slate-500 mt-2">
                Ein einprägsamer Titel mit Emoji erregt mehr Aufmerksamkeit
              </p>
            </CardContent>
          </Card>

          {/* Content */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Nachricht</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Beschreibe die Challenge und warum Nutzer teilnehmen sollten..."
                rows={5}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-slate-500">
                  Tipp: Erwähne XP-Belohnungen und Zeitaufwand
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
                Bild
              </CardTitle>
            </CardHeader>
            <CardContent>
              {imageUrl ? (
                <div className="relative">
                  <div className="relative w-full h-48 rounded-lg overflow-hidden">
                    <Image
                      src={imageUrl}
                      alt="Post image"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <button
                    onClick={() => setImageUrl('')}
                    className="absolute top-2 right-2 bg-white/90 hover:bg-white p-2 rounded-lg shadow"
                  >
                    Entfernen
                  </button>
                </div>
              ) : (
                <div>
                  <button
                    onClick={() => setShowImagePicker(!showImagePicker)}
                    className="w-full border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-primary-400 hover:bg-primary-50/50 transition-colors"
                  >
                    <ImageIcon className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-600">Bild auswählen</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Posts mit Bildern erhalten 3x mehr Reaktionen
                    </p>
                  </button>
                  {showImagePicker && (
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      {SAMPLE_IMAGES.map((img) => (
                        <button
                          key={img}
                          onClick={() => {
                            setImageUrl(img);
                            setShowImagePicker(false);
                          }}
                          className="relative h-20 rounded-lg overflow-hidden hover:ring-2 hover:ring-primary-500"
                        >
                          <Image src={img} alt="" fill className="object-cover" />
                        </button>
                      ))}
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
                Challenge verlinken
              </CardTitle>
            </CardHeader>
            <CardContent>
              <select
                value={linkedChallengeId}
                onChange={(e) => setLinkedChallengeId(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Keine Challenge verlinken</option>
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
                          {selectedChallenge.duration} Min
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
                Nutzer können direkt auf die Challenge klicken, um teilzunehmen
              </p>
            </CardContent>
          </Card>

          {/* Options */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Optionen</CardTitle>
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
                    <span className="font-medium text-slate-900">Hervorheben</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Der Post erscheint prominent im Feed
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
                    <span className="font-medium text-slate-900">Anpinnen</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Der Post bleibt oben im Feed
                  </p>
                </div>
              </label>
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <h3 className="text-sm font-medium text-slate-500 uppercase mb-4">Vorschau</h3>
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                {/* Preview Header */}
                <div className="p-4 bg-slate-50 border-b">
                  <div className="flex items-center gap-3">
                    {organization && (
                      <div className="relative w-10 h-10 rounded-full overflow-hidden">
                        <Image
                          src={organization.logo}
                          alt={organization.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-slate-900">{organization?.name}</p>
                      <p className="text-xs text-slate-500">Gerade eben</p>
                    </div>
                  </div>
                </div>

                {/* Preview Image */}
                {imageUrl && (
                  <div className="relative w-full h-40">
                    <Image src={imageUrl} alt="" fill className="object-cover" />
                  </div>
                )}

                {/* Preview Content */}
                <div className="p-4">
                  {title && (
                    <h4 className="font-semibold text-slate-900 mb-2">{title}</h4>
                  )}
                  {content && (
                    <p className="text-sm text-slate-600 line-clamp-3">{content}</p>
                  )}
                  {!title && !content && (
                    <p className="text-sm text-slate-400 italic">
                      Füge einen Titel und Inhalt hinzu...
                    </p>
                  )}

                  {/* Linked Challenge Preview */}
                  {selectedChallenge && (
                    <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        {selectedChallenge.imageUrl && (
                          <div className="relative w-10 h-10 rounded overflow-hidden flex-shrink-0">
                            <Image
                              src={selectedChallenge.imageUrl}
                              alt=""
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-slate-900 truncate">
                            {selectedChallenge.title}
                          </p>
                          <p className="text-xs text-slate-500">
                            {selectedChallenge.xpReward} XP
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Preview Reactions */}
                  <div className="mt-4 pt-3 border-t flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {Object.entries(REACTION_CONFIG).map(([type, config]) => (
                        <span key={type} className="text-lg opacity-50">
                          {config.emoji}
                        </span>
                      ))}
                    </div>
                    <span className="text-xs text-slate-400">0 Kommentare</span>
                  </div>
                </div>

                {/* Badges */}
                {(isHighlighted || isPinned) && (
                  <div className="px-4 pb-4 flex gap-2">
                    {isPinned && (
                      <Badge variant="outline" className="bg-primary-50 border-primary-200 text-primary-700 text-xs">
                        <Pin className="w-3 h-3 mr-1" />
                        Angepinnt
                      </Badge>
                    )}
                    {isHighlighted && (
                      <Badge variant="outline" className="bg-amber-50 border-amber-200 text-amber-700 text-xs">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Hervorgehoben
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="mt-6 space-y-3">
              <Button
                onClick={() => handleSubmit(false)}
                disabled={!title && !content}
                className="w-full gap-2"
              >
                <Eye className="h-4 w-4" />
                Veröffentlichen
              </Button>
              <Button
                onClick={() => handleSubmit(true)}
                variant="outline"
                className="w-full gap-2"
              >
                <Save className="h-4 w-4" />
                Als Entwurf speichern
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
