import DashboardLayout from '../layouts/DashboardLayout';
import { Typography, Box } from '@mui/material';

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="body1">Here is your content</Typography>
      </Box>
    </DashboardLayout>
  );
}
