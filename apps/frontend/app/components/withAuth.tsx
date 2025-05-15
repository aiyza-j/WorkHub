'use client';

import React, { ComponentType, useEffect } from 'react';
import { useSession } from '../hooks/useSession';
import { useRouter } from 'next/navigation';

export function withAuth<T extends {}>(WrappedComponent: ComponentType<T>, requiredRole?: string) {
  const ComponentWithAuth = (props: T) => {
    const { session, loading } = useSession();
    const router = useRouter();

    useEffect(() => {
      if (!loading) {
        if (!session) {
          router.replace('/login');
        } else if (requiredRole && session.role !== requiredRole) {
          router.replace('/');
        }
      }
    }, [session, loading, router]);

    if (loading || !session || (requiredRole && session.role !== requiredRole)) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };

  return ComponentWithAuth;
}
