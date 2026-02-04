'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle,
  XCircle,
  Clock,
  Image as ImageIcon,
  FileText,
  ChevronRight,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Header } from '@/components/layout/header';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSubmissionStore } from '@/store';
import { formatRelativeTime } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

function SubmissionsSkeleton() {
  return (
    <div className="p-6 space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-4 w-56" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function SubmissionsPage() {
  const { t } = useTranslation('submissions');
  const { submissions, loading } = useSubmissionStore();
  const [activeTab, setActiveTab] = useState('submitted');

  const STATUS_CONFIG = {
    submitted: { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50', label: t('status.pending') },
    approved: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50', label: t('status.approved') },
    rejected: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50', label: t('status.rejected') },
  };

  const filteredSubmissions = submissions.filter((s) => s.status === activeTab);

  const counts = {
    submitted: submissions.filter((s) => s.status === 'submitted').length,
    approved: submissions.filter((s) => s.status === 'approved').length,
    rejected: submissions.filter((s) => s.status === 'rejected').length,
  };

  if (loading) {
    return (
      <div className="flex flex-col">
        <Header
          title={t('page.title')}
          description={t('page.description')}
        />
        <SubmissionsSkeleton />
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <Header
        title={t('page.title')}
        description={t('page.description')}
      />

      <div className="p-6">
        <div className="max-w-4xl space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="submitted" className="gap-2">
                <Clock className="h-4 w-4" />
                {t('tabs.pending', { count: counts.submitted })}
              </TabsTrigger>
              <TabsTrigger value="approved" className="gap-2">
                <CheckCircle className="h-4 w-4" />
                {t('tabs.approved', { count: counts.approved })}
              </TabsTrigger>
              <TabsTrigger value="rejected" className="gap-2">
                <XCircle className="h-4 w-4" />
                {t('tabs.rejected', { count: counts.rejected })}
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Card>
            <CardContent className="p-0">
              {filteredSubmissions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                  {activeTab === 'submitted' ? (
                    <>
                      <CheckCircle className="h-12 w-12 mb-4 text-green-500" />
                      <p className="text-lg font-medium">{t('empty.allDone')}</p>
                      <p className="text-sm">{t('empty.noPending')}</p>
                    </>
                  ) : (
                    <>
                      <FileText className="h-12 w-12 mb-4 text-slate-300" />
                      <p className="text-lg font-medium">{t('empty.noSubmissions')}</p>
                      <p className="text-sm">{t('empty.noSubmissionsInCategory')}</p>
                    </>
                  )}
                </div>
              ) : (
                <div className="divide-y">
                  {filteredSubmissions.map((submission) => {
                    const status = STATUS_CONFIG[submission.status];
                    const StatusIcon = status.icon;

                    return (
                      <Link
                        key={submission.id}
                        href={`/submissions/${submission.id}`}
                        className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors"
                      >
                        <Avatar>
                          <AvatarImage src={submission.studentAvatar} />
                          <AvatarFallback>
                            {submission.studentName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-slate-900 truncate">
                              {submission.studentName}
                            </p>
                            <Badge
                              variant="outline"
                              className={`${status.bg} ${status.color} border-0`}
                            >
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {status.label}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-500 truncate">
                            {submission.challengeTitle}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 text-slate-400">
                          {submission.proofType === 'photo' ? (
                            <ImageIcon className="h-4 w-4" />
                          ) : (
                            <FileText className="h-4 w-4" />
                          )}
                          <span className="text-xs">
                            {formatRelativeTime(submission.submittedAt)}
                          </span>
                          <ChevronRight className="h-5 w-5" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
