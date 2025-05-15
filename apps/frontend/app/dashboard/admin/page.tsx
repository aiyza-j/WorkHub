'use client'

import DashboardLayout from '../../layouts/DashboardLayout';
import {withAuth} from '../../components/withAuth'
import AdminDashboard from '../../components/Dashboard/AdminDashboard'

const DashboardPage: React.FC = () => {
  return (
    <DashboardLayout>
     <AdminDashboard/>
    </DashboardLayout>
  );
}

export default withAuth(DashboardPage, 'admin')
