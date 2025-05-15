import React from 'react';
import { Card, CardContent, Typography, Button, CardActionArea } from '@mui/material';

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
    <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <CardActionArea onClick={onClick}>
        <CardContent sx={{ flex: 1 }}>
          <Typography variant="h6" component="div" gutterBottom>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            {description}
          </Typography>
          <Button variant="contained" color="primary" sx={{ marginTop: 'auto' }}>
            {buttonText}
          </Button>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
