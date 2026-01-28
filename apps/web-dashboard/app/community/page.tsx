'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Users,
  Plus,
  Heart,
  MessageCircle,
  Pin,
  Sparkles,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  ExternalLink,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useCommunityStore, useChallengeStore } from '@/store';
import { REACTION_CONFIG, type CommunityPost } from '@/lib/mock-data';
import { useIsRejected } from '@/components/verification-banner';

// Format time ago
const formatTimeAgo = (date: Date) => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours < 1) {
    const diffMins = Math.floor(diffMs / (1000 * 60));
    return `vor ${diffMins} Min`;
  }
  if (diffHours < 24) {
    return `vor ${diffHours} Std`;
  }
  const diffDays = Math.floor(diffHours / 24);
  return `vor ${diffDays} ${diffDays === 1 ? 'Tag' : 'Tagen'}`;
};

// Post Card Component
function PostCard({
  post,
  onPublish,
  onUnpublish,
  onPin,
  onHighlight,
  onDelete,
}: {
  post: CommunityPost;
  onPublish: () => void;
  onUnpublish: () => void;
  onPin: () => void;
  onHighlight: () => void;
  onDelete: () => void;
}) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <Card className={`relative ${post.isPinned ? 'border-primary-300 bg-primary-50/30' : ''}`}>
      {/* Status badges */}
      <div className="absolute top-3 right-3 flex items-center gap-2">
        {post.isPinned && (
          <Badge variant="outline" className="bg-primary-100 border-primary-300 text-primary-700">
            <Pin className="w-3 h-3 mr-1" />
            Angepinnt
          </Badge>
        )}
        {post.isHighlighted && (
          <Badge variant="outline" className="bg-amber-100 border-amber-300 text-amber-700">
            <Sparkles className="w-3 h-3 mr-1" />
            Hervorgehoben
          </Badge>
        )}
        {post.status === 'draft' && (
          <Badge variant="outline" className="bg-slate-100 border-slate-300 text-slate-700">
            Entwurf
          </Badge>
        )}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 hover:bg-slate-100 rounded"
          >
            <MoreVertical className="w-4 h-4 text-slate-500" />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-8 z-10 w-48 bg-white border rounded-lg shadow-lg py-1">
              <Link
                href={`/community/${post.id}/edit`}
                className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-50"
              >
                <Edit className="w-4 h-4" />
                Bearbeiten
              </Link>
              {post.status === 'draft' ? (
                <button
                  onClick={() => { onPublish(); setShowMenu(false); }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-50 text-left"
                >
                  <Eye className="w-4 h-4" />
                  Veröffentlichen
                </button>
              ) : (
                <button
                  onClick={() => { onUnpublish(); setShowMenu(false); }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-50 text-left"
                >
                  <EyeOff className="w-4 h-4" />
                  Zurückziehen
                </button>
              )}
              <button
                onClick={() => { onPin(); setShowMenu(false); }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-50 text-left"
              >
                <Pin className="w-4 h-4" />
                {post.isPinned ? 'Nicht mehr anpinnen' : 'Anpinnen'}
              </button>
              <button
                onClick={() => { onHighlight(); setShowMenu(false); }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-50 text-left"
              >
                <Sparkles className="w-4 h-4" />
                {post.isHighlighted ? 'Nicht mehr hervorheben' : 'Hervorheben'}
              </button>
              <hr className="my-1" />
              <button
                onClick={() => { onDelete(); setShowMenu(false); }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-red-50 text-red-600 text-left"
              >
                <Trash2 className="w-4 h-4" />
                Löschen
              </button>
            </div>
          )}
        </div>
      </div>

      <CardContent className="pt-6">
        {/* Post Image */}
        {post.imageUrl && (
          <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden">
            <Image
              src={post.imageUrl}
              alt={post.title || 'Post image'}
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* Post Title */}
        {post.title && (
          <h3 className="text-lg font-semibold text-slate-900 mb-2">{post.title}</h3>
        )}

        {/* Post Content */}
        {post.content && (
          <p className="text-slate-600 text-sm mb-4 line-clamp-3">{post.content}</p>
        )}

        {/* Linked Challenge */}
        {post.linkedChallenge && (
          <Link
            href={`/challenges/${post.linkedChallengeId}`}
            className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors mb-4"
          >
            {post.linkedChallenge.imageUrl && (
              <div className="relative w-12 h-12 rounded overflow-hidden flex-shrink-0">
                <Image
                  src={post.linkedChallenge.imageUrl}
                  alt={post.linkedChallenge.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">
                {post.linkedChallenge.title}
              </p>
              <p className="text-xs text-slate-500">
                {post.linkedChallenge.xpReward} XP · {post.linkedChallenge.durationMinutes} Min
              </p>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-400" />
          </Link>
        )}

        {/* Engagement Stats */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-4">
            {/* Reactions */}
            <div className="flex items-center gap-1">
              {Object.entries(post.reactions).map(([type, count]) => {
                if (count === 0) return null;
                const config = REACTION_CONFIG[type as keyof typeof REACTION_CONFIG];
                return (
                  <span key={type} className="flex items-center gap-1 text-sm">
                    <span>{config.emoji}</span>
                    <span className="text-slate-500">{count}</span>
                  </span>
                );
              })}
              {post.totalReactions === 0 && (
                <span className="text-sm text-slate-400">Keine Reaktionen</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <span className="flex items-center gap-1">
              <MessageCircle className="w-4 h-4" />
              {post.commentsCount}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {formatTimeAgo(post.createdAt)}
            </span>
          </div>
        </div>

        {/* Recent Comments Preview */}
        {post.comments && post.comments.length > 0 && (
          <div className="mt-4 pt-4 border-t space-y-2">
            <p className="text-xs font-medium text-slate-500 uppercase">Neueste Kommentare</p>
            {post.comments.slice(0, 2).map((comment) => (
              <div key={comment.id} className="flex items-start gap-2">
                <Avatar className="w-6 h-6">
                  <AvatarImage src={comment.userAvatarUrl} />
                  <AvatarFallback>{comment.userName[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-xs">
                    <span className="font-medium">{comment.userName}:</span>{' '}
                    <span className="text-slate-600">{comment.content}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function CommunityPage() {
  const { posts, stats, publishPost, unpublishPost, pinPost, highlightPost, deletePost } = useCommunityStore();
  const { challenges } = useChallengeStore();
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');
  const isRejected = useIsRejected();

  const filteredPosts = posts.filter((post) => {
    if (filter === 'all') return true;
    return post.status === filter;
  });

  // Sort: pinned first, then by date
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <Users className="h-7 w-7 text-primary-600" />
            Community
          </h1>
          <p className="text-slate-500 mt-1">
            Erstelle Posts, um deine Challenges in der Community zu bewerben
          </p>
        </div>
        <div className="relative group">
          {isRejected ? (
            <Button disabled className="gap-2 opacity-50 cursor-not-allowed">
              <Plus className="h-4 w-4" />
              Neuer Post
            </Button>
          ) : (
            <Link href="/community/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Neuer Post
              </Button>
            </Link>
          )}
          {isRejected && (
            <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-slate-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
              Organisation wurde abgelehnt
              <div className="absolute top-full right-4 border-4 border-transparent border-t-slate-900" />
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Veröffentlicht</p>
                <p className="text-2xl font-bold text-slate-900">{stats.publishedPosts}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Eye className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Entwürfe</p>
                <p className="text-2xl font-bold text-slate-900">{stats.draftPosts}</p>
              </div>
              <div className="p-3 bg-slate-100 rounded-full">
                <Edit className="h-5 w-5 text-slate-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Reaktionen</p>
                <p className="text-2xl font-bold text-slate-900">{stats.totalReactions}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <Heart className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Kommentare</p>
                <p className="text-2xl font-bold text-slate-900">{stats.totalComments}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <MessageCircle className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Box */}
      <Card className="mb-8 bg-gradient-to-r from-primary-50 to-cream-100 border-primary-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white rounded-full shadow-sm">
              <TrendingUp className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-1">
                Erreiche mehr Teilnehmer mit Community-Posts
              </h3>
              <p className="text-sm text-slate-600">
                Deine Posts erscheinen im Community-Feed der mobilen App. Nutzer können direkt
                auf verlinkte Challenges klicken und teilnehmen. Posts mit Bildern erhalten
                durchschnittlich 3x mehr Reaktionen!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'all'
              ? 'bg-primary-100 text-primary-700'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Alle ({posts.length})
        </button>
        <button
          onClick={() => setFilter('published')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'published'
              ? 'bg-primary-100 text-primary-700'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Veröffentlicht ({posts.filter((p) => p.status === 'published').length})
        </button>
        <button
          onClick={() => setFilter('draft')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'draft'
              ? 'bg-primary-100 text-primary-700'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Entwürfe ({posts.filter((p) => p.status === 'draft').length})
        </button>
      </div>

      {/* Posts Grid */}
      {sortedPosts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              Noch keine Posts vorhanden
            </h3>
            <p className="text-slate-500 mb-4">
              Erstelle deinen ersten Post, um deine Challenges in der Community zu bewerben.
            </p>
            <Link href="/community/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Ersten Post erstellen
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sortedPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onPublish={() => publishPost(post.id)}
              onUnpublish={() => unpublishPost(post.id)}
              onPin={() => pinPost(post.id, !post.isPinned)}
              onHighlight={() => highlightPost(post.id, !post.isHighlighted)}
              onDelete={() => {
                if (confirm('Möchtest du diesen Post wirklich löschen?')) {
                  deletePost(post.id);
                }
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
