'use client';

import { useSession } from '../hooks/useSession';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const DashboardRedirect = () => {
  const { session, loading } = useSession();
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (loading) return;

    setRedirecting(true);

    if (!session) {
      router.replace('/login');
      return;
    }

    const redirect = async () => {

      await new Promise(resolve => setTimeout(resolve, 100));

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
    };

    redirect();
  }, [session, loading, router]);

  if (loading || redirecting) {
    return null;
  }

  return null;
};

export default DashboardRedirect;