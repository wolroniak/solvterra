'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  Send,
  Clock,
  Star,
  Users,
  Camera,
  FileText,
  UserCheck,
  MapPin,
  Laptop,
} from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useChallengeStore } from '@/store';
import {
  CATEGORY_LABELS,
  type ChallengeLocation,
  type ChallengeSchedule,
  type ChallengeContact,
} from '@/lib/mock-data';
import {
  LocationSection,
  ScheduleSection,
  ContactSection,
  TeamSection,
  TagsSection,
} from '@/components/challenge-form';

const CATEGORIES = [
  { value: 'environment', label: 'Umwelt', icon: '🌱' },
  { value: 'social', label: 'Soziales', icon: '❤️' },
  { value: 'education', label: 'Bildung', icon: '📚' },
  { value: 'health', label: 'Gesundheit', icon: '🏥' },
  { value: 'animals', label: 'Tierschutz', icon: '🐾' },
  { value: 'culture', label: 'Kultur', icon: '🎨' },
];

const DURATIONS = [
  { value: 5, label: '5 Min', description: '10 XP' },
  { value: 10, label: '10 Min', description: '20 XP' },
  { value: 15, label: '15 Min', description: '25 XP' },
  { value: 30, label: '30 Min', description: '50 XP' },
];

const VERIFICATION_METHODS = [
  { value: 'photo', label: 'Foto hochladen', icon: Camera, description: 'Studenten laden ein Foto als Beweis hoch' },
  { value: 'text', label: 'Text einreichen', icon: FileText, description: 'Studenten beschreiben ihre Aktivität' },
  { value: 'ngo_confirmation', label: 'NGO Bestätigung', icon: UserCheck, description: 'Du bestätigst die Teilnahme manuell' },
];

const TEMPLATES = [
  {
    id: 'social-media',
    name: 'Social Media Post',
    description: 'Studenten teilen einen informativen Beitrag',
    category: 'environment',
    type: 'digital',
    duration: 15,
    verificationMethod: 'photo',
    instructions: '1. Wähle ein passendes Thema\n2. Erstelle einen informativen Beitrag\n3. Teile ihn auf Social Media\n4. Mache einen Screenshot',
    tags: ['social-media', 'digital', 'awareness'],
  },
  {
    id: 'research',
    name: 'Kurze Recherche',
    description: 'Studenten recherchieren ein Thema und fassen zusammen',
    category: 'education',
    type: 'digital',
    duration: 15,
    verificationMethod: 'text',
    instructions: '1. Recherchiere zum Thema\n2. Sammle wichtige Informationen\n3. Fasse in 200+ Wörtern zusammen',
    tags: ['recherche', 'digital', 'bildung'],
  },
  {
    id: 'cleanup',
    name: 'Aufräumaktion',
    description: 'Müllsammeln oder Aufräumen in der Umgebung',
    category: 'environment',
    type: 'onsite',
    duration: 30,
    verificationMethod: 'photo',
    instructions: '1. Bringe Handschuhe und Müllbeutel mit\n2. Sammle 30 Minuten Müll\n3. Entsorge alles ordnungsgemäß\n4. Mache ein Vorher/Nachher-Foto',
    tags: ['outdoor', 'umwelt', 'vor-ort'],
  },
  {
    id: 'team-event',
    name: 'Team-Aktion',
    description: 'Gemeinsame Aktivität für Gruppen',
    category: 'social',
    type: 'onsite',
    duration: 30,
    verificationMethod: 'photo',
    instructions: '1. Bildet ein Team von 2-4 Personen\n2. Trefft euch am vereinbarten Ort\n3. Führt die Aktion gemeinsam durch\n4. Macht ein Gruppenfoto',
    tags: ['team', 'vor-ort', 'sozial'],
    isMultiPerson: true,
    minTeamSize: 2,
    maxTeamSize: 4,
  },
];

export default function NewChallengePage() {
  const router = useRouter();
  const { addChallenge } = useChallengeStore();

  // Basic form data
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructions: '',
    category: 'environment' as any,
    type: 'digital' as 'digital' | 'onsite',
    duration: 15 as 5 | 10 | 15 | 30,
    xpReward: 25,
    maxParticipants: 50,
    verificationMethod: 'photo' as 'photo' | 'text' | 'ngo_confirmation',
    imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800',
  });

  // Extended form data
  const [location, setLocation] = useState<Partial<ChallengeLocation>>({});
  const [schedule, setSchedule] = useState<Partial<ChallengeSchedule>>({ type: 'anytime' });
  const [contact, setContact] = useState<Partial<ChallengeContact>>({ preferredMethod: 'email' });
  const [tags, setTags] = useState<string[]>([]);

  // Team challenge data
  const [teamData, setTeamData] = useState({
    isMultiPerson: false,
    minTeamSize: 2,
    maxTeamSize: 4,
    teamDescription: '',
    allowSoloJoin: false,
  });

  const [showTemplates, setShowTemplates] = useState(true);

  const handleTemplateSelect = (template: typeof TEMPLATES[0]) => {
    setFormData({
      ...formData,
      title: '',
      description: template.description,
      instructions: template.instructions,
      category: template.category as any,
      type: template.type as any,
      duration: template.duration as any,
      verificationMethod: template.verificationMethod as any,
    });
    setTags(template.tags || []);
    if (template.isMultiPerson) {
      setTeamData({
        isMultiPerson: true,
        minTeamSize: template.minTeamSize || 2,
        maxTeamSize: template.maxTeamSize || 4,
        teamDescription: '',
        allowSoloJoin: true,
      });
    }
    setShowTemplates(false);
  };

  const calculateXP = () => {
    const baseXP: Record<number, number> = {
      5: 10,
      10: 20,
      15: 25,
      30: 50,
    };
    // Team challenges get bonus XP
    const bonus = teamData.isMultiPerson ? 1.5 : 1;
    return Math.round(baseXP[formData.duration] * bonus);
  };

  const handleSubmit = (asDraft: boolean) => {
    addChallenge({
      ...formData,
      xpReward: calculateXP(),
      status: asDraft ? 'draft' : 'active',
      publishedAt: asDraft ? undefined : new Date(),
      tags,
      // Location only for onsite - cast to full type if name exists
      location: formData.type === 'onsite' && location.name
        ? { name: location.name, ...location } as any
        : undefined,
      // Schedule - cast to full type if type exists
      schedule: schedule.type
        ? { type: schedule.type, ...schedule } as any
        : undefined,
      // Contact - cast to full type if name exists
      contact: contact.name
        ? {
            name: contact.name,
            preferredMethod: contact.preferredMethod || 'email',
            ...contact,
          } as any
        : undefined,
      // Team data
      ...(teamData.isMultiPerson
        ? {
            isMultiPerson: true,
            minTeamSize: teamData.minTeamSize,
            maxTeamSize: teamData.maxTeamSize,
            teamDescription: teamData.teamDescription,
            allowSoloJoin: teamData.allowSoloJoin,
          }
        : {}),
    });
    router.push('/challenges');
  };

  return (
    <div className="flex flex-col">
      <Header
        title="Neue Challenge erstellen"
        description="Erstelle eine neue Micro-Volunteering Challenge für Studenten"
        action={
          <Link href="/challenges">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Zurück
            </Button>
          </Link>
        }
      />

      <div className="p-6">
        {showTemplates ? (
          <div className="space-y-6">
            {/* Template Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Vorlage wählen</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-500 mb-4">
                  Wähle eine Vorlage als Ausgangspunkt oder starte von Grund auf
                </p>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {TEMPLATES.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => handleTemplateSelect(template)}
                      className="p-4 border rounded-lg text-left hover:border-primary-500 hover:bg-primary-50/50 transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">
                          {CATEGORY_LABELS[template.category]}
                        </Badge>
                        {template.isMultiPerson && (
                          <Badge variant="success" className="text-xs">
                            Team
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-medium text-slate-900 mb-1">
                        {template.name}
                      </h3>
                      <p className="text-sm text-slate-500">
                        {template.description}
                      </p>
                      <div className="flex gap-2 mt-3 text-xs text-slate-400">
                        <span>{template.duration} Min</span>
                        <span>·</span>
                        <span>{template.type === 'digital' ? 'Digital' : 'Vor Ort'}</span>
                      </div>
                    </button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  className="w-full mt-4"
                  onClick={() => setShowTemplates(false)}
                >
                  Ohne Vorlage starten
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Grundinformationen</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Titel *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      placeholder="z.B. Vogelzählung im Stadtpark"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Beschreibung *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      rows={3}
                      placeholder="Was sollen die Teilnehmer tun? Warum ist es wichtig?"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Anleitung *
                    </label>
                    <textarea
                      value={formData.instructions}
                      onChange={(e) =>
                        setFormData({ ...formData, instructions: e.target.value })
                      }
                      rows={5}
                      placeholder="Schritt-für-Schritt Anleitung für die Teilnehmer..."
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Bild-URL
                    </label>
                    <input
                      type="url"
                      value={formData.imageUrl}
                      onChange={(e) =>
                        setFormData({ ...formData, imageUrl: e.target.value })
                      }
                      placeholder="https://..."
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Einstellungen</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Kategorie
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {CATEGORIES.map((cat) => (
                        <button
                          key={cat.value}
                          type="button"
                          onClick={() =>
                            setFormData({ ...formData, category: cat.value as any })
                          }
                          className={`p-3 border rounded-lg text-left transition-colors ${
                            formData.category === cat.value
                              ? 'border-primary-500 bg-primary-50'
                              : 'hover:border-slate-300'
                          }`}
                        >
                          <span className="text-xl mb-1 block">{cat.icon}</span>
                          <span className="text-sm font-medium">{cat.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Type */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Art der Challenge
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, type: 'digital' })}
                        className={`flex-1 p-3 border rounded-lg transition-colors ${
                          formData.type === 'digital'
                            ? 'border-primary-500 bg-primary-50'
                            : 'hover:border-slate-300'
                        }`}
                      >
                        <Laptop className="h-5 w-5 mx-auto mb-1 text-slate-500" />
                        <span className="text-sm font-medium block">Digital</span>
                        <p className="text-xs text-slate-500 mt-1">
                          Von überall aus
                        </p>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, type: 'onsite' })}
                        className={`flex-1 p-3 border rounded-lg transition-colors ${
                          formData.type === 'onsite'
                            ? 'border-primary-500 bg-primary-50'
                            : 'hover:border-slate-300'
                        }`}
                      >
                        <MapPin className="h-5 w-5 mx-auto mb-1 text-slate-500" />
                        <span className="text-sm font-medium block">Vor Ort</span>
                        <p className="text-xs text-slate-500 mt-1">
                          Physische Anwesenheit
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* Duration */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Zeitaufwand
                    </label>
                    <div className="flex gap-2">
                      {DURATIONS.map((dur) => (
                        <button
                          key={dur.value}
                          type="button"
                          onClick={() =>
                            setFormData({ ...formData, duration: dur.value as any })
                          }
                          className={`flex-1 p-3 border rounded-lg text-center transition-colors ${
                            formData.duration === dur.value
                              ? 'border-primary-500 bg-primary-50'
                              : 'hover:border-slate-300'
                          }`}
                        >
                          <Clock className="h-5 w-5 mx-auto mb-1 text-slate-400" />
                          <span className="text-sm font-medium block">{dur.label}</span>
                          <span className="text-xs text-slate-500">{dur.description}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Verification */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Nachweismethode
                    </label>
                    <div className="space-y-2">
                      {VERIFICATION_METHODS.map((method) => (
                        <button
                          key={method.value}
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              verificationMethod: method.value as any,
                            })
                          }
                          className={`w-full flex items-center gap-3 p-3 border rounded-lg text-left transition-colors ${
                            formData.verificationMethod === method.value
                              ? 'border-primary-500 bg-primary-50'
                              : 'hover:border-slate-300'
                          }`}
                        >
                          <method.icon className="h-5 w-5 text-slate-400" />
                          <div>
                            <span className="text-sm font-medium block">
                              {method.label}
                            </span>
                            <span className="text-xs text-slate-500">
                              {method.description}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Max Participants */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Maximale Teilnehmer
                    </label>
                    <input
                      type="number"
                      value={formData.maxParticipants}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          maxParticipants: parseInt(e.target.value) || 50,
                        })
                      }
                      min={1}
                      max={500}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Location Section (only for onsite) */}
              <LocationSection
                location={location}
                onChange={setLocation}
                isOnsite={formData.type === 'onsite'}
              />

              {/* Schedule Section */}
              <ScheduleSection schedule={schedule} onChange={setSchedule} />

              {/* Contact Section */}
              <ContactSection contact={contact} onChange={setContact} />

              {/* Team Challenge Section */}
              <TeamSection
                isMultiPerson={teamData.isMultiPerson}
                minTeamSize={teamData.minTeamSize}
                maxTeamSize={teamData.maxTeamSize}
                teamDescription={teamData.teamDescription}
                allowSoloJoin={teamData.allowSoloJoin}
                onChange={setTeamData}
              />

              {/* Tags Section */}
              <TagsSection tags={tags} onChange={setTags} />
            </div>

            {/* Preview & Actions */}
            <div className="space-y-6">
              {/* Preview */}
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle>Vorschau</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg overflow-hidden">
                    <img
                      src={formData.imageUrl}
                      alt="Challenge"
                      className="w-full aspect-video object-cover"
                    />
                    <div className="p-4">
                      <div className="flex flex-wrap gap-2 mb-2">
                        <Badge variant="outline">
                          {CATEGORY_LABELS[formData.category]}
                        </Badge>
                        <Badge variant="outline">
                          {formData.type === 'digital' ? 'Digital' : 'Vor Ort'}
                        </Badge>
                        {teamData.isMultiPerson && (
                          <Badge variant="success">
                            Team ({teamData.minTeamSize}-{teamData.maxTeamSize})
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-semibold text-slate-900 mb-1">
                        {formData.title || 'Titel der Challenge'}
                      </h3>
                      <p className="text-sm text-slate-500 line-clamp-2">
                        {formData.description || 'Beschreibung der Challenge...'}
                      </p>
                      <div className="flex items-center gap-4 mt-3 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {formData.duration} Min
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-amber-500" />
                          {calculateXP()} XP
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {formData.maxParticipants}
                        </span>
                      </div>
                      {tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {tags.slice(0, 4).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded"
                            >
                              {tag}
                            </span>
                          ))}
                          {tags.length > 4 && (
                            <span className="px-2 py-0.5 text-slate-400 text-xs">
                              +{tags.length - 4}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>

                {/* Actions */}
                <CardContent className="pt-0 space-y-3">
                  <Button
                    className="w-full"
                    onClick={() => handleSubmit(false)}
                    disabled={!formData.title || !formData.description}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Veröffentlichen
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleSubmit(true)}
                    disabled={!formData.title}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Als Entwurf speichern
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => setShowTemplates(true)}
                  >
                    Vorlage wählen
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
