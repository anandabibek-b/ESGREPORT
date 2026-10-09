'use client';

import { useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

function ValidationRouteContent() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    const isProjectManager =
      user.roles?.some((r) => r.toUpperCase() === 'PROJECT_MANAGER') ||
      user.role?.toUpperCase() === 'PROJECT_MANAGER';

    if (isProjectManager) {
      router.replace('/?tab=questionnaire&denied=1');
      return;
    }
    router.replace('/?tab=validation');
  }, [user, isLoading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-[#0F172A]">
      <div className="w-5 h-5 border-2 border-sky-600/30 border-t-sky-600 rounded-full animate-spin" />
    </div>
  );
}

export default function ValidationRoute() {
  return (
    <Suspense fallback={null}>
      <ValidationRouteContent />
    </Suspense>
  );
}
