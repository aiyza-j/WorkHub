'use client';

import { ThemeProvider, CssBaseline } from '@mui/material';
import { PropsWithChildren, useMemo } from 'react';
import getTheme from './theme';

interface ThemeRegistryProps {
  mode: 'light' | 'dark';
}

export default function ThemeRegistry({ children, mode }: PropsWithChildren<ThemeRegistryProps>) {
  const theme = useMemo(() => getTheme(mode), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}