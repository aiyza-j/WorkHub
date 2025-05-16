'use client';

import { PropsWithChildren } from 'react';
import ThemeRegistry from './ThemeRegistry';
import { useThemeContext } from '../contexts/ThemeContext';

export default function ThemeRegistryWithContext({ children }: PropsWithChildren) {
  const { mode } = useThemeContext();

  return (
    <ThemeRegistry mode={mode}>
      {children}
    </ThemeRegistry>
  );
}