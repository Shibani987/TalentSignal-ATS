import React from 'react';
import { AppBar, Box, Button, Container, Stack, Toolbar, Typography } from '@mui/material';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import LogoutIcon from '@mui/icons-material/Logout';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../state/AuthContext.jsx';

export function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const dashboard = user?.role === 'recruiter' ? '/recruiter' : '/applicant';
  return (
    <Box className="page-shell">
      <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
        <Toolbar sx={{ gap: 2 }}>
          <Stack component={Link} to="/" direction="row" alignItems="center" spacing={1}>
            <WorkOutlineIcon color="primary" />
            <Typography variant="h6" fontWeight={800}>TalentSignal ATS</Typography>
          </Stack>
          <Box sx={{ flex: 1 }} />
          <Button component={Link} to="/">Jobs</Button>
          {user?.role === 'recruiter' && <Button component={Link} to="/recruiter/jobs">Manage Jobs</Button>}
          {user?.role === 'recruiter' && <Button component={Link} to="/recruiter/candidates">Candidates</Button>}
          {user && <Button component={Link} to={dashboard}>Dashboard</Button>}
          {user && <Button component={Link} to="/profile">Profile</Button>}
          {user ? (
            <Button startIcon={<LogoutIcon />} onClick={() => { logout(); navigate('/'); }}>Sign out</Button>
          ) : (
            <Button variant="contained" component={Link} to="/login">Sign in</Button>
          )}
        </Toolbar>
      </AppBar>
      <Container maxWidth="xl" sx={{ py: { xs: 3, md: 5 } }}>
        <Outlet />
      </Container>
    </Box>
  );
}
