'use client';

import { useTranslation } from 'react-i18next';
import { User, Mail, Phone, MessageSquare, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ChallengeContact, ContactMethod } from '@/lib/mock-data';

interface ContactSectionProps {
  contact: Partial<ChallengeContact>;
  onChange: (contact: Partial<ChallengeContact>) => void;
}

const CONTACT_METHOD_CONFIGS: { value: ContactMethod; icon: typeof Mail; translationKey: string }[] = [
  { value: 'email', icon: Mail, translationKey: 'email' },
  { value: 'phone', icon: Phone, translationKey: 'phone' },
  { value: 'app', icon: MessageSquare, translationKey: 'app' },
];

const RESPONSE_TIME_KEYS = [
  'immediate',
  'twoHours',
  'oneDay',
  'twoDays',
  'automatic',
] as const;

export function ContactSection({ contact, onChange }: ContactSectionProps) {
  const { t } = useTranslation('challengeForm');
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-primary-500" />
          {t('contact.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-slate-500 mb-4">
          {t('contact.description')}
        </p>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {t('contact.nameLabel')}
            </label>
            <input
              type="text"
              value={contact.name || ''}
              onChange={(e) => onChange({ ...contact, name: e.target.value })}
              placeholder={t('contact.namePlaceholder')}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {t('contact.roleLabel')}
            </label>
            <input
              type="text"
              value={contact.role || ''}
              onChange={(e) => onChange({ ...contact, role: e.target.value })}
              placeholder={t('contact.rolePlaceholder')}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {t('contact.emailLabel')}
            </label>
            <input
              type="email"
              value={contact.email || ''}
              onChange={(e) => onChange({ ...contact, email: e.target.value })}
              placeholder={t('contact.emailPlaceholder')}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {t('contact.phoneLabel')}
            </label>
            <input
              type="tel"
              value={contact.phone || ''}
              onChange={(e) => onChange({ ...contact, phone: e.target.value })}
              placeholder={t('contact.phonePlaceholder')}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            {t('contact.preferredMethodLabel')}
          </label>
          <div className="flex gap-2">
            {CONTACT_METHOD_CONFIGS.map((method) => (
              <button
                key={method.value}
                type="button"
                onClick={() => onChange({ ...contact, preferredMethod: method.value })}
                className={`flex-1 flex items-center justify-center gap-2 p-3 border rounded-lg transition-colors ${
                  contact.preferredMethod === method.value
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'hover:border-slate-300'
                }`}
              >
                <method.icon className="h-4 w-4" />
                <span className="text-sm font-medium">{t(`contact.methods.${method.translationKey}.label`)}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {t('contact.responseTimeLabel')}
          </label>
          <select
            value={contact.responseTime || ''}
            onChange={(e) => onChange({ ...contact, responseTime: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">{t('contact.responseTimePlaceholder')}</option>
            {RESPONSE_TIME_KEYS.map((key) => (
              <option key={key} value={t(`contact.responseTimes.${key}`)}>
                {t(`contact.responseTimes.${key}`)}
              </option>
            ))}
          </select>
          <p className="text-xs text-slate-500 mt-1">
            {t('contact.responseTimeHint')}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
