'use client';

import { useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

function SettingsRouteContent() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    const isAdmin =
      user.roles?.some((r) => r.toUpperCase() === 'ADMIN' || r.toUpperCase() === 'COMPANY_ADMIN') ||
      user.role?.toUpperCase() === 'ADMIN' ||
      user.role?.toUpperCase() === 'COMPANY_ADMIN';

    if (!isAdmin) {
      // Forbidden for non-admins (both PM and ESG Team)
      router.replace('/?tab=dashboard&denied=1');
      return;
    }
    router.replace('/?tab=settings');
  }, [user, isLoading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-[#0F172A]">
      <div className="w-5 h-5 border-2 border-sky-600/30 border-t-sky-600 rounded-full animate-spin" />
    </div>
  );
}

export default function SettingsRoute() {
  return (
    <Suspense fallback={null}>
      <SettingsRouteContent />
    </Suspense>
  );
}
