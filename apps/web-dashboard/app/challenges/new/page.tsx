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
import { useTranslation } from 'react-i18next';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useChallengeStore } from '@/store';
import {
  type ChallengeLocation,
  type ChallengeSchedule,
  type ChallengeContact,
} from '@/lib/mock-data';
import { useVerificationStatus } from '@/components/verification-banner';
import { AlertCircle } from 'lucide-react';
import {
  LocationSection,
  ScheduleSection,
  ContactSection,
  TeamSection,
  TagsSection,
} from '@/components/challenge-form';

const CATEGORY_ICONS: Record<string, string> = {
  environment: '\u{1F331}',
  social: '\u{2764}\u{FE0F}',
  education: '\u{1F4DA}',
  health: '\u{1F3E5}',
  animals: '\u{1F43E}',
  culture: '\u{1F3A8}',
};

const CATEGORIES = [
  { value: 'environment' },
  { value: 'social' },
  { value: 'education' },
  { value: 'health' },
  { value: 'animals' },
  { value: 'culture' },
];

const DURATIONS = [
  { value: 5, description: '10 XP' },
  { value: 10, description: '20 XP' },
  { value: 15, description: '25 XP' },
  { value: 30, description: '50 XP' },
];

const VERIFICATION_METHODS = [
  { value: 'photo', icon: Camera },
  { value: 'text', icon: FileText },
  { value: 'ngo_confirmation', icon: UserCheck },
];

const TEMPLATES = [
  {
    id: 'social-media',
    nameKey: 'templates.socialMedia',
    descriptionKey: 'templates.socialMediaDescription',
    category: 'environment',
    type: 'digital',
    duration: 15,
    verificationMethod: 'photo',
    instructionsKey: 'templates.socialMediaInstructions',
    tags: ['social-media', 'digital', 'awareness'],
  },
  {
    id: 'research',
    nameKey: 'templates.research',
    descriptionKey: 'templates.researchDescription',
    category: 'education',
    type: 'digital',
    duration: 15,
    verificationMethod: 'text',
    instructionsKey: 'templates.researchInstructions',
    tags: ['recherche', 'digital', 'bildung'],
  },
  {
    id: 'cleanup',
    nameKey: 'templates.cleanup',
    descriptionKey: 'templates.cleanupDescription',
    category: 'environment',
    type: 'onsite',
    duration: 30,
    verificationMethod: 'photo',
    instructionsKey: 'templates.cleanupInstructions',
    tags: ['outdoor', 'umwelt', 'vor-ort'],
  },
  {
    id: 'team-event',
    nameKey: 'templates.teamEvent',
    descriptionKey: 'templates.teamEventDescription',
    category: 'social',
    type: 'onsite',
    duration: 30,
    verificationMethod: 'photo',
    instructionsKey: 'templates.teamEventInstructions',
    tags: ['team', 'vor-ort', 'sozial'],
    isMultiPerson: true,
    minTeamSize: 2,
    maxTeamSize: 4,
  },
];

export default function NewChallengePage() {
  const { t } = useTranslation('challenges');
  const router = useRouter();
  const { addChallenge } = useChallengeStore();
  const { isRejected, rejectionReason } = useVerificationStatus();

  // Block access for rejected organizations
  if (isRejected) {
    return (
      <div className="flex flex-col">
        <Header
          title={t('new.rejectedTitle')}
          description={t('new.rejectedDescription')}
          action={
            <Link href="/challenges">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('actions.back', { ns: 'common' })}
              </Button>
            </Link>
          }
        />
        <div className="p-6">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="flex items-start gap-4 p-6">
              <AlertCircle className="h-6 w-6 text-red-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-800">{t('new.accessRestricted')}</h3>
                <p className="text-sm text-red-700 mt-1">
                  {t('new.accessRestrictedMessage')}
                </p>
                {rejectionReason && (
                  <p className="text-sm text-red-600 mt-2 p-2 bg-red-100 rounded">
                    <strong>{t('new.rejectionReason')}</strong> {rejectionReason}
                  </p>
                )}
                <p className="text-sm text-red-700 mt-3">
                  {t('new.contactSupport')}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
      description: t(template.descriptionKey),
      instructions: t(template.instructionsKey),
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
        title={t('new.pageTitle')}
        description={t('new.pageDescription')}
        action={
          <Link href="/challenges">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('actions.back', { ns: 'common' })}
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
                <CardTitle>{t('new.chooseTemplate')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-500 mb-4">
                  {t('new.templateHint')}
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
                          {t(`categories.${template.category}`)}
                        </Badge>
                        {template.isMultiPerson && (
                          <Badge variant="success" className="text-xs">
                            Team
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-medium text-slate-900 mb-1">
                        {t(template.nameKey)}
                      </h3>
                      <p className="text-sm text-slate-500">
                        {t(template.descriptionKey)}
                      </p>
                      <div className="flex gap-2 mt-3 text-xs text-slate-400">
                        <span>{t('durationMinutes', { count: template.duration })}</span>
                        <span>·</span>
                        <span>{template.type === 'digital' ? t('type.digital') : t('type.onsite')}</span>
                      </div>
                    </button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  className="w-full mt-4"
                  onClick={() => setShowTemplates(false)}
                >
                  {t('new.startWithoutTemplate')}
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
                  <CardTitle>{t('new.basicInfo')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      {t('new.titleLabel')}
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      placeholder={t('new.titlePlaceholder')}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      {t('new.descriptionLabel')}
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      rows={3}
                      placeholder={t('new.descriptionPlaceholder')}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      {t('new.instructionsLabel')}
                    </label>
                    <textarea
                      value={formData.instructions}
                      onChange={(e) =>
                        setFormData({ ...formData, instructions: e.target.value })
                      }
                      rows={5}
                      placeholder={t('new.instructionsPlaceholder')}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      {t('new.imageUrlLabel')}
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
                  <CardTitle>{t('new.settings')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      {t('new.categoryLabel')}
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
                          <span className="text-xl mb-1 block">{CATEGORY_ICONS[cat.value]}</span>
                          <span className="text-sm font-medium">{t(`categories.${cat.value}`)}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Type */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      {t('new.challengeType')}
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
                        <span className="text-sm font-medium block">{t('new.digital')}</span>
                        <p className="text-xs text-slate-500 mt-1">
                          {t('new.digitalDescription')}
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
                        <span className="text-sm font-medium block">{t('new.onsite')}</span>
                        <p className="text-xs text-slate-500 mt-1">
                          {t('new.onsiteDescription')}
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* Duration */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      {t('new.timeEffort')}
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
                          <span className="text-sm font-medium block">{t('durationMinutes', { count: dur.value })}</span>
                          <span className="text-xs text-slate-500">{dur.description}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Verification */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      {t('new.verificationMethod')}
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
                              {t(`verification.${method.value}`)}
                            </span>
                            <span className="text-xs text-slate-500">
                              {t(`verification.${method.value}Description`)}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Max Participants */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      {t('new.maxParticipants')}
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
                  <CardTitle>{t('new.preview')}</CardTitle>
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
                          {t(`categories.${formData.category}`)}
                        </Badge>
                        <Badge variant="outline">
                          {formData.type === 'digital' ? t('type.digital') : t('type.onsite')}
                        </Badge>
                        {teamData.isMultiPerson && (
                          <Badge variant="success">
                            Team ({teamData.minTeamSize}-{teamData.maxTeamSize})
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-semibold text-slate-900 mb-1">
                        {formData.title || t('new.previewTitlePlaceholder')}
                      </h3>
                      <p className="text-sm text-slate-500 line-clamp-2">
                        {formData.description || t('new.previewDescriptionPlaceholder')}
                      </p>
                      <div className="flex items-center gap-4 mt-3 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {t('durationMinutes', { count: formData.duration })}
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
                    {t('new.publishButton')}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleSubmit(true)}
                    disabled={!formData.title}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {t('new.saveDraft')}
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => setShowTemplates(true)}
                  >
                    {t('new.chooseTemplateButton')}
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
