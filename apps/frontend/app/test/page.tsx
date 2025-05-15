'use client';

import React, { Suspense, lazy } from 'react';
import ErrorBoundary from '../components/ErrorBoundary';
import LoadingSkeleton from '../components/SkeletonLoading';

const HeavyComponent = lazy(() => import('../components/HeavyComponent'));

const TestPage = () => {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingSkeleton />}>
        <HeavyComponent />
      </Suspense>
    </ErrorBoundary>
  );
};

export default TestPage;
