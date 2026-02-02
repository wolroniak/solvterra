'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabase';
import { AdminHeader } from '@/components/admin/admin-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Building2,
  Users,
  Trophy,
  CheckCircle,
  Clock,
  XCircle,
  TrendingUp,
  Award,
} from 'lucide-react';

interface DashboardStats {
  totalOrganizations: number;
  verifiedOrganizations: number;
  pendingOrganizations: number;
  rejectedOrganizations: number;
  totalChallenges: number;
  activeChallenges: number;
  totalSubmissions: number;
  totalUsers: number;
}

function StatCardSkeleton() {
  return (
    <Card className="border-slate-700 bg-slate-800">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <Skeleton className="h-4 w-24 bg-slate-700" />
        <Skeleton className="h-5 w-5 rounded bg-slate-700" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16 bg-slate-700" />
        <Skeleton className="h-3 w-32 mt-2 bg-slate-700" />
      </CardContent>
    </Card>
  );
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  iconColor = 'text-indigo-400',
}: {
  title: string;
  value: number | string;
  description?: string;
  icon: React.ElementType;
  iconColor?: string;
}) {
  return (
    <Card className="border-slate-700 bg-slate-800">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-slate-400">{title}</CardTitle>
        <Icon className={`h-5 w-5 ${iconColor}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-white">{value}</div>
        {description && (
          <p className="text-xs text-slate-500 mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation('admin');

  useEffect(() => {
    async function loadStats() {
      setLoading(true);

      try {
        // Load organization counts by verification status
        const { data: orgs, error: orgsError } = await supabase
          .from('organizations')
          .select('verification_status');

        if (orgsError) throw orgsError;

        const orgCounts = {
          total: orgs?.length || 0,
          verified: orgs?.filter((o) => o.verification_status === 'verified').length || 0,
          pending: orgs?.filter((o) => o.verification_status === 'pending').length || 0,
          rejected: orgs?.filter((o) => o.verification_status === 'rejected').length || 0,
        };

        // Load challenge counts
        const { data: challenges, error: challengesError } = await supabase
          .from('challenges')
          .select('status');

        if (challengesError) throw challengesError;

        const challengeCounts = {
          total: challenges?.length || 0,
          active: challenges?.filter((c) => c.status === 'active').length || 0,
        };

        // Load submission count
        const { count: submissionCount, error: submissionsError } = await supabase
          .from('submissions')
          .select('*', { count: 'exact', head: true });

        if (submissionsError) throw submissionsError;

        // Load user count (from profiles table)
        const { count: userCount, error: usersError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        if (usersError) throw usersError;

        setStats({
          totalOrganizations: orgCounts.total,
          verifiedOrganizations: orgCounts.verified,
          pendingOrganizations: orgCounts.pending,
          rejectedOrganizations: orgCounts.rejected,
          totalChallenges: challengeCounts.total,
          activeChallenges: challengeCounts.active,
          totalSubmissions: submissionCount || 0,
          totalUsers: userCount || 0,
        });
      } catch (error) {
        console.error('Failed to load dashboard stats:', error);
        // Set empty stats on error
        setStats({
          totalOrganizations: 0,
          verifiedOrganizations: 0,
          pendingOrganizations: 0,
          rejectedOrganizations: 0,
          totalChallenges: 0,
          activeChallenges: 0,
          totalSubmissions: 0,
          totalUsers: 0,
        });
      }

      setLoading(false);
    }

    loadStats();
  }, []);

  const pendingCount = stats?.pendingOrganizations || 0;

  return (
    <div className="flex flex-col">
      <AdminHeader
        title={t('dashboard.title')}
        description={t('dashboard.description')}
      />

      <div className="p-6 space-y-6">
        {/* Organizations Section */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">{t('dashboard.organizations')}</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {loading ? (
              <>
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
              </>
            ) : (
              <>
                <StatCard
                  title={t('dashboard.stats.total')}
                  value={stats?.totalOrganizations || 0}
                  description={t('dashboard.stats.registeredNgos')}
                  icon={Building2}
                  iconColor="text-indigo-400"
                />
                <StatCard
                  title={t('dashboard.stats.verified')}
                  value={stats?.verifiedOrganizations || 0}
                  description={t('dashboard.stats.activeNgos')}
                  icon={CheckCircle}
                  iconColor="text-green-400"
                />
                <StatCard
                  title={t('dashboard.stats.pending')}
                  value={stats?.pendingOrganizations || 0}
                  description={t('dashboard.stats.awaitingReview')}
                  icon={Clock}
                  iconColor="text-amber-400"
                />
                <StatCard
                  title={t('dashboard.stats.rejected')}
                  value={stats?.rejectedOrganizations || 0}
                  description={t('dashboard.stats.notApproved')}
                  icon={XCircle}
                  iconColor="text-red-400"
                />
              </>
            )}
          </div>
        </div>

        {/* Activity Section */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">{t('dashboard.activity')}</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {loading ? (
              <>
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
              </>
            ) : (
              <>
                <StatCard
                  title={t('dashboard.stats.challenges')}
                  value={stats?.totalChallenges || 0}
                  description={t('dashboard.stats.createdTasks')}
                  icon={Trophy}
                  iconColor="text-purple-400"
                />
                <StatCard
                  title={t('dashboard.stats.activeChallenges')}
                  value={stats?.activeChallenges || 0}
                  description={t('dashboard.stats.currentlyAvailable')}
                  icon={TrendingUp}
                  iconColor="text-teal-400"
                />
                <StatCard
                  title={t('dashboard.stats.submissions')}
                  value={stats?.totalSubmissions || 0}
                  description={t('dashboard.stats.processedTasks')}
                  icon={Award}
                  iconColor="text-orange-400"
                />
                <StatCard
                  title={t('dashboard.stats.users')}
                  value={stats?.totalUsers || 0}
                  description={t('dashboard.stats.registeredStudents')}
                  icon={Users}
                  iconColor="text-cyan-400"
                />
              </>
            )}
          </div>
        </div>

        {/* Quick Actions or Info */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">{t('dashboard.quickAccess')}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-slate-700 bg-slate-800">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-amber-500/20 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">
                      {t(pendingCount !== 1 ? 'dashboard.pendingVerifications_plural' : 'dashboard.pendingVerifications', { count: pendingCount })}
                    </h3>
                    <p className="text-sm text-slate-400">
                      {t('dashboard.newOrgsAwaitingReview')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-700 bg-slate-800">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{t('dashboard.platformStatus')}</h3>
                    <p className="text-sm text-slate-400">
                      {t('dashboard.allSystemsNormal')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
