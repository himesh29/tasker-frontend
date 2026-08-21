'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { SidebarInset } from '@/components/ui/sidebar';
import { useAuth } from '@/providers/auth-provider';

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isSettings = pathname.startsWith('/settings');
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isLoading, isAuthenticated, router]);
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-sm text-muted-foreground animate-pulse">Loading workspace...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // useEffect above handles the redirect
  }

  return (
    <>
      {!isSettings && <AppSidebar />}
      <SidebarInset>{children}</SidebarInset>
    </>
  );
}
