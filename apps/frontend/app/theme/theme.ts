import { createTheme } from '@mui/material/styles';

const getTheme = (mode: 'light' | 'dark') => {
  return createTheme({
    palette: {
      mode,
      primary: {
        main: '#ffffff',
        contrastText: '#3c096c',
      },
      secondary: {
        main: '#3c096c',
        contrastText: '#ffffff',
      },
      text: {
        primary: mode === 'light' ? '#000000' : '#ffffff',
        secondary: mode === 'light' ? '#444444' : '#bbbbbb',
        disabled: mode === 'light' ? '#aaaaaa' : '#666666',
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
            color: mode === 'dark' ? '#ffffff' : '#3c096c',
            borderColor: mode === 'dark' ? '#ffffff' : '#3c096c',
            '&:hover': {
              borderColor: mode === 'dark' ? '#ffffff' : '#3c096c',
              backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(60, 9, 108, 0.04)',
            },
          },
        },
      },
    },
  });
};

export default getTheme;
