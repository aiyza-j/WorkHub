import React from 'react';
import { Card, CardContent, Typography, Button, CardActionArea, Box } from '@mui/material';

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
    <Card sx={{ display: 'flex', flexDirection: 'row', height: '100%', width: '100%' }}>
      <CardActionArea onClick={onClick}>
        <CardContent sx={{ flex: 1 }}>
          <Typography variant="h6" component="div" gutterBottom>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </CardContent>
      </CardActionArea>

      <Box sx={{ padding: 2, pt: 0, mt:2 }}>
        <Button variant="contained" color="primary" fullWidth onClick={onClick}>
          {buttonText}
        </Button>
      </Box>
    </Card>
  );
}
