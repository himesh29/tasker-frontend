'use client';

import { usePathname } from 'next/navigation';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { SidebarInset } from '@/components/ui/sidebar';

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isSettings = pathname.startsWith('/settings');

  return (
    <>
      {!isSettings && <AppSidebar />}
      <SidebarInset>{children}</SidebarInset>
    </>
  );
}
