'use client'

import DashboardLayout from '../layouts/DashboardLayout';
import {withAuth} from '../components/withAuth'
import  TaskTable from '../components/Task/TaskTable'

const TaskPage: React.FC = () => {
  return (
    <DashboardLayout>

         <TaskTable />

    </DashboardLayout>
  );
}

export default withAuth(TaskPage, 'user')
