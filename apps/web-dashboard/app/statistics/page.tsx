'use client';

import {
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useChallengeStore, useSubmissionStore } from '@/store';
import { MOCK_WEEKLY_DATA, CATEGORY_LABELS } from '@/lib/mock-data';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

// Extended mock data for statistics
const MONTHLY_DATA = [
  { name: 'Jan', submissions: 45, approved: 38, participants: 120 },
  { name: 'Feb', submissions: 52, approved: 45, participants: 145 },
  { name: 'Mar', submissions: 68, approved: 58, participants: 180 },
  { name: 'Apr', submissions: 72, approved: 65, participants: 210 },
  { name: 'Mai', submissions: 85, approved: 78, participants: 245 },
  { name: 'Jun', submissions: 99, approved: 87, participants: 287 },
];

export default function StatisticsPage() {
  const { challenges, stats } = useChallengeStore();
  const { submissions } = useSubmissionStore();

  // Category distribution
  const categoryData = Object.entries(
    challenges.reduce((acc, challenge) => {
      acc[challenge.category] = (acc[challenge.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value], index) => ({
    name: CATEGORY_LABELS[name] || name,
    value,
    color: COLORS[index % COLORS.length],
  }));

  // Submission status distribution
  const statusData = [
    {
      name: 'Genehmigt',
      value: submissions.filter((s) => s.status === 'approved').length,
      color: '#10b981',
    },
    {
      name: 'Abgelehnt',
      value: submissions.filter((s) => s.status === 'rejected').length,
      color: '#ef4444',
    },
    {
      name: 'Ausstehend',
      value: submissions.filter((s) => s.status === 'submitted').length,
      color: '#f59e0b',
    },
  ];

  // Duration distribution
  const durationData = [
    { name: '5 Min', value: challenges.filter((c) => c.duration === 5).length },
    { name: '10 Min', value: challenges.filter((c) => c.duration === 10).length },
    { name: '15 Min', value: challenges.filter((c) => c.duration === 15).length },
    { name: '30 Min', value: challenges.filter((c) => c.duration === 30).length },
  ];

  return (
    <div className="flex flex-col">
      <Header
        title="Statistiken"
        description="Analyse deiner Challenge-Performance und Wirkung"
      />

      <div className="p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Gesamte Teilnehmer
              </CardTitle>
              <Users className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalParticipants}</div>
              <div className="flex items-center text-xs text-green-600 mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                +18% zum Vormonat
              </div>
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
              <p className="text-xs text-slate-500 mt-1">
                ≈ 8.6 Arbeitstage gespendet
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Genehmigungsrate
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.approvalRate}%</div>
              <p className="text-xs text-slate-500 mt-1">
                {submissions.filter((s) => s.status === 'approved').length} von{' '}
                {submissions.filter((s) => s.status !== 'submitted').length} Einreichungen
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Aktive Challenges
              </CardTitle>
              <Calendar className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeChallenges}</div>
              <p className="text-xs text-slate-500 mt-1">
                {challenges.filter((c) => c.status === 'draft').length} im Entwurf
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 1 */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Monthly Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Monatlicher Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={MONTHLY_DATA}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="participants"
                      name="Teilnehmer"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="submissions"
                      name="Einreichungen"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={{ fill: '#10b981' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Category Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Challenges nach Kategorie</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} (${(percent * 100).toFixed(0)}%)`
                      }
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Submission Status */}
          <Card>
            <CardHeader>
              <CardTitle>Einreichungsstatus</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Duration Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Zeitaufwand Verteilung</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={durationData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis type="number" stroke="#64748b" fontSize={12} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      stroke="#64748b"
                      fontSize={12}
                    />
                    <Tooltip />
                    <Bar dataKey="value" name="Challenges" fill="#3b82f6" radius={4} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Weekly Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Wochenaktivität</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={MOCK_WEEKLY_DATA}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip />
                    <Bar
                      dataKey="submissions"
                      name="Einreichungen"
                      fill="#3b82f6"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="approved"
                      name="Genehmigt"
                      fill="#10b981"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Performing Challenges */}
        <Card>
          <CardHeader>
            <CardTitle>Top Challenges nach Teilnahme</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {challenges
                .filter((c) => c.status === 'active')
                .sort((a, b) => b.currentParticipants - a.currentParticipants)
                .slice(0, 5)
                .map((challenge, index) => {
                  const progress =
                    (challenge.currentParticipants / challenge.maxParticipants) * 100;

                  return (
                    <div
                      key={challenge.id}
                      className="flex items-center gap-4"
                    >
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-sm font-medium text-slate-600">
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-slate-900">
                            {challenge.title}
                          </span>
                          <span className="text-sm text-slate-500">
                            {challenge.currentParticipants} / {challenge.maxParticipants}
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary-500 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                      <Badge variant="outline">
                        {CATEGORY_LABELS[challenge.category]}
                      </Badge>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
