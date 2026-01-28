'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Pause,
  Play,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Header } from '@/components/layout/header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useChallengeStore } from '@/store';
import { useCanPublish, useCanCreateChallenges } from '@/components/verification-banner';
import { formatDate, cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

function ChallengesSkeleton() {
  return (
    <div className="p-6 space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <Skeleton className="h-4 w-72" />
                <div className="flex gap-3">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-8 w-8 rounded" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function ChallengesPage() {
  const { t } = useTranslation('challenges');
  const { challenges, loading, deleteChallenge, publishChallenge, pauseChallenge } = useChallengeStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const canPublish = useCanPublish();
  const canCreate = useCanCreateChallenges();

  const filteredChallenges = challenges.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === 'all') return matchesSearch;
    return matchesSearch && c.status === activeTab;
  });

  const counts = {
    all: challenges.length,
    active: challenges.filter((c) => c.status === 'active').length,
    draft: challenges.filter((c) => c.status === 'draft').length,
    paused: challenges.filter((c) => c.status === 'paused').length,
  };

  const STATUS_BADGES: Record<string, { variant: 'default' | 'success' | 'warning' | 'info' | 'outline'; labelKey: string }> = {
    draft: { variant: 'outline', labelKey: 'status.draft' },
    active: { variant: 'success', labelKey: 'status.active' },
    paused: { variant: 'warning', labelKey: 'status.paused' },
    completed: { variant: 'info', labelKey: 'status.completed' },
  };

  const NewChallengeButton = () => (
    <div className="relative group">
      {canCreate ? (
        <Link href="/challenges/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            {t('list.newChallenge')}
          </Button>
        </Link>
      ) : (
        <Button disabled className="opacity-50 cursor-not-allowed">
          <Plus className="h-4 w-4 mr-2" />
          {t('list.newChallenge')}
        </Button>
      )}
      {!canCreate && (
        <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-slate-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
          {t('list.organizationRejected')}
          <div className="absolute top-full right-4 border-4 border-transparent border-t-slate-900" />
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex flex-col">
        <Header
          title={t('list.title')}
          description={t('list.description')}
          action={<NewChallengeButton />}
        />
        <ChallengesSkeleton />
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <Header
        title={t('list.title')}
        description={t('list.description')}
        action={<NewChallengeButton />}
      />

      <div className="p-6 space-y-6">
        {/* Filters */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder={t('list.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">{t('list.tabAll', { count: counts.all })}</TabsTrigger>
              <TabsTrigger value="active">{t('list.tabActive', { count: counts.active })}</TabsTrigger>
              <TabsTrigger value="draft">{t('list.tabDrafts', { count: counts.draft })}</TabsTrigger>
              <TabsTrigger value="paused">{t('list.tabPaused', { count: counts.paused })}</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Challenge List */}
        {filteredChallenges.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-slate-500">
              <Search className="h-12 w-12 mb-4 text-slate-300" />
              <p className="text-lg font-medium">{t('list.noResults')}</p>
              <p className="text-sm">{t('list.noResultsHint')}</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{t('list.tableChallenge')}</th>
                    <th>{t('list.tableCategory')}</th>
                    <th>{t('list.tableDuration')}</th>
                    <th>{t('list.tableParticipants')}</th>
                    <th>{t('list.tableStatus')}</th>
                    <th>{t('list.tableCreated')}</th>
                    <th className="w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredChallenges.map((challenge) => {
                    const statusBadge = STATUS_BADGES[challenge.status];
                    const progress =
                      (challenge.currentParticipants / challenge.maxParticipants) * 100;

                    return (
                      <tr key={challenge.id}>
                        <td>
                          <div className="flex items-center gap-3">
                            <img
                              src={challenge.imageUrl}
                              alt={challenge.title}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                            <div>
                              <p className="font-medium text-slate-900">
                                {challenge.title}
                              </p>
                              <p className="text-sm text-slate-500">
                                {challenge.xpReward} XP
                              </p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <Badge variant="outline">
                            {t(`categories.${challenge.category}`)}
                          </Badge>
                        </td>
                        <td>{t('list.durationMinutes', { count: challenge.duration })}</td>
                        <td>
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary-500 rounded-full"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <span className="text-sm text-slate-500">
                              {challenge.currentParticipants}/{challenge.maxParticipants}
                            </span>
                          </div>
                        </td>
                        <td>
                          <Badge variant={statusBadge.variant}>
                            {t(statusBadge.labelKey)}
                          </Badge>
                        </td>
                        <td className="text-slate-500">
                          {formatDate(challenge.createdAt)}
                        </td>
                        <td>
                          <div className="flex items-center gap-1">
                            <Link href={`/challenges/${challenge.id}`}>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link href={`/challenges/${challenge.id}/edit`}>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            {challenge.status === 'draft' && (
                              <div className="relative group">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className={`h-8 w-8 ${canPublish ? 'text-green-600' : 'text-slate-400 cursor-not-allowed'}`}
                                  onClick={() => canPublish && publishChallenge(challenge.id)}
                                  disabled={!canPublish}
                                >
                                  <Play className="h-4 w-4" />
                                </Button>
                                {!canPublish && (
                                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                                    {t('list.waitingForVerification')}
                                  </div>
                                )}
                              </div>
                            )}
                            {challenge.status === 'active' && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-amber-600"
                                onClick={() => pauseChallenge(challenge.id)}
                              >
                                <Pause className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-600"
                              onClick={() => deleteChallenge(challenge.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
