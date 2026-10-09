'use client';

import { useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

function ProjectsRouteContent() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    router.replace('/?tab=organizations');
  }, [user, isLoading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-[#0F172A]">
      <div className="w-5 h-5 border-2 border-sky-600/30 border-t-sky-600 rounded-full animate-spin" />
    </div>
  );
}

export default function ProjectsRoute() {
  return (
    <Suspense fallback={null}>
      <ProjectsRouteContent />
    </Suspense>
  );
}
