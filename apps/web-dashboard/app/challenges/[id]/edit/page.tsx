'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  Clock,
  Star,
  Users,
  Camera,
  FileText,
  UserCheck,
  MapPin,
  Laptop,
  Loader2,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ImageUpload } from '@/components/ui/image-upload';
import { useChallengeStore } from '@/store';
import { uploadChallengeImage } from '@/lib/storage';
import { useNotificationStore } from '@/components/ui/toast-notifications';
import {
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

const CATEGORY_ICONS: Record<string, string> = {
  environment: '\u{1F331}',
  social: '\u{2764}\u{FE0F}',
  education: '\u{1F4DA}',
  health: '\u{1F3E5}',
  animals: '\u{1F43E}',
  culture: '\u{1F3A8}',
};

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

export default function EditChallengePage() {
  const { t } = useTranslation('challenges');
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const addNotification = useNotificationStore((s) => s.addNotification);

  const { challenges, updateChallenge } = useChallengeStore();
  const challenge = challenges.find((c) => c.id === id);

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
    imageUrl: '',
  });

  // Image upload state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

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

  const [isSaving, setIsSaving] = useState(false);

  // Load challenge data
  useEffect(() => {
    if (challenge) {
      setFormData({
        title: challenge.title,
        description: challenge.description,
        instructions: challenge.instructions,
        category: challenge.category,
        type: challenge.type,
        duration: challenge.duration as any,
        xpReward: challenge.xpReward,
        maxParticipants: challenge.maxParticipants,
        verificationMethod: challenge.verificationMethod,
        imageUrl: challenge.imageUrl,
      });

      // Load location
      if (challenge.location) {
        setLocation(challenge.location);
      }

      // Load schedule
      if (challenge.schedule) {
        setSchedule(challenge.schedule);
      }

      // Load contact
      if (challenge.contact) {
        setContact(challenge.contact);
      }

      // Load tags
      setTags(challenge.tags || []);

      // Load team data
      setTeamData({
        isMultiPerson: challenge.isMultiPerson || false,
        minTeamSize: challenge.minTeamSize || 2,
        maxTeamSize: challenge.maxTeamSize || 4,
        teamDescription: challenge.teamDescription || '',
        allowSoloJoin: challenge.allowSoloJoin || false,
      });
    }
  }, [challenge]);

  if (!challenge) {
    return (
      <div className="flex flex-col">
        <Header
          title={t('edit.notFoundTitle')}
          description={t('edit.notFoundDescription')}
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
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-slate-500">
              <p className="text-lg font-medium">{t('edit.notFoundMessage')}</p>
              <p className="text-sm">{t('edit.notFoundDetail', { id })}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const calculateXP = () => {
    const baseXP: Record<number, number> = {
      5: 10,
      10: 20,
      15: 25,
      30: 50,
    };
    const bonus = teamData.isMultiPerson ? 1.5 : 1;
    return Math.round(baseXP[formData.duration] * bonus);
  };

  const handleImageChange = (url: string | null, file?: File) => {
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else if (url) {
      setImagePreview(url);
      setFormData({ ...formData, imageUrl: url });
      setImageFile(null);
    } else {
      setImagePreview(null);
      setFormData({ ...formData, imageUrl: '' });
      setImageFile(null);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      let finalImageUrl = formData.imageUrl;

      // Upload new image if file is selected
      if (imageFile) {
        const uploadedUrl = await uploadChallengeImage(
          imageFile,
          challenge.id,
          challenge.imageUrl
        );
        if (uploadedUrl) {
          finalImageUrl = uploadedUrl;
        } else {
          addNotification({
            title: t('edit.imageUploadFailed'),
            type: 'error',
          });
          setIsSaving(false);
          return;
        }
      }

      updateChallenge(challenge.id, {
        ...formData,
        imageUrl: finalImageUrl,
        xpReward: calculateXP(),
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
        isMultiPerson: teamData.isMultiPerson,
        ...(teamData.isMultiPerson
          ? {
              minTeamSize: teamData.minTeamSize,
              maxTeamSize: teamData.maxTeamSize,
              teamDescription: teamData.teamDescription,
              allowSoloJoin: teamData.allowSoloJoin,
            }
          : {
              minTeamSize: undefined,
              maxTeamSize: undefined,
              teamDescription: undefined,
              allowSoloJoin: undefined,
            }),
      });

      router.push(`/challenges/${challenge.id}`);
    } catch (error) {
      console.error('Failed to save challenge:', error);
      addNotification({
        title: t('edit.saveFailed'),
        type: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const CATEGORIES = [
    { value: 'environment' },
    { value: 'social' },
    { value: 'education' },
    { value: 'health' },
    { value: 'animals' },
    { value: 'culture' },
  ];

  return (
    <div className="flex flex-col">
      <Header
        title={t('edit.pageTitle')}
        description={t('edit.pageDescription', { title: challenge.title })}
        action={
          <div className="flex items-center gap-2">
            <Link href={`/challenges/${challenge.id}`}>
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('edit.cancel')}
              </Button>
            </Link>
            <Button onClick={handleSave} disabled={isSaving || !formData.title}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? t('edit.saving') : t('edit.save')}
            </Button>
          </div>
        }
      />

      <div className="p-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle>{t('edit.basicInfo')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t('edit.titleLabel')}
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder={t('edit.titlePlaceholder')}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t('edit.descriptionLabel')}
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                    placeholder={t('edit.descriptionPlaceholder')}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t('edit.instructionsLabel')}
                  </label>
                  <textarea
                    value={formData.instructions}
                    onChange={(e) =>
                      setFormData({ ...formData, instructions: e.target.value })
                    }
                    rows={5}
                    placeholder={t('edit.instructionsPlaceholder')}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t('edit.imageLabel')}
                  </label>
                  <ImageUpload
                    value={imagePreview || formData.imageUrl}
                    onChange={handleImageChange}
                    aspectRatio="16:9"
                    maxSizeMB={2}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Settings */}
            <Card>
              <CardHeader>
                <CardTitle>{t('edit.settings')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {t('edit.categoryLabel')}
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
                    {t('edit.challengeType')}
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
                      <span className="text-sm font-medium block">{t('edit.digital')}</span>
                      <p className="text-xs text-slate-500 mt-1">
                        {t('edit.digitalDescription')}
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
                      <span className="text-sm font-medium block">{t('edit.onsite')}</span>
                      <p className="text-xs text-slate-500 mt-1">
                        {t('edit.onsiteDescription')}
                      </p>
                    </button>
                  </div>
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {t('edit.timeEffort')}
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
                    {t('edit.verificationMethod')}
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
                    {t('edit.maxParticipants')}
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
                <CardTitle>{t('edit.preview')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden">
                  <img
                    src={imagePreview || formData.imageUrl || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800'}
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
                      {formData.title || t('edit.previewTitlePlaceholder')}
                    </h3>
                    <p className="text-sm text-slate-500 line-clamp-2">
                      {formData.description || t('edit.previewDescriptionPlaceholder')}
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
                  onClick={handleSave}
                  disabled={isSaving || !formData.title || !formData.description}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? t('edit.saving') : t('edit.saveChanges')}
                </Button>
                <Link href={`/challenges/${challenge.id}`} className="block">
                  <Button variant="outline" className="w-full">
                    {t('edit.cancelButton')}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
