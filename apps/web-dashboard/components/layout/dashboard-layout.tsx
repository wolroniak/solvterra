'use client';

import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store';
import { Sidebar } from './sidebar';
import { VerificationBanner } from '../verification-banner';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isAuthenticated } = useAuthStore();

  // Don't show sidebar on login page, register page, admin pages, or when not authenticated
  const isPublicPage = pathname === '/login' || pathname === '/register';
  const isAdminPage = pathname.startsWith('/admin');
  const showSidebar = isAuthenticated && !isPublicPage && !isAdminPage;

  if (!showSidebar) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <VerificationBanner />
        <main className="flex-1 overflow-auto bg-slate-50">
          {children}
        </main>
      </div>
    </div>
  );
}
