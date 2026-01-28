'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAdminAuthStore } from '@/store/adminStore';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { Loader2 } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading, checkSession } = useAdminAuthStore();

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  // Don't redirect on login page
  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated && !isLoginPage) {
      router.push('/admin/login');
    }
  }, [isAuthenticated, isLoading, isLoginPage, router]);

  // Show loading on protected pages
  if (isLoading && !isLoginPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  // If not authenticated and not on login page, show loading while redirecting
  if (!isAuthenticated && !isLoginPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  // Login page doesn't need the sidebar
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Authenticated admin pages get the full layout
  return (
    <div className="flex h-screen bg-slate-900">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto bg-slate-900">
          {children}
        </main>
      </div>
    </div>
  );
}
