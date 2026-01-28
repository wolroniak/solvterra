'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Clock, Infinity, CalendarDays, Repeat, X, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { ChallengeSchedule, ScheduleType } from '@/lib/mock-data';

interface ScheduleSectionProps {
  schedule: Partial<ChallengeSchedule>;
  onChange: (schedule: Partial<ChallengeSchedule>) => void;
}

const SCHEDULE_TYPE_CONFIGS: { value: ScheduleType; icon: typeof Calendar; translationKey: string }[] = [
  { value: 'anytime', icon: Infinity, translationKey: 'anytime' },
  { value: 'fixed', icon: CalendarDays, translationKey: 'fixed' },
  { value: 'range', icon: Calendar, translationKey: 'range' },
  { value: 'recurring', icon: Repeat, translationKey: 'recurring' },
];

export function ScheduleSection({ schedule, onChange }: ScheduleSectionProps) {
  const { t } = useTranslation('challengeForm');
  const [newTimeSlot, setNewTimeSlot] = useState('');

  const scheduleType = schedule.type || 'anytime';

  const handleTypeChange = (type: ScheduleType) => {
    const baseSchedule: Partial<ChallengeSchedule> = { type };

    // Set sensible defaults based on type
    switch (type) {
      case 'anytime':
        onChange({ type, isFlexible: true });
        break;
      case 'fixed':
        onChange({
          ...baseSchedule,
          startDate: schedule.startDate,
          endDate: schedule.endDate,
          isFlexible: false,
        });
        break;
      case 'range':
        onChange({
          ...baseSchedule,
          startDate: schedule.startDate,
          endDate: schedule.endDate,
          deadline: schedule.deadline || schedule.endDate,
          isFlexible: true,
        });
        break;
      case 'recurring':
        onChange({
          ...baseSchedule,
          timeSlots: schedule.timeSlots || [],
          deadline: schedule.deadline,
          isFlexible: false,
        });
        break;
    }
  };

  const addTimeSlot = () => {
    if (newTimeSlot.trim()) {
      const currentSlots = schedule.timeSlots || [];
      onChange({ ...schedule, timeSlots: [...currentSlots, newTimeSlot.trim()] });
      setNewTimeSlot('');
    }
  };

  const removeTimeSlot = (index: number) => {
    const currentSlots = schedule.timeSlots || [];
    onChange({ ...schedule, timeSlots: currentSlots.filter((_, i) => i !== index) });
  };

  const formatDateForInput = (date: Date | undefined) => {
    if (!date) return '';
    return new Date(date).toISOString().slice(0, 16);
  };

  const formatDateOnlyForInput = (date: Date | undefined) => {
    if (!date) return '';
    return new Date(date).toISOString().slice(0, 10);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary-500" />
          {t('schedule.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Schedule Type Selection */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            {t('schedule.availabilityLabel')}
          </label>
          <div className="grid grid-cols-2 gap-3">
            {SCHEDULE_TYPE_CONFIGS.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => handleTypeChange(type.value)}
                className={`flex items-start gap-3 p-3 border rounded-lg text-left transition-colors ${
                  scheduleType === type.value
                    ? 'border-primary-500 bg-primary-50'
                    : 'hover:border-slate-300'
                }`}
              >
                <type.icon className={`h-5 w-5 mt-0.5 ${
                  scheduleType === type.value ? 'text-primary-600' : 'text-slate-400'
                }`} />
                <div>
                  <span className="text-sm font-medium block">{t(`schedule.types.${type.translationKey}.label`)}</span>
                  <span className="text-xs text-slate-500">{t(`schedule.types.${type.translationKey}.description`)}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Fixed Date/Time */}
        {scheduleType === 'fixed' && (
          <div className="space-y-4 p-4 bg-slate-50 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {t('schedule.startTime')}
                </label>
                <input
                  type="datetime-local"
                  value={formatDateForInput(schedule.startDate)}
                  onChange={(e) =>
                    onChange({ ...schedule, startDate: new Date(e.target.value) })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {t('schedule.endTime')}
                </label>
                <input
                  type="datetime-local"
                  value={formatDateForInput(schedule.endDate)}
                  onChange={(e) =>
                    onChange({ ...schedule, endDate: new Date(e.target.value) })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            <p className="text-xs text-slate-500">
              {t('schedule.fixedHint')}
            </p>
          </div>
        )}

        {/* Date Range */}
        {scheduleType === 'range' && (
          <div className="space-y-4 p-4 bg-slate-50 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {t('schedule.startDate')}
                </label>
                <input
                  type="date"
                  value={formatDateOnlyForInput(schedule.startDate)}
                  onChange={(e) =>
                    onChange({ ...schedule, startDate: new Date(e.target.value) })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {t('schedule.endDate')}
                </label>
                <input
                  type="date"
                  value={formatDateOnlyForInput(schedule.endDate)}
                  onChange={(e) => {
                    const endDate = new Date(e.target.value);
                    onChange({
                      ...schedule,
                      endDate,
                      deadline: schedule.deadline || endDate,
                    });
                  }}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {t('schedule.submissionDeadline')}
              </label>
              <input
                type="date"
                value={formatDateOnlyForInput(schedule.deadline)}
                onChange={(e) =>
                  onChange({ ...schedule, deadline: new Date(e.target.value) })
                }
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <p className="text-xs text-slate-500 mt-1">
                {t('schedule.submissionDeadlineHint')}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isFlexible"
                checked={schedule.isFlexible ?? true}
                onChange={(e) => onChange({ ...schedule, isFlexible: e.target.checked })}
                className="w-4 h-4 text-primary-600 border-slate-300 rounded focus:ring-primary-500"
              />
              <label htmlFor="isFlexible" className="text-sm text-slate-700">
                {t('schedule.flexibleScheduling')}
              </label>
            </div>
          </div>
        )}

        {/* Recurring Time Slots */}
        {scheduleType === 'recurring' && (
          <div className="space-y-4 p-4 bg-slate-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {t('schedule.timeSlotsLabel')}
              </label>
              <div className="space-y-2 mb-3">
                {(schedule.timeSlots || []).map((slot, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-white rounded border"
                  >
                    <span className="text-sm">{slot}</span>
                    <button
                      type="button"
                      onClick={() => removeTimeSlot(index)}
                      className="text-slate-400 hover:text-red-500"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTimeSlot}
                  onChange={(e) => setNewTimeSlot(e.target.value)}
                  placeholder={t('schedule.timeSlotPlaceholder')}
                  className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTimeSlot();
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={addTimeSlot}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {t('schedule.timeSlotExamples')}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {t('schedule.deadlineOptional')}
              </label>
              <input
                type="date"
                value={formatDateOnlyForInput(schedule.deadline)}
                onChange={(e) =>
                  onChange({ ...schedule, deadline: new Date(e.target.value) })
                }
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <p className="text-xs text-slate-500 mt-1">
                {t('schedule.deadlineHint')}
              </p>
            </div>
          </div>
        )}

        {/* Anytime - Simple confirmation */}
        {scheduleType === 'anytime' && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700">
              {t('schedule.anytimeMessage')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
