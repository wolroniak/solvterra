'use client';

import { useState, useEffect } from 'react';
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
  Send,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useCommunityStore, useChallengeStore } from '@/store';
import { type CommunityPost } from '@/lib/mock-data';
import { useIsRejected } from '@/components/verification-banner';

// Format time ago
const useFormatTimeAgo = () => {
  const { t } = useTranslation('community');

  return (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 1) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return t('timeAgo.minutes', { count: diffMins });
    }
    if (diffHours < 24) {
      return t('timeAgo.hours', { count: diffHours });
    }
    const diffDays = Math.floor(diffHours / 24);
    return t('timeAgo.day', { count: diffDays });
  };
};

// Post Card Component
function PostCard({
  post,
  onPublish,
  onUnpublish,
  onPin,
  onHighlight,
  onDelete,
  onToggleLike,
  onAddComment,
  onLoadComments,
  comments,
}: {
  post: CommunityPost;
  onPublish: () => void;
  onUnpublish: () => void;
  onPin: () => void;
  onHighlight: () => void;
  onDelete: () => void;
  onToggleLike: () => void;
  onAddComment: (content: string) => void;
  onLoadComments: () => void;
  comments?: { id: string; content: string; userName: string; userAvatarUrl?: string; createdAt: Date }[];
}) {
  const { t } = useTranslation('community');
  const [showMenu, setShowMenu] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const formatTimeAgo = useFormatTimeAgo();

  const handleToggleComments = () => {
    if (!showComments) {
      onLoadComments();
    }
    setShowComments(!showComments);
  };

  const handleSendComment = () => {
    if (!commentText.trim()) return;
    onAddComment(commentText.trim());
    setCommentText('');
  };

  return (
    <Card className={`relative ${post.isPinned ? 'border-primary-300 bg-primary-50/30' : ''}`}>
      {/* Status badges */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
        {post.isPinned && (
          <Badge variant="outline" className="bg-primary-100 border-primary-300 text-primary-700">
            <Pin className="w-3 h-3 mr-1" />
            {t('postCard.pinned')}
          </Badge>
        )}
        {post.isHighlighted && (
          <Badge variant="outline" className="bg-amber-100 border-amber-300 text-amber-700">
            <Sparkles className="w-3 h-3 mr-1" />
            {t('postCard.highlighted')}
          </Badge>
        )}
        {post.status === 'draft' && (
          <Badge variant="outline" className="bg-slate-100 border-slate-300 text-slate-700">
            {t('postCard.draft')}
          </Badge>
        )}

        {/* Edit button - always visible */}
        <Link
          href={`/community/${post.id}/edit`}
          className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-700 transition-colors"
          title={t('postCard.edit')}
        >
          <Edit className="w-4 h-4" />
        </Link>

        {/* More actions menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-700 transition-colors"
            title={t('postCard.moreActions')}
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-8 z-20 w-48 bg-white border rounded-lg shadow-lg py-1">
              {post.status === 'draft' ? (
                <button
                  onClick={() => { onPublish(); setShowMenu(false); }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-50 text-left"
                >
                  <Eye className="w-4 h-4" />
                  {t('postCard.publish')}
                </button>
              ) : (
                <button
                  onClick={() => { onUnpublish(); setShowMenu(false); }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-50 text-left"
                >
                  <EyeOff className="w-4 h-4" />
                  {t('postCard.unpublish')}
                </button>
              )}
              <button
                onClick={() => { onPin(); setShowMenu(false); }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-50 text-left"
              >
                <Pin className="w-4 h-4" />
                {post.isPinned ? t('postCard.unpin') : t('postCard.pin')}
              </button>
              <button
                onClick={() => { onHighlight(); setShowMenu(false); }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-50 text-left"
              >
                <Sparkles className="w-4 h-4" />
                {post.isHighlighted ? t('postCard.unhighlight') : t('postCard.highlight')}
              </button>
              <hr className="my-1" />
              <button
                onClick={() => { onDelete(); setShowMenu(false); }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-red-50 text-red-600 text-left"
              >
                <Trash2 className="w-4 h-4" />
                {t('postCard.delete')}
              </button>
            </div>
          )}
        </div>
      </div>

      <CardContent className="pt-6">
        {/* Post Image - mt-8 to clear the action buttons in top-right */}
        {post.imageUrl && (
          <div className="relative w-full h-48 mb-4 mt-8 rounded-lg overflow-hidden bg-slate-100">
            <Image
              src={post.imageUrl}
              alt={post.title || 'Post image'}
              fill
              className="object-cover"
              unoptimized
              onError={(e) => {
                // Hide broken images
                (e.target as HTMLImageElement).style.display = 'none';
              }}
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
              <div className="relative w-12 h-12 rounded overflow-hidden flex-shrink-0 bg-slate-100">
                <Image
                  src={post.linkedChallenge.imageUrl}
                  alt={post.linkedChallenge.title}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">
                {post.linkedChallenge.title}
              </p>
              <p className="text-xs text-slate-500">
                {post.linkedChallenge.xpReward} XP · {post.linkedChallenge.durationMinutes} {t('postCard.minutes')}
              </p>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-400" />
          </Link>
        )}

        {/* Engagement Stats */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-4">
            {/* Like Button */}
            <button
              onClick={onToggleLike}
              className="flex items-center gap-1.5 text-sm group"
            >
              <Heart
                className={`w-5 h-5 transition-colors ${
                  post.userHasLiked
                    ? 'fill-red-500 text-red-500'
                    : 'text-slate-400 group-hover:text-red-400'
                }`}
              />
              <span className={post.userHasLiked ? 'text-red-500 font-medium' : 'text-slate-500'}>
                {post.likesCount}
              </span>
            </button>

            {/* Comment toggle */}
            <button
              onClick={handleToggleComments}
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700"
            >
              <MessageCircle className="w-5 h-5" />
              <span>{post.commentsCount}</span>
              {showComments ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </button>
          </div>
          <span className="flex items-center gap-1 text-sm text-slate-500">
            <Clock className="w-4 h-4" />
            {formatTimeAgo(post.createdAt)}
          </span>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-4 pt-4 border-t space-y-3">
            {/* Comment list */}
            {comments && comments.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex items-start gap-2">
                    <Avatar className="w-6 h-6">
                      {comment.userAvatarUrl && <AvatarImage src={comment.userAvatarUrl} />}
                      <AvatarFallback>{comment.userName?.[0] || '?'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs">
                        <span className="font-medium">{comment.userName || t('postCard.anonymous')}:</span>{' '}
                        <span className="text-slate-600">{comment.content}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">{t('postCard.noComments')}</p>
            )}

            {/* Comment input */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSendComment(); }}
                placeholder={t('postCard.writeComment')}
                className="flex-1 px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                onClick={handleSendComment}
                disabled={!commentText.trim()}
                className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg disabled:opacity-40 disabled:hover:bg-transparent"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Recent Comments Preview (only when comments section is collapsed) */}
        {!showComments && post.comments && post.comments.length > 0 && (
          <div className="mt-4 pt-4 border-t space-y-2">
            <p className="text-xs font-medium text-slate-500 uppercase">{t('postCard.recentComments')}</p>
            {post.comments.slice(0, 2).map((comment) => (
              <div key={comment.id} className="flex items-start gap-2">
                <Avatar className="w-6 h-6">
                  <AvatarFallback>{comment.userName?.[0] || '?'}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-xs">
                    <span className="font-medium">{comment.userName || t('postCard.anonymous')}:</span>{' '}
                    <span className="text-slate-600">{comment.content}</span>
                  </p>
                </div>
              </div>
            ))}
            {post.commentsCount > 2 && (
              <button
                onClick={handleToggleComments}
                className="text-xs text-primary-600 hover:underline"
              >
                {t('postCard.showAllComments', { count: post.commentsCount })}
              </button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function CommunityPage() {
  const { t } = useTranslation('community');
  const {
    posts, stats, loading, loadPosts,
    publishPost, unpublishPost, pinPost, highlightPost, deletePost,
    toggleLike, addComment, loadComments, postComments,
  } = useCommunityStore();
  const { challenges } = useChallengeStore();
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');
  const isRejected = useIsRejected();

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

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
            {t('page.title')}
          </h1>
          <p className="text-slate-500 mt-1">
            {t('page.description')}
          </p>
        </div>
        <div className="relative group">
          {isRejected ? (
            <Button disabled className="gap-2 opacity-50 cursor-not-allowed">
              <Plus className="h-4 w-4" />
              {t('newPost')}
            </Button>
          ) : (
            <Link href="/community/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                {t('newPost')}
              </Button>
            </Link>
          )}
          {isRejected && (
            <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-slate-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
              {t('rejectedTooltip')}
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
                <p className="text-sm text-slate-500">{t('stats.published')}</p>
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
                <p className="text-sm text-slate-500">{t('stats.drafts')}</p>
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
                <p className="text-sm text-slate-500">{t('stats.likes')}</p>
                <p className="text-2xl font-bold text-slate-900">{stats.totalLikes}</p>
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
                <p className="text-sm text-slate-500">{t('stats.comments')}</p>
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
                {t('infoBox.title')}
              </h3>
              <p className="text-sm text-slate-600">
                {t('infoBox.description')}
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
          {t('filter.all', { count: posts.length })}
        </button>
        <button
          onClick={() => setFilter('published')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'published'
              ? 'bg-primary-100 text-primary-700'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          {t('filter.published', { count: posts.filter((p) => p.status === 'published').length })}
        </button>
        <button
          onClick={() => setFilter('draft')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'draft'
              ? 'bg-primary-100 text-primary-700'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          {t('filter.drafts', { count: posts.filter((p) => p.status === 'draft').length })}
        </button>
      </div>

      {/* Posts Grid */}
      {sortedPosts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              {t('emptyState.title')}
            </h3>
            <p className="text-slate-500 mb-4">
              {t('emptyState.description')}
            </p>
            <Link href="/community/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                {t('emptyState.createFirst')}
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
                if (confirm(t('postCard.confirmDelete'))) {
                  deletePost(post.id);
                }
              }}
              onToggleLike={() => toggleLike(post.id)}
              onAddComment={(content) => addComment(post.id, content)}
              onLoadComments={() => loadComments(post.id)}
              comments={postComments[post.id]}
            />
          ))}
        </div>
      )}
    </div>
  );
}
