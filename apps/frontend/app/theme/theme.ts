import { createTheme } from '@mui/material/styles';

const getTheme = (mode: 'light' | 'dark') => {
  const isDark = mode === 'dark';

  return createTheme({
    palette: {
      mode,
      primary: {
        main: '#3c096c',
        light: isDark ? '#6e35a3' : '#5a1f9e',
        dark: isDark ? '#2a0550' : '#2a0550',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#ffffff',
        light: '#ffffff',
        dark: '#f0f0f0',
        contrastText: '#3c096c',
      },
      background: {
        default: isDark ? '#121212' : '#f8f9fa',
        paper: isDark ? '#1e1e1e' : '#ffffff',
      },
      text: {
        primary: isDark ? '#ffffff' : '#212121',
        secondary: isDark ? '#bbbbbb' : '#5f5f5f',
        disabled: isDark ? '#666666' : '#aaaaaa',
      },
      divider: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
    },
    typography: {
      fontFamily: '"DM Mono", "Inter", "Roboto", "Arial", sans-serif;',
      h1: {
        fontWeight: 700,
      },
      h2: {
        fontWeight: 700,
      },
      h3: {
        fontWeight: 600,
      },
      h4: {
        fontWeight: 600,
      },
      h5: {
        fontWeight: 500,
      },
      h6: {
        fontWeight: 500,
      },
      button: {
        fontWeight: 600,
        textTransform: 'none',
      },
    },
    shape: {
      borderRadius: 10,
    },
    spacing: (factor: number) => `${0.25 * factor}rem`,
    components: {
      MuiButton: {
        defaultProps: {
          variant: 'contained',
          disableElevation: true,
        },
        styleOverrides: {
          root: {
            padding: '0.5rem 1.25rem',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)',
            },
          },
          contained: {
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
          },
          outlined: {
            color: isDark ? '#ffffff' : '#3c096c',
            borderColor: isDark ? '#ffffff' : '#3c096c',
            borderWidth: '1.5px',
            '&:hover': {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(60, 9, 108, 0.04)',
              borderColor: isDark ? '#ffffff' : '#3c096c',
              borderWidth: '1.5px',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: '12px',
            boxShadow: isDark
              ? '0 4px 20px rgba(0, 0, 0, 0.3)'
              : '0 4px 20px rgba(0, 0, 0, 0.05)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: isDark
                ? '0 10px 30px rgba(0, 0, 0, 0.4)'
                : '0 10px 30px rgba(0, 0, 0, 0.1)',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: '12px',
            transition: 'box-shadow 0.3s ease',
          },
          elevation1: {
            boxShadow: isDark
              ? '0 2px 10px rgba(0, 0, 0, 0.3)'
              : '0 2px 10px rgba(0, 0, 0, 0.05)',
          },
          elevation3: {
            boxShadow: isDark
              ? '0 4px 20px rgba(0, 0, 0, 0.4)'
              : '0 4px 20px rgba(0, 0, 0, 0.08)',
          },
        },
      },
      MuiTableContainer: {
        styleOverrides: {
          root: {
            borderRadius: '12px',
            overflow: 'hidden',
          },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? 'rgba(60, 9, 108, 0.3)' : 'rgba(60, 9, 108, 0.05)',
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            transition: 'background-color 0.2s ease',
            '&:hover': {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(60, 9, 108, 0.04)',
            },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
              '&:hover': {
                borderColor: '#3c096c',
              },
              '&.Mui-focused': {
                boxShadow: isDark
                  ? '0 0 0 2px rgba(110, 53, 163, 0.3)'
                  : '0 0 0 2px rgba(60, 9, 108, 0.2)',
              },
            },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: 'none',
          },
        },
      },
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            scrollbarWidth: 'thin',
            scrollbarColor: isDark ? '#6e35a3 #1e1e1e' : '#5a1f9e #f8f9fa',
            '&::-webkit-scrollbar': {
              width: '8px',
              height: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: isDark ? '#1e1e1e' : '#f8f9fa',
            },
            '&::-webkit-scrollbar-thumb': {
              background: isDark ? '#6e35a3' : '#5a1f9e',
              borderRadius: '4px',
            },
          },
        },
      },
    },
  });
};

export default getTheme;