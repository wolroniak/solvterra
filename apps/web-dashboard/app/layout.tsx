import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { StoreProvider } from './providers';
import { ToastNotifications } from '@/components/ui/toast-notifications';
import { DashboardLayout } from '@/components/layout/dashboard-layout';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SolvTerra - NGO Dashboard',
  description: 'Verwaltungsoberfläche für NGOs auf SolvTerra',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body className={inter.className}>
        <StoreProvider>
          <DashboardLayout>{children}</DashboardLayout>
          <ToastNotifications />
        </StoreProvider>
      </body>
    </html>
  );
}
