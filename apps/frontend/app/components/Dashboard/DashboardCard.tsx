import React from 'react';
import { Card, CardContent, Typography, Button, Box } from '@mui/material';
import { motion } from 'framer-motion';

interface DashboardCardProps {
  title: string;
  description: string;
  buttonText: string;
  onClick: () => void;
}

export default function DashboardCard({
  title,
  description,
  buttonText,
  onClick,
}: DashboardCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
      style={{ height: '100%', width: '100%' }}
    >
      <Card
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          height: '100%',
          width: '100%',
          borderRadius: 2,
          overflow: 'hidden',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
          transition: 'box-shadow 0.3s ease',
          '&:hover': {
            boxShadow: '0 8px 16px rgba(0,0,0,0.12)',
          }
        }}
      >
        <Box
          component={motion.div}
          whileTap={{ scale: 0.98 }}
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            cursor: 'pointer',
            p: 2
          }}
          onClick={onClick}
        >
          <CardContent sx={{ flex: 1, p: { xs: 2, sm: 3 } }}>
            <Typography
              variant="h6"
              component={motion.div}
              sx={{
                fontWeight: 600,
                mb: 1.5
              }}
            >
              {title}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ opacity: 0.85 }}
            >
              {description}
            </Typography>
          </CardContent>
        </Box>

        <Box sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: { xs: 'flex-start', sm: 'center' }
        }}>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="contained"
              color="primary"
              onClick={onClick}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                px: 3,
                fontWeight: 500,
                boxShadow: 2
              }}
            >
              {buttonText}
            </Button>
          </motion.div>
        </Box>
      </Card>
    </motion.div>
  );
}