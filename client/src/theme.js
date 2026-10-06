import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#155e75', dark: '#0f4657', light: '#e0f2fe' },
    secondary: { main: '#f97316', dark: '#c2410c', light: '#ffedd5' },
    success: { main: '#0f9f6e' },
    background: { default: '#f6f8fb', paper: '#ffffff' },
    text: { primary: '#102033', secondary: '#657387' },
    divider: '#dfe7ef'
  },
  shape: { borderRadius: 8 },
  typography: {
    fontFamily: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Arial'].join(','),
    h1: { fontWeight: 800, letterSpacing: 0 },
    h2: { fontWeight: 800, letterSpacing: 0 },
    h3: { fontWeight: 780, letterSpacing: 0, lineHeight: 1.08 },
    h4: { fontWeight: 760, letterSpacing: 0 },
    h5: { fontWeight: 740, letterSpacing: 0 },
    h6: { fontWeight: 730, letterSpacing: 0 },
    button: { textTransform: 'none', fontWeight: 700 }
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          border: '1px solid rgba(148, 163, 184, 0.22)',
          boxShadow: '0 16px 46px rgba(15, 23, 42, 0.07)',
          backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,0.98), rgba(255,255,255,0.94))',
          backdropFilter: 'blur(14px)',
          transition: 'transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease'
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: 'none',
          minHeight: 40
        },
        contained: {
          backgroundImage: 'linear-gradient(135deg, #155e75, #0f9f6e)',
          '&:hover': {
            boxShadow: '0 14px 32px rgba(21, 94, 117, 0.28)'
          }
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 700,
          borderColor: 'rgba(21, 94, 117, 0.18)'
        }
      }
    },
    MuiTextField: {
      defaultProps: { variant: 'outlined' },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'rgba(255,255,255,0.9)',
            borderRadius: 8
          },
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(148, 163, 184, 0.34)'
          },
          '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(21, 94, 117, 0.42)'
          }
        }
      }
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(21, 94, 117, 0.1)',
          overflow: 'hidden'
        },
        bar: {
          backgroundImage: 'linear-gradient(90deg, #155e75, #0f9f6e, #f97316)'
        }
      }
    },
    MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } }
  }
});
