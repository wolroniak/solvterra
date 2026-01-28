'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useChallengeStore, useSubmissionStore, useAuthStore } from '@/store';
import { useNotificationStore } from '@/components/ui/toast-notifications';

interface SubmissionPayload {
  challenge_id?: string;
  user_id?: string;
  status?: string;
  xp_earned?: number;
}

interface OrganizationPayload {
  id?: string;
  verification_status?: 'pending' | 'verified' | 'rejected';
  rejection_reason?: string | null;
}

async function getStudentName(userId: string): Promise<string> {
  const { data } = await supabase
    .from('users')
    .select('name')
    .eq('id', userId)
    .single();
  return data?.name || 'Ein Student';
}

function getChallengeTitle(challengeId: string): string {
  const challenges = useChallengeStore.getState().challenges;
  return challenges.find(c => c.id === challengeId)?.title || 'eine Aufgabe';
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const loadChallenges = useChallengeStore((s) => s.loadChallenges);
  const loadSubmissions = useSubmissionStore((s) => s.loadSubmissions);
  const addNotification = useNotificationStore((s) => s.addNotification);
  const { isAuthenticated, isLoading, checkSession, organizationId, refreshOrganization } = useAuthStore();
  const initialLoadDone = useRef(false);

  // Check auth session on mount
  useEffect(() => {
    checkSession();
  }, [checkSession]);

  // Redirect based on auth state
  useEffect(() => {
    if (isLoading) return;

    const isPublicPage = pathname === '/login' || pathname === '/register';
    const isAdminPage = pathname.startsWith('/admin');

    // Don't redirect if on admin pages (admin has its own auth handling)
    if (isAdminPage) return;

    if (!isAuthenticated && !isPublicPage) {
      router.push('/login');
    }
    // Note: Don't auto-redirect from login page here - let the login handler decide
    // where to redirect based on user type (admin vs NGO)
  }, [isAuthenticated, isLoading, pathname, router]);

  // Load data when organization is available (after auth session is established)
  useEffect(() => {
    if (!organizationId) return;
    loadChallenges();
    loadSubmissions().then(() => {
      initialLoadDone.current = true;
    });
  }, [organizationId, loadChallenges, loadSubmissions]);

  // Real-time subscriptions with notifications
  useEffect(() => {
    const submissionChannel = supabase
      .channel('dashboard-submissions')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'submissions',
      }, async (payload) => {
        loadSubmissions();
        if (initialLoadDone.current) {
          const sub = payload.new as SubmissionPayload;
          const studentName = sub.user_id ? await getStudentName(sub.user_id) : 'Ein Student';
          const challengeTitle = sub.challenge_id ? getChallengeTitle(sub.challenge_id) : 'eine Aufgabe';
          addNotification({
            title: `${studentName} nimmt teil`,
            description: `Neue Teilnahme an "${challengeTitle}"`,
            type: 'info',
          });
        }
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'submissions',
      }, async (payload) => {
        loadSubmissions();
        const sub = payload.new as SubmissionPayload;
        if (initialLoadDone.current && sub.status === 'submitted') {
          const studentName = sub.user_id ? await getStudentName(sub.user_id) : 'Ein Student';
          const challengeTitle = sub.challenge_id ? getChallengeTitle(sub.challenge_id) : 'eine Aufgabe';
          addNotification({
            title: `Beweis von ${studentName}`,
            description: `Nachweis für "${challengeTitle}" eingereicht`,
            type: 'info',
          });
        }
      })
      .subscribe();

    const challengeChannel = supabase
      .channel('dashboard-challenges')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'challenges',
      }, (payload) => {
        const oldParticipants = (payload.old as { current_participants?: number })?.current_participants ?? 0;
        const newParticipants = (payload.new as { current_participants?: number })?.current_participants ?? 0;
        const challengeTitle = (payload.new as { title?: string })?.title || 'eine Aufgabe';

        loadChallenges();

        if (initialLoadDone.current && newParticipants > oldParticipants) {
          addNotification({
            title: 'Neuer Teilnehmer',
            description: `Jemand hat "${challengeTitle}" angenommen`,
            type: 'success',
          });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(submissionChannel);
      supabase.removeChannel(challengeChannel);
    };
  }, [loadChallenges, loadSubmissions, addNotification]);

  // Real-time subscription for organization verification status
  useEffect(() => {
    if (!organizationId) return;

    const orgChannel = supabase
      .channel(`org-status-${organizationId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'organizations',
        filter: `id=eq.${organizationId}`,
      }, (payload) => {
        const org = payload.new as OrganizationPayload;
        const oldOrg = payload.old as OrganizationPayload;

        // Only notify if verification_status changed
        if (org.verification_status && org.verification_status !== oldOrg.verification_status) {
          refreshOrganization();

          if (org.verification_status === 'verified') {
            addNotification({
              title: 'Verifizierung erfolgreich!',
              description: 'Deine Organisation wurde verifiziert. Du kannst jetzt Challenges veroeffentlichen.',
              type: 'success',
            });
          } else if (org.verification_status === 'rejected') {
            addNotification({
              title: 'Verifizierung abgelehnt',
              description: org.rejection_reason || 'Bitte kontaktiere uns fuer weitere Informationen.',
              type: 'error',
            });
          }
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(orgChannel);
    };
  }, [organizationId, refreshOrganization, addNotification]);

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
}
