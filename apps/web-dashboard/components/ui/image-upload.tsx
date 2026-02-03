'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Upload, Link as LinkIcon, X, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

interface ImageUploadProps {
  value?: string | null;
  onChange: (url: string | null, file?: File) => void;
  aspectRatio?: 'square' | '16:9' | 'free';
  maxSizeMB?: number;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

const MAX_SIZE_DEFAULT = 2; // 2MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];

export function ImageUpload({
  value,
  onChange,
  aspectRatio = 'free',
  maxSizeMB = MAX_SIZE_DEFAULT,
  disabled = false,
  placeholder,
  className,
}: ImageUploadProps) {
  const { t } = useTranslation('common');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload');

  const displayUrl = previewUrl || value;

  const validateFile = useCallback(
    (file: File): string | null => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return t('imageUpload.errorInvalidType');
      }
      const maxBytes = maxSizeMB * 1024 * 1024;
      if (file.size > maxBytes) {
        return t('imageUpload.errorTooLarge', { size: maxSizeMB });
      }
      return null;
    },
    [maxSizeMB, t]
  );

  const handleFileSelect = useCallback(
    (file: File) => {
      setError(null);
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Notify parent
      onChange(null, file);
    },
    [validateFile, onChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (disabled) return;

      const file = e.dataTransfer.files[0];
      if (file) handleFileSelect(file);
    },
    [disabled, handleFileSelect]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) setDragOver(true);
    },
    [disabled]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFileSelect(file);
    },
    [handleFileSelect]
  );

  const handleUrlSubmit = useCallback(() => {
    if (!urlInput.trim()) return;
    setError(null);
    setPreviewUrl(null);
    onChange(urlInput.trim());
    setUrlInput('');
  }, [urlInput, onChange]);

  const handleRemove = useCallback(() => {
    setPreviewUrl(null);
    setUrlInput('');
    setError(null);
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [onChange]);

  const aspectRatioClass = {
    square: 'aspect-square',
    '16:9': 'aspect-video',
    free: 'min-h-[200px]',
  }[aspectRatio];

  return (
    <div className={cn('space-y-3', className)}>
      {/* Preview */}
      {displayUrl && (
        <div className={cn('relative rounded-lg overflow-hidden border bg-slate-50', aspectRatioClass)}>
          <Image
            src={displayUrl}
            alt="Preview"
            fill
            className="object-cover"
            unoptimized={displayUrl.startsWith('data:')}
          />
          {!disabled && (
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8"
              onClick={handleRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}

      {/* Upload/URL Tabs */}
      {!displayUrl && (
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'upload' | 'url')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload" disabled={disabled}>
              <Upload className="h-4 w-4 mr-2" />
              {t('imageUpload.tabUpload')}
            </TabsTrigger>
            <TabsTrigger value="url" disabled={disabled}>
              <LinkIcon className="h-4 w-4 mr-2" />
              {t('imageUpload.tabUrl')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="mt-3">
            <div
              className={cn(
                'border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer',
                dragOver ? 'border-primary bg-primary/5' : 'border-slate-200 hover:border-slate-300',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => !disabled && fileInputRef.current?.click()}
            >
              <Upload className="h-8 w-8 mx-auto mb-2 text-slate-400" />
              <p className="text-sm text-slate-600">
                {placeholder || t('imageUpload.dragDrop')}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {t('imageUpload.hint', { size: maxSizeMB })}
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept={ALLOWED_TYPES.join(',')}
              className="hidden"
              onChange={handleInputChange}
              disabled={disabled}
            />
          </TabsContent>

          <TabsContent value="url" className="mt-3">
            <div className="flex gap-2">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder={t('imageUpload.urlPlaceholder')}
                className="flex-1 px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={disabled}
                onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
              />
              <Button type="button" onClick={handleUrlSubmit} disabled={disabled || !urlInput.trim()}>
                {t('imageUpload.apply')}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}
    </div>
  );
}
