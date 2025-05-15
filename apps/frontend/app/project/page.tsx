'use client'

import DashboardLayout from '../layouts/DashboardLayout';
import {withAuth} from '../components/withAuth'
import  ProjectTable from '../components/Project/ProjectTable'

const ProjectPage: React.FC = () => {
  return (
    <DashboardLayout>

         <ProjectTable />

    </DashboardLayout>
  );
}

export default withAuth(ProjectPage, 'user')
