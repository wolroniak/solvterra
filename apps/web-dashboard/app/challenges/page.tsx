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
import { Header } from '@/components/layout/header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useChallengeStore } from '@/store';
import { CATEGORY_LABELS, STATUS_LABELS } from '@/lib/mock-data';
import { formatDate, cn } from '@/lib/utils';

const STATUS_BADGES: Record<string, { variant: 'default' | 'success' | 'warning' | 'info' | 'outline'; label: string }> = {
  draft: { variant: 'outline', label: 'Entwurf' },
  active: { variant: 'success', label: 'Aktiv' },
  paused: { variant: 'warning', label: 'Pausiert' },
  completed: { variant: 'info', label: 'Abgeschlossen' },
};

export default function ChallengesPage() {
  const { challenges, deleteChallenge, publishChallenge, pauseChallenge } = useChallengeStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

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

  return (
    <div className="flex flex-col">
      <Header
        title="Challenges"
        description="Verwalte deine Micro-Volunteering Challenges"
        action={
          <Link href="/challenges/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Neue Challenge
            </Button>
          </Link>
        }
      />

      <div className="p-6 space-y-6">
        {/* Filters */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Challenges suchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">Alle ({counts.all})</TabsTrigger>
              <TabsTrigger value="active">Aktiv ({counts.active})</TabsTrigger>
              <TabsTrigger value="draft">Entwürfe ({counts.draft})</TabsTrigger>
              <TabsTrigger value="paused">Pausiert ({counts.paused})</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Challenge List */}
        {filteredChallenges.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-slate-500">
              <Search className="h-12 w-12 mb-4 text-slate-300" />
              <p className="text-lg font-medium">Keine Challenges gefunden</p>
              <p className="text-sm">Versuche einen anderen Suchbegriff oder Filter</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Challenge</th>
                    <th>Kategorie</th>
                    <th>Dauer</th>
                    <th>Teilnehmer</th>
                    <th>Status</th>
                    <th>Erstellt</th>
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
                            {CATEGORY_LABELS[challenge.category]}
                          </Badge>
                        </td>
                        <td>{challenge.duration} Min</td>
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
                            {statusBadge.label}
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
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-green-600"
                                onClick={() => publishChallenge(challenge.id)}
                              >
                                <Play className="h-4 w-4" />
                              </Button>
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
