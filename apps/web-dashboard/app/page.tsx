'use client';

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
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { useChallengeStore, useSubmissionStore } from '@/store';
import { MOCK_WEEKLY_DATA, STATUS_LABELS, CATEGORY_LABELS } from '@/lib/mock-data';
import { formatRelativeTime } from '@/lib/utils';

export default function DashboardPage() {
  const { challenges, stats } = useChallengeStore();
  const { submissions, pendingCount } = useSubmissionStore();

  const recentSubmissions = submissions
    .filter((s) => s.status === 'submitted')
    .slice(0, 3);

  const activeChallenges = challenges
    .filter((c) => c.status === 'active')
    .slice(0, 3);

  return (
    <div className="flex flex-col">
      <Header
        title="Dashboard"
        description="Übersicht über deine Challenges und Einreichungen"
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
        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Aktive Challenges
              </CardTitle>
              <ClipboardList className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeChallenges}</div>
              <p className="text-xs text-slate-500">
                von {stats.totalChallenges} insgesamt
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Teilnehmer
              </CardTitle>
              <Users className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalParticipants}</div>
              <p className="text-xs text-green-600">+23 diese Woche</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Ausstehende Reviews
              </CardTitle>
              <Inbox className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingCount}</div>
              <p className="text-xs text-amber-600">Erfordert Aufmerksamkeit</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Freiwilligenstunden
              </CardTitle>
              <Clock className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalVolunteerHours}h</div>
              <p className="text-xs text-slate-500">Gesamtbeitrag</p>
            </CardContent>
          </Card>
        </div>

        {/* Chart and Pending Submissions */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Weekly Activity Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Wöchentliche Aktivität</CardTitle>
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
                      name="Einreichungen"
                      fill="#a8c89d"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="approved"
                      name="Genehmigt"
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
              <CardTitle className="text-lg">Ausstehende Einreichungen</CardTitle>
              <Link href="/submissions">
                <Button variant="ghost" size="sm">
                  Alle anzeigen
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {recentSubmissions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-slate-500">
                  <CheckCircle className="h-12 w-12 mb-2 text-green-500" />
                  <p>Alle Einreichungen bearbeitet!</p>
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
                        <Badge variant="warning">Ausstehend</Badge>
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
            <CardTitle className="text-lg">Aktive Challenges</CardTitle>
            <Link href="/challenges">
              <Button variant="ghost" size="sm">
                Alle anzeigen
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
                          {CATEGORY_LABELS[challenge.category]}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 mb-2">
                        {challenge.duration} Min · {challenge.xpReward} XP
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

        {/* Approval Rate Card */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Genehmigungsrate</CardTitle>
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
                Basierend auf den letzten 30 Tagen
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Schnellaktionen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/challenges/new">
                <Button className="w-full justify-start" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Neue Challenge erstellen
                </Button>
              </Link>
              <Link href="/submissions">
                <Button className="w-full justify-start" variant="outline">
                  <Inbox className="h-4 w-4 mr-2" />
                  Einreichungen prüfen
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
                  Statistiken anzeigen
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
