'use client';

import { useAuthStore } from '@/store';
import { useTranslation } from 'react-i18next';
import { AlertCircle, Clock, XCircle, CheckCircle } from 'lucide-react';

export function VerificationBanner() {
  const { organization } = useAuthStore();
  const { t } = useTranslation('admin');

  if (!organization) return null;

  // Don't show banner for verified organizations
  if (organization.verificationStatus === 'verified') return null;

  if (organization.verificationStatus === 'pending') {
    return (
      <div className="bg-amber-50 border-b border-amber-200">
        <div className="px-6 py-3 flex items-center gap-3">
          <Clock className="w-5 h-5 text-amber-600 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-800">
              {t('verification_banner.pendingTitle')}
            </p>
            <p className="text-xs text-amber-700">
              {t('verification_banner.pendingDescription')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (organization.verificationStatus === 'rejected') {
    return (
      <div className="bg-red-50 border-b border-red-200">
        <div className="px-6 py-3 flex items-center gap-3">
          <XCircle className="w-5 h-5 text-red-600 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800">
              {t('verification_banner.rejectedTitle')}
            </p>
            <p className="text-xs text-red-700">
              {organization.rejectionReason || t('verification_banner.rejectedDefault')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

// Hook to check if organization can publish
export function useCanPublish(): boolean {
  const { organization } = useAuthStore();
  return organization?.verificationStatus === 'verified';
}

// Hook to check if organization can create challenges (not rejected)
export function useCanCreateChallenges(): boolean {
  const { organization } = useAuthStore();
  return organization?.verificationStatus !== 'rejected';
}

// Hook to check if organization is rejected
export function useIsRejected(): boolean {
  const { organization } = useAuthStore();
  return organization?.verificationStatus === 'rejected';
}

// Hook to get verification status info
export function useVerificationStatus() {
  const { organization } = useAuthStore();
  return {
    status: organization?.verificationStatus || 'pending',
    isVerified: organization?.verificationStatus === 'verified',
    isPending: organization?.verificationStatus === 'pending',
    isRejected: organization?.verificationStatus === 'rejected',
    rejectionReason: organization?.rejectionReason,
  };
}

// Component to wrap publish button with tooltip
export function PublishButton({
  onClick,
  disabled,
  children,
  className,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  const canPublish = useCanPublish();
  const { organization } = useAuthStore();
  const { t } = useTranslation('admin');

  const isDisabled = disabled || !canPublish;

  return (
    <div className="relative group">
      <button
        onClick={onClick}
        disabled={isDisabled}
        className={`${className} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {children}
      </button>
      {!canPublish && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
          {organization?.verificationStatus === 'pending'
            ? t('verification_banner.tooltipPending')
            : t('verification_banner.tooltipNotVerified')}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
        </div>
      )}
    </div>
  );
}
