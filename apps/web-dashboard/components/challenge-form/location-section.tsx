'use client';

import { useTranslation } from 'react-i18next';
import { MapPin, Navigation, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ChallengeLocation } from '@/lib/mock-data';

interface LocationSectionProps {
  location: Partial<ChallengeLocation>;
  onChange: (location: Partial<ChallengeLocation>) => void;
  isOnsite: boolean;
}

export function LocationSection({ location, onChange, isOnsite }: LocationSectionProps) {
  const { t } = useTranslation('challengeForm');

  if (!isOnsite) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary-500" />
          {t('location.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            {t('location.nameLabel')}
          </label>
          <input
            type="text"
            value={location.name || ''}
            onChange={(e) => onChange({ ...location, name: e.target.value })}
            placeholder={t('location.namePlaceholder')}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <p className="text-xs text-slate-500 mt-1">
            {t('location.nameHint')}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            {t('location.addressLabel')}
          </label>
          <input
            type="text"
            value={location.address || ''}
            onChange={(e) => onChange({ ...location, address: e.target.value })}
            placeholder={t('location.addressPlaceholder')}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
            <Navigation className="h-4 w-4" />
            {t('location.meetingPointLabel')}
          </label>
          <input
            type="text"
            value={location.meetingPoint || ''}
            onChange={(e) => onChange({ ...location, meetingPoint: e.target.value })}
            placeholder={t('location.meetingPointPlaceholder')}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <p className="text-xs text-slate-500 mt-1">
            {t('location.meetingPointHint')}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
            <Info className="h-4 w-4" />
            {t('location.additionalInfoLabel')}
          </label>
          <textarea
            value={location.additionalInfo || ''}
            onChange={(e) => onChange({ ...location, additionalInfo: e.target.value })}
            rows={2}
            placeholder={t('location.additionalInfoPlaceholder')}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {t('location.latitudeLabel')}
            </label>
            <input
              type="number"
              step="any"
              value={location.coordinates?.lat || ''}
              onChange={(e) =>
                onChange({
                  ...location,
                  coordinates: {
                    lat: parseFloat(e.target.value) || 0,
                    lng: location.coordinates?.lng || 0,
                  },
                })
              }
              placeholder={t('location.latitudePlaceholder')}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {t('location.longitudeLabel')}
            </label>
            <input
              type="number"
              step="any"
              value={location.coordinates?.lng || ''}
              onChange={(e) =>
                onChange({
                  ...location,
                  coordinates: {
                    lat: location.coordinates?.lat || 0,
                    lng: parseFloat(e.target.value) || 0,
                  },
                })
              }
              placeholder={t('location.longitudePlaceholder')}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
        <p className="text-xs text-slate-500">
          {t('location.coordinatesHint')}
        </p>
      </CardContent>
    </Card>
  );
}
