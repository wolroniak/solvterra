'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Image as ImageIcon,
  FileText,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSubmissionStore } from '@/store';
import { formatRelativeTime, formatDateTime } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { useIsRejected } from '@/components/verification-banner';

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
  const { submissions, loading, pendingCount, approveSubmission, rejectSubmission } = useSubmissionStore();
  const [activeTab, setActiveTab] = useState('submitted');
  const [selectedSubmission, setSelectedSubmission] = useState<string | null>(null);
  const isRejected = useIsRejected();

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

  const handleApprove = (id: string) => {
    approveSubmission(id, 5, t('actions.defaultApprovalFeedback'));
    setSelectedSubmission(null);
  };

  const handleReject = (id: string) => {
    rejectSubmission(id, t('actions.defaultRejectionFeedback'));
    setSelectedSubmission(null);
  };

  const selected = submissions.find((s) => s.id === selectedSubmission);

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
        <div className="flex gap-6">
          {/* Submission List */}
          <div className="flex-1 space-y-4">
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
                        <button
                          key={submission.id}
                          onClick={() => setSelectedSubmission(submission.id)}
                          className={`w-full flex items-center gap-4 p-4 text-left hover:bg-slate-50 transition-colors ${
                            selectedSubmission === submission.id ? 'bg-primary-50' : ''
                          }`}
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
                          <div className="flex items-center gap-2 text-slate-400">
                            {submission.proofType === 'photo' ? (
                              <ImageIcon className="h-4 w-4" />
                            ) : (
                              <FileText className="h-4 w-4" />
                            )}
                            <span className="text-xs">
                              {formatRelativeTime(submission.submittedAt)}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Detail Panel */}
          <div className="w-96">
            {selected ? (
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle className="text-lg">{t('detail.title')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Student Info */}
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={selected.studentAvatar} />
                      <AvatarFallback>{selected.studentName[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-slate-900">
                        {selected.studentName}
                      </p>
                      <p className="text-sm text-slate-500">
                        {formatDateTime(selected.submittedAt)}
                      </p>
                    </div>
                  </div>

                  {/* Challenge Info */}
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-sm font-medium text-slate-900">
                      {selected.challengeTitle}
                    </p>
                  </div>

                  {/* Proof */}
                  <div>
                    <p className="text-sm font-medium text-slate-700 mb-2">
                      {t('detail.proof')}
                    </p>
                    {selected.proofType === 'photo' ? (
                      <img
                        src={selected.proofUrl}
                        alt="Proof"
                        className="w-full aspect-video object-cover rounded-lg"
                      />
                    ) : (
                      <div className="p-4 bg-slate-50 rounded-lg">
                        <p className="text-sm text-slate-700 whitespace-pre-wrap">
                          {selected.proofText}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  {selected.status === 'submitted' && (
                    <div className="space-y-3 pt-4">
                      {isRejected && (
                        <p className="text-xs text-red-600 bg-red-50 p-2 rounded">
                          {t('detail.rejectedWarning')}
                        </p>
                      )}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="flex-1 text-red-600 hover:bg-red-50"
                          onClick={() => handleReject(selected.id)}
                          disabled={isRejected}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          {t('actions.reject')}
                        </Button>
                        <Button
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          onClick={() => handleApprove(selected.id)}
                          disabled={isRejected}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          {t('actions.approve')}
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Review Info */}
                  {selected.status !== 'submitted' && (
                    <div className="pt-4 border-t">
                      <p className="text-sm font-medium text-slate-700 mb-2">
                        {t('detail.review')}
                      </p>
                      {selected.rating && (
                        <div className="flex gap-1 mb-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              className={
                                star <= selected.rating!
                                  ? 'text-amber-400'
                                  : 'text-slate-200'
                              }
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      )}
                      {selected.feedback && (
                        <p className="text-sm text-slate-600">
                          {selected.feedback}
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-slate-500">
                  <FileText className="h-12 w-12 mb-4 text-slate-300" />
                  <p className="text-sm">
                    {t('empty.selectSubmission')}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
