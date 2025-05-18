'use client'

import { Suspense, lazy } from 'react';
import Loading from '../components/loading'; 


const DashboardRedirect = lazy(() => import('./DashboardRedirect'));


export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<Loading />}>
        <DashboardRedirect />
      </Suspense>
    </div>
  );
}