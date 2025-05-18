import { Theme, alpha } from "@mui/material";

export const tableContainerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

export const rowVariants = {
  hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 24
      }
}
};

export const modalStyle = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '90%', sm: 400 },
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
  p: { xs: 3, sm: 4 },
};

export const getStyles = (theme: Theme) => ({
  headerTypography: {
    fontWeight: 700,
    fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.5rem' },
    mb: 4,
    color: theme.palette.mode === 'dark' ? 'white' : 'rgba(0,0,0,0.87)',
    borderBottom: `2px solid ${theme.palette.primary.main}`,
    paddingBottom: 1,
    display: 'inline-block'
  },
  searchField: {
    width: { xs: "100%", sm: "80%" },
    '.MuiOutlinedInput-root': {
      borderRadius: 2,
      transition: 'all 0.3s ease',
      '&:hover': {
        boxShadow: '0 4px 8px rgba(0,0,0,0.07)'
      },
      '&.Mui-focused': {
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }
    }
  },
  tableContainer: {
    width: '100%',
    mb: 2,
    borderRadius: 2,
    overflow: 'hidden',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
  },
  tableHeader: {
    backgroundColor: (theme: Theme) => alpha(theme.palette.primary.main, 0.1)
  },
  tableHeaderCell: {
    fontWeight: 'bold',
    fontSize: '0.95rem',
    py: 2
  },
  actionsCellWidth: {
    width: { xs: 120, sm: 180 }
  },
  tableRow: {
    '&:hover': {
      backgroundColor: (theme: Theme) => alpha(theme.palette.primary.main, 0.04)
    },
    transition: 'background-color 0.2s ease'
  },
  paginationContainer: {
    mt: 4,
    display: 'flex',
    justifyContent: 'center',
    '& .MuiPaginationItem-root': {
      borderRadius: 1,
      transition: 'all 0.2s ease',
      '&.Mui-selected': {
        backgroundColor: (theme: Theme) => theme.palette.primary.main,
        color: 'white',
        fontWeight: 600,
      },
      '&:hover': {
        backgroundColor: (theme: Theme) => alpha(theme.palette.primary.main, 0.2),
      }
    }
  },
  button: {
    borderRadius: 1.5,
    textTransform: 'none'
  },
  buttonWithShadow: {
    borderRadius: 1.5,
    textTransform: 'none',
    boxShadow: 1
  },
  buttonWithPadding: {
    borderRadius: 1.5,
    textTransform: 'none',
    px: 3
  },
  inputBorderRadius: {
    borderRadius: 1.5
  },
  userIcon: {
    color: (theme: Theme) => alpha(theme.palette.primary.main, 0.7),
    opacity: 0.8
  }
});