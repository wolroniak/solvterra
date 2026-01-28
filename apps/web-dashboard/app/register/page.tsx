'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import {
  ArrowRight,
  ArrowLeft,
  Check,
  AlertCircle,
  Building2,
  Mail,
  FileText,
  Loader2
} from 'lucide-react';
import Image from 'next/image';
import { CATEGORY_COLORS } from '@/lib/mock-data';

type Step = 1 | 2 | 3 | 4;
type Category = 'environment' | 'social' | 'education' | 'health' | 'animals' | 'culture';

const CATEGORY_KEYS: Category[] = ['environment', 'social', 'education', 'health', 'animals', 'culture'];

export default function RegisterPage() {
  const router = useRouter();
  const { t } = useTranslation('auth');
  const [step, setStep] = useState<Step>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1: Account
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  // Step 2: Organization basics
  const [orgName, setOrgName] = useState('');
  const [category, setCategory] = useState<Category | ''>('');

  // Step 3: Optional details
  const [description, setDescription] = useState('');
  const [mission, setMission] = useState('');
  const [website, setWebsite] = useState('');
  const [logo, setLogo] = useState('');

  const validateStep1 = (): boolean => {
    if (!email || !password || !passwordConfirm) {
      setError(t('register.validation.fillAllFields'));
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError(t('register.validation.invalidEmail'));
      return false;
    }
    if (password.length < 8) {
      setError(t('register.validation.passwordMinLength'));
      return false;
    }
    if (password !== passwordConfirm) {
      setError(t('register.validation.passwordMismatch'));
      return false;
    }
    return true;
  };

  const validateStep2 = (): boolean => {
    if (!orgName.trim()) {
      setError(t('register.validation.orgNameRequired'));
      return false;
    }
    if (!category) {
      setError(t('register.validation.categoryRequired'));
      return false;
    }
    return true;
  };

  const handleNext = async () => {
    setError('');

    if (step === 1) {
      if (!validateStep1()) return;
      setStep(2);
    } else if (step === 2) {
      if (!validateStep2()) return;
      setStep(3);
    } else if (step === 3) {
      await handleSubmit();
    }
  };

  const handleBack = () => {
    setError('');
    if (step > 1) {
      setStep((step - 1) as Step);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Step 1: Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          setError(t('register.validation.emailAlreadyRegistered'));
        } else {
          setError(authError.message);
        }
        setIsLoading(false);
        return;
      }

      if (!authData.user) {
        setError(t('register.validation.registrationFailed'));
        setIsLoading(false);
        return;
      }

      // Step 2: Create organization using the helper function
      const { error: orgError } = await supabase.rpc('register_organization', {
        p_user_id: authData.user.id,
        p_name: orgName.trim(),
        p_category: category,
        p_contact_email: email,
        p_description: description.trim() || null,
        p_mission: mission.trim() || null,
        p_website: website.trim() || null,
        p_logo: logo.trim() || null,
      });

      if (orgError) {
        console.error('Organization creation error:', orgError);
        setError(t('register.validation.orgCreationFailed', { message: orgError.message }));
        setIsLoading(false);
        return;
      }

      // Success! Go to step 4
      setStep(4);
    } catch (err) {
      console.error('Registration error:', err);
      setError(t('register.validation.unexpectedError'));
    }

    setIsLoading(false);
  };

  const handleGoToLogin = () => {
    router.push('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Image
            src="/logo.png"
            alt="SolvTerra"
            width={180}
            height={60}
            className="h-12 w-auto object-contain"
            priority
          />
        </div>

        {/* Progress Indicator */}
        {step < 4 && (
          <div className="flex items-center justify-center gap-2 mb-8">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    s < step
                      ? 'bg-primary text-white'
                      : s === step
                      ? 'bg-primary text-white'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {s < step ? <Check className="w-4 h-4" /> : s}
                </div>
                {s < 4 && (
                  <div
                    className={`w-8 h-1 mx-1 rounded ${
                      s < step ? 'bg-primary' : 'bg-slate-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        <Card>
          {error && (
            <div className="mx-6 mt-6 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Step 1: Account creation */}
          {step === 1 && (
            <>
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-2xl">{t('register.step1.title')}</CardTitle>
                <CardDescription>
                  {t('register.step1.description')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-slate-700">
                    {t('register.step1.emailLabel')}
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={t('register.step1.emailPlaceholder')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-slate-700">
                    {t('register.step1.passwordLabel')}
                  </label>
                  <Input
                    id="password"
                    type="password"
                    placeholder={t('register.step1.passwordPlaceholder')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="passwordConfirm" className="text-sm font-medium text-slate-700">
                    {t('register.step1.confirmPasswordLabel')}
                  </label>
                  <Input
                    id="passwordConfirm"
                    type="password"
                    placeholder={t('register.step1.confirmPasswordPlaceholder')}
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </CardContent>
            </>
          )}

          {/* Step 2: Organization basics */}
          {step === 2 && (
            <>
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-2xl">{t('register.step2.title')}</CardTitle>
                <CardDescription>
                  {t('register.step2.description')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="orgName" className="text-sm font-medium text-slate-700">
                    {t('register.step2.orgNameLabel')}
                  </label>
                  <Input
                    id="orgName"
                    type="text"
                    placeholder={t('register.step2.orgNamePlaceholder')}
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    {t('register.step2.categoryLabel')}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {CATEGORY_KEYS.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat)}
                        className={`p-3 rounded-lg border-2 text-left transition-all ${
                          category === cat
                            ? 'border-primary bg-primary/5'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                        disabled={isLoading}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: CATEGORY_COLORS[cat] }}
                          />
                          <span className="text-sm font-medium">{t(`register.categories.${cat}`)}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </>
          )}

          {/* Step 3: Optional details */}
          {step === 3 && (
            <>
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-2xl">{t('register.step3.title')}</CardTitle>
                <CardDescription>
                  {t('register.step3.description')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium text-slate-700">
                    {t('register.step3.descriptionLabel')}
                  </label>
                  <textarea
                    id="description"
                    className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder={t('register.step3.descriptionPlaceholder')}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="mission" className="text-sm font-medium text-slate-700">
                    {t('register.step3.missionLabel')}
                  </label>
                  <Input
                    id="mission"
                    type="text"
                    placeholder={t('register.step3.missionPlaceholder')}
                    value={mission}
                    onChange={(e) => setMission(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="website" className="text-sm font-medium text-slate-700">
                    {t('register.step3.websiteLabel')}
                  </label>
                  <Input
                    id="website"
                    type="url"
                    placeholder={t('register.step3.websitePlaceholder')}
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="logo" className="text-sm font-medium text-slate-700">
                    {t('register.step3.logoLabel')}
                  </label>
                  <Input
                    id="logo"
                    type="url"
                    placeholder={t('register.step3.logoPlaceholder')}
                    value={logo}
                    onChange={(e) => setLogo(e.target.value)}
                    disabled={isLoading}
                  />
                  <p className="text-xs text-slate-500">
                    {t('register.step3.logoHint')}
                  </p>
                </div>
              </CardContent>
            </>
          )}

          {/* Step 4: Success */}
          {step === 4 && (
            <>
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                </div>
                <CardTitle className="text-2xl">{t('register.step4.title')}</CardTitle>
                <CardDescription
                  className="text-base mt-2"
                  dangerouslySetInnerHTML={{
                    __html: t('register.step4.welcome', { orgName }),
                  }}
                />
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-amber-800">{t('register.step4.verificationPending')}</p>
                      <p className="text-sm text-amber-700 mt-1">
                        {t('register.step4.verificationMessage')}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-center text-sm text-slate-500">
                  <p>{t('register.step4.contactMessage')}</p>
                  <p className="font-medium text-slate-700">{email}</p>
                </div>

                <Button onClick={handleGoToLogin} className="w-full">
                  {t('register.step4.goToLogin')}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </>
          )}

          {step < 4 && (
            <div className="px-6 pb-6 flex gap-3">
              {step > 1 && (
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={isLoading}
                  className="flex-1"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {t('register.navigation.back')}
                </Button>
              )}
              <Button
                onClick={handleNext}
                disabled={isLoading}
                className={step === 1 ? 'w-full' : 'flex-1'}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t('register.navigation.creating')}
                  </>
                ) : step === 3 ? (
                  <>
                    {t('register.navigation.register')}
                    <Check className="w-4 h-4 ml-2" />
                  </>
                ) : (
                  <>
                    {t('register.navigation.next')}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          )}
        </Card>

        {step < 4 && (
          <p className="text-center text-sm text-slate-500 mt-4">
            {t('register.alreadyRegistered')}{' '}
            <button
              onClick={handleGoToLogin}
              className="text-primary hover:underline font-medium"
            >
              {t('register.goToLogin')}
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
