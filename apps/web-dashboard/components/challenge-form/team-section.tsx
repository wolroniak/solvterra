'use client';

import { Users, UserPlus, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface TeamSectionProps {
  isMultiPerson: boolean;
  minTeamSize: number;
  maxTeamSize: number;
  teamDescription: string;
  allowSoloJoin: boolean;
  onChange: (data: {
    isMultiPerson: boolean;
    minTeamSize: number;
    maxTeamSize: number;
    teamDescription: string;
    allowSoloJoin: boolean;
  }) => void;
}

export function TeamSection({
  isMultiPerson,
  minTeamSize,
  maxTeamSize,
  teamDescription,
  allowSoloJoin,
  onChange,
}: TeamSectionProps) {
  const handleMultiPersonToggle = (enabled: boolean) => {
    onChange({
      isMultiPerson: enabled,
      minTeamSize: enabled ? 2 : 1,
      maxTeamSize: enabled ? 4 : 1,
      teamDescription: enabled ? teamDescription : '',
      allowSoloJoin: enabled ? allowSoloJoin : false,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary-500" />
          Team-Challenge
          {isMultiPerson && (
            <Badge variant="success" className="ml-2">
              Aktiviert
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Toggle */}
        <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
          <input
            type="checkbox"
            id="isMultiPerson"
            checked={isMultiPerson}
            onChange={(e) => handleMultiPersonToggle(e.target.checked)}
            className="mt-1 w-5 h-5 text-primary-600 border-slate-300 rounded focus:ring-primary-500"
          />
          <div>
            <label htmlFor="isMultiPerson" className="text-sm font-medium text-slate-900 cursor-pointer">
              Dies ist eine Team-Challenge
            </label>
            <p className="text-xs text-slate-500 mt-1">
              Teilnehmer müssen ein Team bilden, um diese Challenge zu absolvieren.
              Studien zeigen: 62% würden mehr helfen, wenn sie es mit Freunden tun könnten!
            </p>
          </div>
        </div>

        {isMultiPerson && (
          <>
            {/* Team Size */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Minimale Teamgröße *
                </label>
                <select
                  value={minTeamSize}
                  onChange={(e) =>
                    onChange({
                      isMultiPerson,
                      minTeamSize: parseInt(e.target.value),
                      maxTeamSize: Math.max(parseInt(e.target.value), maxTeamSize),
                      teamDescription,
                      allowSoloJoin,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {[2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      {n} Personen
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Maximale Teamgröße *
                </label>
                <select
                  value={maxTeamSize}
                  onChange={(e) =>
                    onChange({
                      isMultiPerson,
                      minTeamSize,
                      maxTeamSize: parseInt(e.target.value),
                      teamDescription,
                      allowSoloJoin,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {[2, 3, 4, 5, 6, 8, 10].filter((n) => n >= minTeamSize).map((n) => (
                    <option key={n} value={n}>
                      {n} Personen
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Team Description */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Team-Beschreibung
              </label>
              <textarea
                value={teamDescription}
                onChange={(e) =>
                  onChange({
                    isMultiPerson,
                    minTeamSize,
                    maxTeamSize,
                    teamDescription: e.target.value,
                    allowSoloJoin,
                  })
                }
                rows={2}
                placeholder="z.B. Lade Freunde ein oder finde neue Teammitglieder über unsere Matching-Funktion!"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <p className="text-xs text-slate-500 mt-1">
                Motivierender Text, der Teilnehmern erklärt, warum ein Team besser ist
              </p>
            </div>

            {/* Solo Join */}
            <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <input
                type="checkbox"
                id="allowSoloJoin"
                checked={allowSoloJoin}
                onChange={(e) =>
                  onChange({
                    isMultiPerson,
                    minTeamSize,
                    maxTeamSize,
                    teamDescription,
                    allowSoloJoin: e.target.checked,
                  })
                }
                className="mt-1 w-5 h-5 text-blue-600 border-blue-300 rounded focus:ring-blue-500"
              />
              <div>
                <label htmlFor="allowSoloJoin" className="text-sm font-medium text-blue-900 cursor-pointer flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Einzelanmeldung erlauben (Matchmaking)
                </label>
                <p className="text-xs text-blue-700 mt-1">
                  Teilnehmer ohne Team können sich alleine anmelden und werden mit anderen
                  Interessenten verbunden. Das erhöht die Teilnahme deutlich!
                </p>
              </div>
            </div>

            {/* Info Box */}
            <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <Info className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-amber-800">
                <p className="font-medium mb-1">Team-Challenges in der App</p>
                <p>
                  In der mobilen App sehen Teilnehmer eine Liste von Personen, die ebenfalls
                  nach Teammitgliedern suchen. Sie können direkt Kontakt aufnehmen und
                  gemeinsam teilnehmen.
                </p>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
