'use client'

import dynamic from 'next/dynamic';
import DashboardLayout from '../layouts/DashboardLayout';
import { withAuth } from '../components/withAuth'
import { Box, Typography, Container, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import Loading from '../components/loading';
const TaskTable = dynamic(() => import('../components/Task/TaskTable'), {
  loading: () => <Loading />,
  ssr: false 
});

const TaskPage: React.FC = () => {
  const theme = useTheme();

  return (
    <DashboardLayout>
      <Container maxWidth="lg">
        <Box sx={{ mb: 4, mt: { xs: 2, sm: 3 } }}>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              sx={{
                fontWeight: 700,
                fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.5rem' },
                mb: 3,
                color: theme.palette.mode === 'dark' ? 'white' : 'rgba(0,0,0,0.87)',
                borderBottom: `2px solid ${theme.palette.primary.main}`,
                paddingBottom: 1,
                display: 'inline-block'
              }}
            >
              My Tasks
            </Typography>
          </motion.div>
        </Box>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <TaskTable />
        </motion.div>
      </Container>
    </DashboardLayout>
  );
}

export default withAuth(TaskPage, 'user')