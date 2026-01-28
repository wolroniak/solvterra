'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  ShieldCheck,
  MessageSquare,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAdminAuthStore } from '@/store/adminStore';
import { Badge } from '@/components/ui/badge';

export function AdminSidebar() {
  const pathname = usePathname();
  const { admin, logout } = useAdminAuthStore();
  const { t } = useTranslation('admin');

  const navigation = [
    { name: t('sidebar.dashboard'), href: '/admin', icon: LayoutDashboard },
    { name: t('sidebar.verification'), href: '/admin/verifications', icon: ShieldCheck },
    { name: t('sidebar.tickets'), href: '/admin/tickets', icon: MessageSquare },
  ];

  return (
    <div className="flex h-screen w-64 flex-col border-r border-slate-700 bg-slate-800">
      {/* Logo - SolvTerra Admin */}
      <div className="flex h-16 items-center gap-3 border-b border-slate-700 px-4">
        <Image
          src="/logo.png"
          alt="SolvTerra"
          width={140}
          height={48}
          className="h-10 w-auto object-contain brightness-0 invert"
          priority
        />
        <Badge className="ml-auto text-xs bg-indigo-600 hover:bg-indigo-600 text-white border-0">
          Admin
        </Badge>
      </div>

      {/* Admin Info */}
      {admin && (
        <div className="border-b border-slate-700 p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center">
              <span className="text-white font-medium">
                {admin.name?.[0] || admin.email[0].toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {admin.name || 'Admin'}
              </p>
              <p className="text-xs text-slate-400 truncate">
                {admin.email}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/admin' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Navigation */}
      <div className="border-t border-slate-700 p-4">
        <button
          onClick={() => logout()}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
        >
          <LogOut className="h-5 w-5" />
          {t('sidebar.logout')}
        </button>
      </div>
    </div>
  );
}
