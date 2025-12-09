'use client';

import { User, Mail, Phone, MessageSquare, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ChallengeContact, ContactMethod } from '@/lib/mock-data';

interface ContactSectionProps {
  contact: Partial<ChallengeContact>;
  onChange: (contact: Partial<ChallengeContact>) => void;
}

const CONTACT_METHODS: { value: ContactMethod; label: string; icon: typeof Mail; description: string }[] = [
  {
    value: 'email',
    label: 'E-Mail',
    icon: Mail,
    description: 'Bevorzugt per E-Mail kontaktiert werden',
  },
  {
    value: 'phone',
    label: 'Telefon',
    icon: Phone,
    description: 'Bevorzugt per Telefon kontaktiert werden',
  },
  {
    value: 'app',
    label: 'In-App',
    icon: MessageSquare,
    description: 'Bevorzugt über die SolvTerra App kontaktiert werden',
  },
];

const RESPONSE_TIMES = [
  'Sofort während Öffnungszeiten',
  'Innerhalb von 2 Stunden',
  'Innerhalb von 24 Stunden',
  'Innerhalb von 48 Stunden',
  'Automatische Bestätigung',
];

export function ContactSection({ contact, onChange }: ContactSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-primary-500" />
          Kontaktperson
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-slate-500 mb-4">
          Diese Informationen werden Teilnehmern angezeigt, damit sie bei Fragen Kontakt aufnehmen können.
        </p>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Name *
            </label>
            <input
              type="text"
              value={contact.name || ''}
              onChange={(e) => onChange({ ...contact, name: e.target.value })}
              placeholder="z.B. Max Mustermann"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Rolle / Position
            </label>
            <input
              type="text"
              value={contact.role || ''}
              onChange={(e) => onChange({ ...contact, role: e.target.value })}
              placeholder="z.B. Ehrenamtskoordinator"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              E-Mail
            </label>
            <input
              type="email"
              value={contact.email || ''}
              onChange={(e) => onChange({ ...contact, email: e.target.value })}
              placeholder="kontakt@beispiel.de"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Telefon
            </label>
            <input
              type="tel"
              value={contact.phone || ''}
              onChange={(e) => onChange({ ...contact, phone: e.target.value })}
              placeholder="+49 123 4567890"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Bevorzugte Kontaktmethode *
          </label>
          <div className="flex gap-2">
            {CONTACT_METHODS.map((method) => (
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
                <span className="text-sm font-medium">{method.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
            <Clock className="h-4 w-4" />
            Erwartete Antwortzeit
          </label>
          <select
            value={contact.responseTime || ''}
            onChange={(e) => onChange({ ...contact, responseTime: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Bitte auswählen...</option>
            {RESPONSE_TIMES.map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
          <p className="text-xs text-slate-500 mt-1">
            Hilft Teilnehmern, realistische Erwartungen zu haben
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
