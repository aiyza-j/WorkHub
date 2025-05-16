import { createTheme } from '@mui/material/styles';

const getTheme = (mode: 'light' | 'dark') => {
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
          variant: 'contained', // Optional default, can remove if you want full defaults
        },
      },
    },
  });
};

export default getTheme;
