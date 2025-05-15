'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { withAuth } from '../../components/withAuth';
import AdminDashboard from '../../components/Dashboard/AdminDashboard';
import SkeletonLoading from '../../components/SkeletonLoading';

const DashboardPage: React.FC = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <DashboardLayout>
      {loading ? (
        <SkeletonLoading items={[
          { type: 'rectangular', width: '100%', height: 40 },
          { type: 'rectangular', width: '100%', height: 56 },
          { type: 'text', width: '100%', height: 24, count: 4 },
          { type: 'rectangular', width: '100%', height: 68, count: 5 },
        ]} />
      ) : (
        <AdminDashboard />
      )}
    </DashboardLayout>
  );
};

export default withAuth(DashboardPage, 'admin');
