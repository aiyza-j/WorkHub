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
      },
    },
  });
};

export default getTheme;
