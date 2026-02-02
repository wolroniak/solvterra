'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  Image as ImageIcon,
  FileText,
  Star,
  User,
  Calendar,
  MessageSquare,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSubmissionStore, useChallengeStore } from '@/store';
import { formatDateTime, formatRelativeTime } from '@/lib/utils';

export default function SubmissionDetailPage() {
  const { t } = useTranslation('submissions');
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const STATUS_CONFIG = {
    submitted: { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50', label: t('status.pending'), variant: 'warning' as const },
    approved: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50', label: t('status.approved'), variant: 'success' as const },
    rejected: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50', label: t('status.rejected'), variant: 'destructive' as const },
  };

  const { submissions, approveSubmission, rejectSubmission } = useSubmissionStore();
  const { challenges } = useChallengeStore();

  const submission = submissions.find((s) => s.id === id);
  const challenge = submission ? challenges.find((c) => c.id === submission.challengeId) : null;

  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  if (!submission) {
    return (
      <div className="flex flex-col">
        <Header
          title={t('detailPage.notFound')}
          description={t('detailPage.notFoundDescription')}
          action={
            <Link href="/submissions">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('detailPage.back')}
              </Button>
            </Link>
          }
        />
        <div className="p-6">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-slate-500">
              <p className="text-lg font-medium">{t('detailPage.notFound')}</p>
              <p className="text-sm">{t('detailPage.notFoundWithId', { id })}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const status = STATUS_CONFIG[submission.status];
  const StatusIcon = status.icon;

  const handleApprove = () => {
    approveSubmission(submission.id, rating, feedback || t('actions.defaultApprovalFeedback'));
    router.push('/submissions');
  };

  const handleReject = () => {
    if (!rejectReason.trim()) {
      alert(t('detailPage.rejectReasonAlert'));
      return;
    }
    rejectSubmission(submission.id, rejectReason);
    router.push('/submissions');
  };

  return (
    <div className="flex flex-col">
      <Header
        title={t('detailPage.reviewTitle')}
        description={`${submission.studentName} · ${submission.challengeTitle}`}
        action={
          <Link href="/submissions">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('detailPage.back')}
            </Button>
          </Link>
        }
      />

      <div className="p-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Proof */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {submission.proofType === 'photo' ? (
                    <>
                      <ImageIcon className="h-5 w-5" />
                      {t('detailPage.photoProof')}
                    </>
                  ) : (
                    <>
                      <FileText className="h-5 w-5" />
                      {t('detailPage.textProof')}
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {submission.proofType === 'photo' ? (
                  <img
                    src={submission.proofUrl}
                    alt={t('detailPage.proofAlt')}
                    className="w-full max-h-[500px] object-contain rounded-lg bg-slate-100"
                  />
                ) : (
                  <div className="p-6 bg-slate-50 rounded-lg">
                    <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                      {submission.proofText}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Challenge Context */}
            {challenge && (
              <Card>
                <CardHeader>
                  <CardTitle>{t('detailPage.challengeDetails')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Link
                    href={`/challenges/${challenge.id}`}
                    className="flex gap-4 p-4 rounded-lg border hover:bg-slate-50 transition-colors"
                  >
                    <img
                      src={challenge.imageUrl}
                      alt={challenge.title}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 mb-1">
                        {challenge.title}
                      </h3>
                      <p className="text-sm text-slate-500 line-clamp-2 mb-2">
                        {challenge.description}
                      </p>
                      <div className="flex gap-4 text-sm text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {challenge.duration} {t('detailPage.minutes')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-amber-500" />
                          {challenge.xpReward} XP
                        </span>
                      </div>
                    </div>
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* Action Section */}
            {submission.status === 'submitted' && (
              <Card>
                <CardHeader>
                  <CardTitle>{t('detailPage.reviewSection')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {!showRejectForm ? (
                    <>
                      {/* Rating */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          {t('detailPage.ratingLabel')}
                        </label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => setRating(star)}
                              className={`text-3xl transition-colors ${
                                star <= rating
                                  ? 'text-amber-400 hover:text-amber-500'
                                  : 'text-slate-200 hover:text-slate-300'
                              }`}
                            >
                              ★
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Feedback */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          {t('detailPage.feedbackLabel')}
                        </label>
                        <textarea
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                          rows={3}
                          placeholder={t('detailPage.feedbackPlaceholder')}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3 pt-2">
                        <Button
                          variant="outline"
                          className="flex-1 text-red-600 hover:bg-red-50"
                          onClick={() => setShowRejectForm(true)}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          {t('actions.reject')}
                        </Button>
                        <Button
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          onClick={handleApprove}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          {t('actions.approve')}
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Reject Form */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          {t('detailPage.rejectReasonLabel')}
                        </label>
                        <textarea
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          rows={4}
                          placeholder={t('detailPage.rejectReasonPlaceholder')}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                      </div>

                      <div className="flex gap-3 pt-2">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => setShowRejectForm(false)}
                        >
                          {t('detailPage.cancel')}
                        </Button>
                        <Button
                          className="flex-1 bg-red-600 hover:bg-red-700"
                          onClick={handleReject}
                          disabled={!rejectReason.trim()}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          {t('detailPage.rejectSubmission')}
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Review Result (if already reviewed) */}
            {submission.status !== 'submitted' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    {t('detailPage.reviewSection')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {submission.rating && (
                    <div>
                      <p className="text-sm text-slate-500 mb-1">{t('detailPage.stars')}</p>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            className={`text-2xl ${
                              star <= submission.rating!
                                ? 'text-amber-400'
                                : 'text-slate-200'
                            }`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {submission.feedback && (
                    <div>
                      <p className="text-sm text-slate-500 mb-1">{t('detailPage.feedback')}</p>
                      <p className="text-slate-700">{submission.feedback}</p>
                    </div>
                  )}
                  {submission.reviewedAt && (
                    <div>
                      <p className="text-sm text-slate-500 mb-1">{t('detailPage.reviewedAt')}</p>
                      <p className="text-slate-700">{formatDateTime(submission.reviewedAt)}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status */}
            <Card>
              <CardHeader>
                <CardTitle>{t('detailPage.statusTitle')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`flex items-center gap-3 p-4 rounded-lg ${status.bg}`}>
                  <StatusIcon className={`h-8 w-8 ${status.color}`} />
                  <div>
                    <p className={`font-semibold ${status.color}`}>{status.label}</p>
                    <p className="text-sm text-slate-500">
                      {formatRelativeTime(submission.submittedAt)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Student Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  {t('detailPage.student')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={submission.studentAvatar} />
                    <AvatarFallback className="text-xl">
                      {submission.studentName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-slate-900">
                      {submission.studentName}
                    </p>
                    <p className="text-sm text-slate-500">{t('detailPage.student')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {t('detailPage.timeline')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary-500 mt-2" />
                    <div>
                      <p className="font-medium text-slate-900">{t('detailPage.submitted')}</p>
                      <p className="text-sm text-slate-500">
                        {formatDateTime(submission.submittedAt)}
                      </p>
                    </div>
                  </div>
                  {submission.reviewedAt && (
                    <div className="flex gap-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        submission.status === 'approved' ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      <div>
                        <p className="font-medium text-slate-900">
                          {submission.status === 'approved' ? t('status.approved') : t('status.rejected')}
                        </p>
                        <p className="text-sm text-slate-500">
                          {formatDateTime(submission.reviewedAt)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* XP Reward */}
            {challenge && (
              <Card className="bg-amber-50 border-amber-200">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <Star className="h-8 w-8 text-amber-500" />
                    <div>
                      <p className="text-2xl font-bold text-amber-700">
                        +{challenge.xpReward} XP
                      </p>
                      <p className="text-sm text-amber-600">
                        {submission.status === 'approved'
                          ? t('detailPage.xpReward.earned')
                          : submission.status === 'rejected'
                          ? t('detailPage.xpReward.notEarned')
                          : t('detailPage.xpReward.onApproval')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
