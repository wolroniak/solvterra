'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Save, Building2, Mail, Globe, Shield, Bell, Loader2, X } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ImageUpload } from '@/components/ui/image-upload';
import { useAuthStore } from '@/store';
import { uploadLogo } from '@/lib/storage';
import { supabase } from '@/lib/supabase';
import { useNotificationStore } from '@/components/ui/toast-notifications';

export default function SettingsPage() {
  const { organization, refreshOrganization } = useAuthStore();
  const { t } = useTranslation('settings');
  const addNotification = useNotificationStore((s) => s.addNotification);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditingLogo, setIsEditingLogo] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: organization?.name || '',
    description: organization?.description || '',
    email: organization?.email || '',
    website: organization?.website || '',
  });

  const handleLogoChange = (url: string | null, file?: File) => {
    if (file) {
      setLogoFile(file);
      // Preview will be handled by ImageUpload component
      const reader = new FileReader();
      reader.onload = (e) => setLogoPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else if (url) {
      setLogoPreview(url);
      setLogoFile(null);
    } else {
      setLogoPreview(null);
      setLogoFile(null);
    }
  };

  const handleCancelLogoEdit = () => {
    setIsEditingLogo(false);
    setLogoFile(null);
    setLogoPreview(null);
  };

  const handleSave = async () => {
    if (!organization) return;

    setSaving(true);

    try {
      let newLogoUrl = organization.logo;

      // Upload new logo if selected
      if (logoFile) {
        const uploadedUrl = await uploadLogo(logoFile, organization.id, organization.logo);
        if (uploadedUrl) {
          newLogoUrl = uploadedUrl;
        } else {
          addNotification({
            title: t('profile.logoUpdateFailed'),
            type: 'error',
          });
          setSaving(false);
          return;
        }
      } else if (logoPreview && logoPreview !== organization.logo) {
        // URL was entered directly
        newLogoUrl = logoPreview;
      }

      // Update organization in database
      const { error } = await supabase
        .from('organizations')
        .update({
          name: formData.name,
          description: formData.description,
          contact_email: formData.email,
          website: formData.website,
          logo: newLogoUrl,
        })
        .eq('id', organization.id);

      if (error) {
        throw error;
      }

      // Refresh organization in store
      await refreshOrganization();

      // Reset logo editing state
      setIsEditingLogo(false);
      setLogoFile(null);
      setLogoPreview(null);

      // Show success state
      setSaved(true);
      if (logoFile || (logoPreview && logoPreview !== organization.logo)) {
        addNotification({
          title: t('profile.logoUpdated'),
          type: 'success',
        });
      }
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Failed to save settings:', error);
      addNotification({
        title: t('profile.logoUpdateFailed'),
        type: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col">
      <Header
        title={t('page.title')}
        description={t('page.description')}
      />

      <div className="p-6 max-w-4xl space-y-6">
        {/* Organization Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {t('profile.title')}
            </CardTitle>
            <CardDescription>
              {t('profile.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Logo */}
            <div className="space-y-4">
              {isEditingLogo ? (
                <div className="max-w-md space-y-4">
                  {/* Current logo reference */}
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={organization?.logo} />
                      <AvatarFallback>{organization?.name?.[0]}</AvatarFallback>
                    </Avatar>
                    <div className="text-sm">
                      <p className="font-medium text-slate-700">{t('profile.currentLogo')}</p>
                      <p className="text-xs text-slate-500">{t('profile.uploadNewBelow')}</p>
                    </div>
                  </div>

                  {/* New logo preview if selected */}
                  {logoPreview && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-slate-700">{t('profile.newLogo')}</p>
                      <div className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-primary-300 bg-slate-50">
                        <img
                          src={logoPreview}
                          alt="New logo preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => { setLogoPreview(null); setLogoFile(null); }}
                          className="absolute top-1 right-1 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Upload area - always show when editing */}
                  {!logoPreview && (
                    <ImageUpload
                      value={null}
                      onChange={handleLogoChange}
                      aspectRatio="square"
                      maxSizeMB={2}
                    />
                  )}

                  {/* Action buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancelLogoEdit}
                    >
                      {t('profile.cancelLogoChange')}
                    </Button>
                    {logoPreview && (
                      <p className="text-xs text-slate-500 self-center ml-2">
                        {t('profile.clickSaveToApply')}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={organization?.logo} />
                    <AvatarFallback className="text-2xl">
                      {organization?.name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditingLogo(true)}
                    >
                      {t('profile.changeLogo')}
                    </Button>
                    <p className="text-xs text-slate-500 mt-1">
                      {t('profile.logoHint')}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {t('profile.name')}
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {t('profile.descriptionLabel')}
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <p className="text-xs text-slate-500 mt-1">
                {t('profile.descriptionHint')}
              </p>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {t('profile.contactEmail')}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            {/* Website */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {t('profile.website')}
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) =>
                    setFormData({ ...formData, website: e.target.value })
                  }
                  className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Verification Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              {t('verification.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-green-900">{t('verification.verified')}</p>
                  <p className="text-sm text-green-700">
                    {t('verification.verifiedDescription')}
                  </p>
                </div>
              </div>
              <Badge className="bg-green-600">{t('verification.badge')}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              {t('notifications.title')}
            </CardTitle>
            <CardDescription>
              {t('notifications.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              {
                title: t('notifications.newSubmissions'),
                description: t('notifications.newSubmissionsDescription'),
                enabled: true,
              },
              {
                title: t('notifications.challengeCapacity'),
                description: t('notifications.challengeCapacityDescription'),
                enabled: true,
              },
              {
                title: t('notifications.weeklyReport'),
                description: t('notifications.weeklyReportDescription'),
                enabled: false,
              },
            ].map((setting, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-3 border-b last:border-0"
              >
                <div>
                  <p className="font-medium text-slate-900">{setting.title}</p>
                  <p className="text-sm text-slate-500">{setting.description}</p>
                </div>
                <button
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    setting.enabled ? 'bg-primary-600' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      setting.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saved || saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t('profile.saving')}
              </>
            ) : saved ? (
              <>{t('save.saved')}</>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {t('save.saveChanges')}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
