'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useSession } from '../hooks/useSession';

const DashboardRedirect = () => {
  const { session, loading } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!session) {
      router.replace('/login');
      return;
    }

    switch (session.role) {
      case 'admin':
        router.replace('/dashboard/admin');
        break;
      case 'user':
        router.replace('/dashboard/user');
        break;
      default:
        router.replace('/login');
    }
  }, [session, loading, router]);

  return null;
};

export default DashboardRedirect;
