'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { withAuth } from '../../components/withAuth';
import UserDashboard from '../../components/Dashboard/UserDashboard';
import SkeletonLoading from '../../components/SkeletonLoading';

const UserPage: React.FC = () => {
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
        <UserDashboard />
      )}
    </DashboardLayout>
  );
};

export default withAuth(UserPage, 'user');
