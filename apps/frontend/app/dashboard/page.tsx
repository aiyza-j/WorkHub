'use client'

import dynamic from 'next/dynamic';

const DashboardRedirect = dynamic(() => import('./DashboardRedirect'), { ssr: false });

export default function DashboardPage() {
  return <DashboardRedirect />;
}
