'use client';

import { ThemeProvider, CssBaseline } from '@mui/material';
import { PropsWithChildren } from 'react';
import getTheme from './theme';

interface ThemeRegistryProps {
  mode: 'light' | 'dark';
}

export default function ThemeRegistry({ children, mode }: PropsWithChildren<ThemeRegistryProps>) {
  return (
    <ThemeProvider theme={getTheme(mode)}> 
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
