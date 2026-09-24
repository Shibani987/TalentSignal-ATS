import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#304ffe' },
    secondary: { main: '#536dfe' },
    background: { default: '#fbfaf7', paper: '#ffffff' },
    text: { primary: '#172033', secondary: '#657085' },
    divider: '#e8e3d8'
  },
  shape: { borderRadius: 8 },
  typography: {
    fontFamily: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Arial'].join(','),
    h1: { fontWeight: 750, letterSpacing: 0 },
    h2: { fontWeight: 740, letterSpacing: 0 },
    h3: { fontWeight: 720, letterSpacing: 0 },
    h4: { fontWeight: 720, letterSpacing: 0 },
    button: { textTransform: 'none', fontWeight: 700 }
  },
  components: {
    MuiCard: { styleOverrides: { root: { border: '1px solid #ebe6dc', boxShadow: '0 12px 36px rgba(25, 34, 55, 0.06)' } } },
    MuiButton: { styleOverrides: { root: { borderRadius: 8 } } },
    MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } }
  }
});
