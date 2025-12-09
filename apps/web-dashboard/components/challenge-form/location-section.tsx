'use client';

import { MapPin, Navigation, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ChallengeLocation } from '@/lib/mock-data';

interface LocationSectionProps {
  location: Partial<ChallengeLocation>;
  onChange: (location: Partial<ChallengeLocation>) => void;
  isOnsite: boolean;
}

export function LocationSection({ location, onChange, isOnsite }: LocationSectionProps) {
  if (!isOnsite) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary-500" />
          Ort & Treffpunkt
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Ortsname *
          </label>
          <input
            type="text"
            value={location.name || ''}
            onChange={(e) => onChange({ ...location, name: e.target.value })}
            placeholder="z.B. Stadtpark Frankfurt, Tierheim Darmstadt"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <p className="text-xs text-slate-500 mt-1">
            Der Name wird den Teilnehmern prominent angezeigt
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Vollständige Adresse
          </label>
          <input
            type="text"
            value={location.address || ''}
            onChange={(e) => onChange({ ...location, address: e.target.value })}
            placeholder="z.B. Musterstraße 123, 60123 Frankfurt am Main"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
            <Navigation className="h-4 w-4" />
            Treffpunkt
          </label>
          <input
            type="text"
            value={location.meetingPoint || ''}
            onChange={(e) => onChange({ ...location, meetingPoint: e.target.value })}
            placeholder="z.B. Am Haupteingang, Parkplatz B, Hintereingang"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <p className="text-xs text-slate-500 mt-1">
            Präzise Angabe, wo sich die Teilnehmer treffen sollen
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
            <Info className="h-4 w-4" />
            Zusätzliche Informationen
          </label>
          <textarea
            value={location.additionalInfo || ''}
            onChange={(e) => onChange({ ...location, additionalInfo: e.target.value })}
            rows={2}
            placeholder="z.B. Parkplätze vorhanden, bequeme Kleidung tragen, Ausrüstung wird gestellt"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Breitengrad (optional)
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
              placeholder="z.B. 50.1109"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Längengrad (optional)
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
              placeholder="z.B. 8.6821"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
        <p className="text-xs text-slate-500">
          GPS-Koordinaten ermöglichen die Kartenanzeige in der App
        </p>
      </CardContent>
    </Card>
  );
}
