import { alpha, Theme } from '@mui/material/styles';
import { PaletteColor } from '@mui/material/styles';

export const modalStyle = {
  position: 'absolute' as const,
  top: '30%',
  left: '40%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '90%', sm: 400 },
  bgcolor: 'background.paper',
  p: 4,
  borderRadius: 2,
  boxShadow: 24,
};

export const tableHeaderStyle = {
  backgroundColor: (theme: Theme) => alpha(theme.palette.primary.main, 0.05),
  fontWeight: 'bold',
  whiteSpace: 'nowrap' as const,
};

export const statusBadgeStyle = (theme: Theme, status: string) => {
  const colorMap: Record<string, PaletteColor> = {
    completed: theme.palette.success,
    'in-progress': theme.palette.warning,
    open: theme.palette.info,
  };

  return {
    display: 'inline-block',
    px: 1.5,
    py: 0.5,
    borderRadius: 6,
    backgroundColor: alpha(colorMap[status]?.main || theme.palette.info.main, 0.2),
    color: colorMap[status]?.dark || theme.palette.info.dark,
    fontWeight: 'medium',
    fontSize: '0.8rem',
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  };
};

export const actionButtonStyle = () => {
  return {
    backgroundColor: alpha("#3c096c", 0.1),
    '&:hover': {
      backgroundColor: alpha("#3c096c", 0.2),
    },
  };
};