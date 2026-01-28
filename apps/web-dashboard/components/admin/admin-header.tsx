'use client';

import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdminHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function AdminHeader({ title, description, action }: AdminHeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-700 bg-slate-800 px-6">
      <div>
        <h1 className="text-xl font-semibold text-white">{title}</h1>
        {description && (
          <p className="text-sm text-slate-400">{description}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        {action}

        <Button
          variant="outline"
          size="icon"
          className="relative border-slate-600 bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500 text-xs text-white">
            3
          </span>
        </Button>
      </div>
    </header>
  );
}
