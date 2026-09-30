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
      <AppBar
        position="sticky"
        color="inherit"
        elevation={0}
        sx={{
          borderBottom: '1px solid',
          borderColor: 'rgba(148, 163, 184, 0.22)',
          bgcolor: 'rgba(255,255,255,0.74)',
          backdropFilter: 'blur(18px)'
        }}
      >
        <Toolbar sx={{ gap: 1.5, py: 1, flexWrap: 'wrap' }}>
          <Stack component={Link} to="/" direction="row" alignItems="center" spacing={1.25} sx={{ mr: { xs: 0, md: 2 } }}>
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: 2,
                display: 'grid',
                placeItems: 'center',
                color: 'primary.main',
                bgcolor: 'rgba(21, 94, 117, 0.1)',
                border: '1px solid rgba(21, 94, 117, 0.16)'
              }}
            >
              <WorkOutlineIcon fontSize="small" />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={850} sx={{ lineHeight: 1 }}>TalentSignal</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' }, fontWeight: 700 }}>
                AI hiring workspace
              </Typography>
            </Box>
          </Stack>
          <Box sx={{ flex: 1 }} />
          <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', rowGap: 0.75, justifyContent: 'flex-end' }}>
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
          </Stack>
        </Toolbar>
      </AppBar>
      <Container className="page-content" maxWidth="xl" sx={{ py: { xs: 3, md: 5 } }}>
        <Outlet />
      </Container>
    </Box>
  );
}
