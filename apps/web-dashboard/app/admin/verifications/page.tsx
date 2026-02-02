'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabase';
import { AdminHeader } from '@/components/admin/admin-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  CheckCircle,
  XCircle,
  Building2,
  Mail,
  Globe,
  Calendar,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { CATEGORY_LABELS } from '@/lib/mock-data';
import { formatDate } from '@/lib/utils';
import { useNotificationStore } from '@/components/ui/toast-notifications';

interface PendingOrganization {
  id: string;
  name: string;
  description: string | null;
  mission: string | null;
  logo: string | null;
  website: string | null;
  contact_email: string | null;
  category: string;
  verification_status: 'pending' | 'verified' | 'rejected';
  created_at: string;
}

function VerificationsSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="border-slate-700 bg-slate-800">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded-lg bg-slate-700" />
                  <div>
                    <Skeleton className="h-5 w-48 bg-slate-700" />
                    <Skeleton className="h-4 w-24 mt-1 bg-slate-700" />
                  </div>
                </div>
                <Skeleton className="h-4 w-full max-w-md bg-slate-700" />
                <div className="flex gap-4">
                  <Skeleton className="h-4 w-32 bg-slate-700" />
                  <Skeleton className="h-4 w-40 bg-slate-700" />
                </div>
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-9 w-28 bg-slate-700" />
                <Skeleton className="h-9 w-28 bg-slate-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function AdminVerificationsPage() {
  const [organizations, setOrganizations] = useState<PendingOrganization[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<PendingOrganization | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const addNotification = useNotificationStore((s) => s.addNotification);
  const { t } = useTranslation('admin');

  const loadPendingOrganizations = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('verification_status', 'pending')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Failed to load pending organizations:', error);
      addNotification({
        title: t('verifications.notifications.loadErrorTitle'),
        description: t('verifications.notifications.loadError'),
        type: 'error',
      });
    } else {
      setOrganizations(data || []);
    }
    setLoading(false);
  }, [addNotification, t]);

  useEffect(() => {
    loadPendingOrganizations();
  }, [loadPendingOrganizations]);

  const handleVerify = async (org: PendingOrganization) => {
    setActionLoading(org.id);

    const { error } = await supabase.rpc('verify_organization', {
      p_org_id: org.id,
    });

    if (error) {
      console.error('Failed to verify organization:', error);
      addNotification({
        title: t('verifications.notifications.errorTitle'),
        description: t('verifications.notifications.verifyError'),
        type: 'error',
      });
    } else {
      addNotification({
        title: t('verifications.notifications.verifySuccess'),
        description: t('verifications.notifications.verifySuccessDescription', { name: org.name }),
        type: 'success',
      });
      setOrganizations((prev) => prev.filter((o) => o.id !== org.id));
    }

    setActionLoading(null);
  };

  const openRejectDialog = (org: PendingOrganization) => {
    setSelectedOrg(org);
    setRejectReason('');
    setRejectDialogOpen(true);
  };

  const handleReject = async () => {
    if (!selectedOrg || !rejectReason.trim()) return;

    setActionLoading(selectedOrg.id);

    const { error } = await supabase.rpc('reject_organization', {
      p_org_id: selectedOrg.id,
      p_reason: rejectReason.trim(),
    });

    if (error) {
      console.error('Failed to reject organization:', error);
      addNotification({
        title: t('verifications.notifications.errorTitle'),
        description: t('verifications.notifications.rejectError'),
        type: 'error',
      });
    } else {
      addNotification({
        title: t('verifications.notifications.rejectSuccess'),
        description: t('verifications.notifications.rejectSuccessDescription', { name: selectedOrg.name }),
        type: 'info',
      });
      setOrganizations((prev) => prev.filter((o) => o.id !== selectedOrg.id));
    }

    setActionLoading(null);
    setRejectDialogOpen(false);
    setSelectedOrg(null);
    setRejectReason('');
  };

  return (
    <div className="flex flex-col">
      <AdminHeader
        title={t('verifications.title')}
        description={t('verifications.description')}
        action={
          <Button
            variant="outline"
            onClick={loadPendingOrganizations}
            disabled={loading}
            className="border-slate-600 bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {t('verifications.refresh')}
          </Button>
        }
      />

      <div className="p-6 space-y-6">
        {loading ? (
          <VerificationsSkeleton />
        ) : organizations.length === 0 ? (
          <Card className="border-slate-700 bg-slate-800">
            <CardContent className="flex flex-col items-center justify-center py-12 text-slate-400">
              <CheckCircle className="h-12 w-12 mb-4 text-green-500" />
              <p className="text-lg font-medium text-white">{t('verifications.noPending')}</p>
              <p className="text-sm">{t('verifications.allReviewed')}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <AlertCircle className="h-4 w-4" />
              <span>{t(organizations.length === 1 ? 'verifications.waitingCount_one' : 'verifications.waitingCount_other', { count: organizations.length })}</span>
            </div>

            {organizations.map((org) => (
              <Card key={org.id} className="border-slate-700 bg-slate-800">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-4 mb-3">
                        {org.logo ? (
                          <img
                            src={org.logo}
                            alt={org.name}
                            className="h-12 w-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-lg bg-slate-700 flex items-center justify-center">
                            <Building2 className="h-6 w-6 text-slate-400" />
                          </div>
                        )}
                        <div>
                          <h3 className="font-semibold text-white">{org.name}</h3>
                          <Badge variant="outline" className="border-slate-600 text-slate-300">
                            {CATEGORY_LABELS[org.category] || org.category}
                          </Badge>
                        </div>
                      </div>

                      {org.description && (
                        <p className="text-sm text-slate-300 mb-3 line-clamp-2">
                          {org.description}
                        </p>
                      )}

                      {org.mission && (
                        <p className="text-sm text-slate-500 mb-3 italic">
                          "{org.mission}"
                        </p>
                      )}

                      <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                        {org.contact_email && (
                          <div className="flex items-center gap-1.5">
                            <Mail className="h-4 w-4" />
                            <a
                              href={`mailto:${org.contact_email}`}
                              className="hover:text-indigo-400 hover:underline"
                            >
                              {org.contact_email}
                            </a>
                          </div>
                        )}
                        {org.website && (
                          <div className="flex items-center gap-1.5">
                            <Globe className="h-4 w-4" />
                            <a
                              href={org.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-indigo-400 hover:underline"
                            >
                              {org.website.replace(/^https?:\/\//, '')}
                            </a>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-4 w-4" />
                          <span>{t('verifications.registeredOn', { date: formatDate(new Date(org.created_at)) })}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 shrink-0">
                      <Button
                        variant="outline"
                        className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                        onClick={() => openRejectDialog(org)}
                        disabled={actionLoading === org.id}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        {t('verifications.reject')}
                      </Button>
                      <Button
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleVerify(org)}
                        disabled={actionLoading === org.id}
                      >
                        {actionLoading === org.id ? (
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <CheckCircle className="h-4 w-4 mr-2" />
                        )}
                        {t('verifications.verify')}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent
          onClose={() => setRejectDialogOpen(false)}
          className="bg-slate-800 border border-slate-700"
        >
          <DialogHeader>
            <DialogTitle className="text-white">{t('verifications.rejectDialog.title')}</DialogTitle>
            <DialogDescription className="text-slate-400">
              {t('verifications.rejectDialog.description')}
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-slate-700 rounded-lg">
                {selectedOrg?.logo ? (
                  <img
                    src={selectedOrg.logo}
                    alt={selectedOrg.name}
                    className="h-10 w-10 rounded-lg object-cover"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-lg bg-slate-600 flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-slate-400" />
                  </div>
                )}
                <div>
                  <p className="font-medium text-white">{selectedOrg?.name}</p>
                  <p className="text-sm text-slate-400">{selectedOrg?.contact_email}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {t('verifications.rejectDialog.reasonLabel')}
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder={t('verifications.rejectDialog.reasonPlaceholder')}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  rows={4}
                />
                <p className="text-xs text-slate-500 mt-1">
                  {t('verifications.rejectDialog.reasonHint')}
                </p>
              </div>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectDialogOpen(false)}
              className="border-slate-600 bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white"
            >
              {t('verifications.rejectDialog.cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectReason.trim() || actionLoading === selectedOrg?.id}
            >
              {actionLoading === selectedOrg?.id ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <XCircle className="h-4 w-4 mr-2" />
              )}
              {t('verifications.rejectDialog.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
