'use client'

import DashboardLayout from '../../layouts/DashboardLayout';
import {withAuth} from '../../components/withAuth'
import  UserDashboard from '../../components/Dashboard/UserDashboard'

const UserPage: React.FC = () => {
  return (
    <DashboardLayout>

         <UserDashboard />

    </DashboardLayout>
  );
}

export default withAuth(UserPage, 'user')
