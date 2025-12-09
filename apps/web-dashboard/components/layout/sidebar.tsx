'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ClipboardList,
  Inbox,
  BarChart3,
  Settings,
  LogOut,
  ChevronRight,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore, useSubmissionStore } from '@/store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Challenges', href: '/challenges', icon: ClipboardList },
  { name: 'Einreichungen', href: '/submissions', icon: Inbox, badge: true },
  { name: 'Community', href: '/community', icon: Users },
  { name: 'Statistiken', href: '/statistics', icon: BarChart3 },
];

const bottomNav = [
  { name: 'Einstellungen', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { organization, logout } = useAuthStore();
  const { pendingCount } = useSubmissionStore();

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-white">
      {/* Logo - SolvTerra brand */}
      <div className="flex h-16 items-center gap-3 border-b px-4">
        <Image
          src="/logo.png"
          alt="SolvTerra"
          width={140}
          height={48}
          className="h-10 w-auto object-contain"
          priority
        />
        <Badge variant="outline" className="ml-auto text-xs bg-cream-200 border-cream-300">
          NGO
        </Badge>
      </div>

      {/* Organization Info */}
      {organization && (
        <div className="border-b p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={organization.logo} alt={organization.name} />
              <AvatarFallback>{organization.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">
                {organization.name}
              </p>
              <p className="text-xs text-slate-500 truncate">
                {organization.email}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
              {item.badge && pendingCount > 0 && (
                <Badge
                  variant="destructive"
                  className="ml-auto h-5 min-w-5 flex items-center justify-center text-xs"
                >
                  {pendingCount}
                </Badge>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Navigation */}
      <div className="border-t p-4 space-y-1">
        {bottomNav.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
        <button
          onClick={() => logout()}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Abmelden
        </button>
      </div>
    </div>
  );
}
