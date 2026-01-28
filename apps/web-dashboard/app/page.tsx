'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import {
  ClipboardList,
  Users,
  Clock,
  TrendingUp,
  Inbox,
  Plus,
  ArrowRight,
  CheckCircle,
  XCircle,
  Heart,
  MessageCircle,
  Megaphone,
  Trophy,
  Star,
  Zap,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useTranslation } from 'react-i18next';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { useChallengeStore, useSubmissionStore, useCommunityStore } from '@/store';
import { MOCK_WEEKLY_DATA } from '@/lib/mock-data';
import { formatRelativeTime } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

function DashboardSkeleton() {
  return (
    <div className="flex flex-col">
      <div className="border-b px-6 py-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-72 mt-2" />
      </div>
      <div className="p-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-4 rounded" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-7 w-12 mb-1" />
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader><Skeleton className="h-5 w-44" /></CardHeader>
            <CardContent><Skeleton className="h-64 w-full" /></CardContent>
          </Card>
          <Card>
            <CardHeader><Skeleton className="h-5 w-48" /></CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader><Skeleton className="h-5 w-48" /></CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-56" />
                </div>
                <Skeleton className="h-3 w-16" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

const POST_TYPE_ICONS: Record<string, typeof Heart> = {
  success_story: Trophy,
  challenge_completed: CheckCircle,
  badge_earned: Star,
  level_up: Zap,
  ngo_promotion: Megaphone,
  team_challenge: Users,
  streak_achieved: TrendingUp,
};

export default function DashboardPage() {
  const { t } = useTranslation('dashboard');
  const { challenges, stats, loading: challengesLoading } = useChallengeStore();
  const { submissions, pendingCount, loading: submissionsLoading } = useSubmissionStore();
  const { activityFeed, activityFeedLoading, loadActivityFeed } = useCommunityStore();

  useEffect(() => {
    loadActivityFeed();
  }, [loadActivityFeed]);

  if (challengesLoading || submissionsLoading) {
    return <DashboardSkeleton />;
  }

  const recentSubmissions = submissions
    .filter((s) => s.status === 'submitted')
    .slice(0, 3);

  const activeChallenges = challenges
    .filter((c) => c.status === 'active')
    .slice(0, 3);

  return (
    <div className="flex flex-col">
      <Header
        title={t('header.title')}
        description={t('header.description')}
        action={
          <Link href="/challenges/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t('actions.newChallenge')}
            </Button>
          </Link>
        }
      />

      <div className="p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                {t('stats.activeChallenges')}
              </CardTitle>
              <ClipboardList className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeChallenges}</div>
              <p className="text-xs text-slate-500">
                {t('stats.ofTotal', { total: stats.totalChallenges })}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                {t('stats.participants')}
              </CardTitle>
              <Users className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalParticipants}</div>
              <p className="text-xs text-green-600">{t('stats.participantsThisWeek')}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                {t('stats.pendingReviews')}
              </CardTitle>
              <Inbox className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingCount}</div>
              <p className="text-xs text-amber-600">{t('stats.requiresAttention')}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                {t('stats.volunteerHours')}
              </CardTitle>
              <Clock className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalVolunteerHours}h</div>
              <p className="text-xs text-slate-500">{t('stats.totalContribution')}</p>
            </CardContent>
          </Card>
        </div>

        {/* Chart and Pending Submissions */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Weekly Activity Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('chart.weeklyActivity')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={MOCK_WEEKLY_DATA}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e8e6e0" />
                    <XAxis dataKey="name" stroke="#78756c" fontSize={12} />
                    <YAxis stroke="#78756c" fontSize={12} />
                    <Tooltip />
                    <Bar
                      dataKey="submissions"
                      name={t('chart.submissions')}
                      fill="#a8c89d"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="approved"
                      name={t('chart.approved')}
                      fill="#2e6417"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Pending Submissions */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">{t('pendingSubmissions.title')}</CardTitle>
              <Link href="/submissions">
                <Button variant="ghost" size="sm">
                  {t('actions.viewAll')}
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {recentSubmissions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-slate-500">
                  <CheckCircle className="h-12 w-12 mb-2 text-green-500" />
                  <p>{t('pendingSubmissions.allProcessed')}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentSubmissions.map((submission) => (
                    <Link
                      key={submission.id}
                      href={`/submissions/${submission.id}`}
                      className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <Avatar>
                        <AvatarImage src={submission.studentAvatar} />
                        <AvatarFallback>
                          {submission.studentName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {submission.studentName}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {submission.challengeTitle}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant="warning">{t('pendingSubmissions.pending')}</Badge>
                        <p className="text-xs text-slate-400 mt-1">
                          {formatRelativeTime(submission.submittedAt)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Active Challenges */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">{t('activeChallenges.title')}</CardTitle>
            <Link href="/challenges">
              <Button variant="ghost" size="sm">
                {t('actions.viewAll')}
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeChallenges.map((challenge) => {
                const progress =
                  (challenge.currentParticipants / challenge.maxParticipants) * 100;
                return (
                  <Link
                    key={challenge.id}
                    href={`/challenges/${challenge.id}`}
                    className="flex items-center gap-4 p-4 rounded-lg border hover:border-primary-200 hover:bg-primary-50/30 transition-colors"
                  >
                    <img
                      src={challenge.imageUrl}
                      alt={challenge.title}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {challenge.title}
                        </p>
                        <Badge variant="info">
                          {t(`categories.${challenge.category}`)}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 mb-2">
                        {t('activeChallenges.minutesXp', { duration: challenge.duration, xp: challenge.xpReward })}
                      </p>
                      <div className="flex items-center gap-2">
                        <Progress value={progress} className="h-2 flex-1" />
                        <span className="text-xs text-slate-500 whitespace-nowrap">
                          {challenge.currentParticipants}/{challenge.maxParticipants}
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-slate-400" />
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Community Activity Feed */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">{t('activityFeed.title')}</CardTitle>
            <Link href="/community">
              <Button variant="ghost" size="sm">
                {t('activityFeed.viewAll')}
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {activityFeedLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-56" />
                    </div>
                  </div>
                ))}
              </div>
            ) : activityFeed.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-slate-500">
                <MessageCircle className="h-10 w-10 mb-2 text-slate-300" />
                <p className="text-sm">{t('activityFeed.empty')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activityFeed.slice(0, 6).map((post) => {
                  const TypeIcon = POST_TYPE_ICONS[post.type] || Megaphone;
                  return (
                    <Link
                      key={post.id}
                      href="/community"
                      className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={post.authorAvatarUrl} />
                        <AvatarFallback>{post.authorName[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-900 truncate">
                          <span className="font-medium">{post.authorName}</span>
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {post.title || post.content?.slice(0, 60)}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="flex items-center gap-1 text-xs text-slate-400">
                            <Heart className="w-3 h-3" />
                            {post.likesCount}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-slate-400">
                            <MessageCircle className="w-3 h-3" />
                            {post.commentsCount}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <TypeIcon className="h-4 w-4 text-slate-400" />
                        <span className="text-xs text-slate-400">
                          {formatRelativeTime(post.createdAt)}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Approval Rate Card */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('approvalRate.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center">
                <div className="relative">
                  <svg className="w-32 h-32">
                    <circle
                      className="text-cream-300"
                      strokeWidth="10"
                      stroke="currentColor"
                      fill="transparent"
                      r="56"
                      cx="64"
                      cy="64"
                    />
                    <circle
                      className="text-primary-600"
                      strokeWidth="10"
                      strokeDasharray={`${(stats.approvalRate / 100) * 352} 352`}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                      r="56"
                      cx="64"
                      cy="64"
                      style={{
                        transform: 'rotate(-90deg)',
                        transformOrigin: '64px 64px',
                      }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold text-foreground">
                      {stats.approvalRate}%
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-center text-sm text-slate-500 mt-4">
                {t('approvalRate.basedOnLast30Days')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('quickActions.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/challenges/new">
                <Button className="w-full justify-start" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  {t('quickActions.createChallenge')}
                </Button>
              </Link>
              <Link href="/submissions">
                <Button className="w-full justify-start" variant="outline">
                  <Inbox className="h-4 w-4 mr-2" />
                  {t('quickActions.reviewSubmissions')}
                  {pendingCount > 0 && (
                    <Badge variant="destructive" className="ml-auto">
                      {pendingCount}
                    </Badge>
                  )}
                </Button>
              </Link>
              <Link href="/statistics">
                <Button className="w-full justify-start" variant="outline">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  {t('quickActions.viewStatistics')}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
