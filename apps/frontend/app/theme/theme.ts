import { createTheme } from '@mui/material/styles';

const getTheme = (mode: 'light' | 'dark') => {
  const isDark = mode === 'dark';

  return createTheme({
    palette: {
      mode,
      primary: {
        main: '#3c096c',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#ffffff',
        contrastText: '#3c096c',
      },
      text: {
        primary: isDark ? '#ffffff' : '#000000',
        secondary: isDark ? '#bbbbbb' : '#444444',
        disabled: isDark ? '#666666' : '#aaaaaa',
      },
    },
    typography: {
      fontFamily: 'Roboto, sans-serif',
    },
    components: {
      MuiButton: {
        defaultProps: {
          variant: 'contained',
        },
        styleOverrides: {
          outlined: {
            color: isDark ? '#ffffff' : '#3c096c',
            borderColor: isDark ? '#ffffff' : '#3c096c',
            '&:hover': {
              backgroundColor: isDark
                ? 'rgba(255, 255, 255, 0.08)'
                : 'rgba(60, 9, 108, 0.04)',
              borderColor: isDark ? '#ffffff' : '#3c096c',
            },
          },
        },
      },
    },
  });
};

export default getTheme;
