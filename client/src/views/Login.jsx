import React from 'react';
import { Alert, Box, Button, Card, CardContent, Chip, Stack, TextField, Typography } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import InsightsIcon from '@mui/icons-material/Insights';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, errorMessage } from '../api/client.js';
import heroImage from '../assets/ats-hero-recruiter.png';
import { useAuth } from '../state/AuthContext.jsx';

export function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const auth = useAuth();
  const navigate = useNavigate();
  const mutation = useMutation({
    mutationFn: async () => (await api.post('/auth/login', form)).data,
    onSuccess: (data) => {
      auth.login(data);
      navigate(data.user.role === 'recruiter' ? '/recruiter' : '/applicant');
    }
  });
  return (
    <Box sx={{ minHeight: { md: 'calc(100vh - 180px)' }, display: 'grid', placeItems: 'center' }}>
      <Box
        sx={{
          width: '100%',
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1.05fr 0.95fr' },
          gap: { xs: 3, lg: 4 },
          alignItems: 'center'
        }}
      >
        <Box
          sx={{
            position: 'relative',
            overflow: 'hidden',
            minHeight: { xs: 360, md: 520 },
            borderRadius: 4,
            border: '1px solid rgba(148, 163, 184, 0.24)',
            backgroundImage: `linear-gradient(135deg, rgba(15,70,87,0.96), rgba(15,159,110,0.58)), url(${heroImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            boxShadow: '0 34px 110px rgba(15, 23, 42, 0.18)'
          }}
        >
          <Box
            className="soft-pulse"
            sx={{
              position: 'absolute',
              right: { xs: -70, md: 54 },
              top: { xs: -70, md: 46 },
              width: { xs: 170, md: 230 },
              height: { xs: 170, md: 230 },
              borderRadius: '50%',
              bgcolor: 'rgba(255,255,255,0.16)'
            }}
          />
          <Stack sx={{ position: 'relative', zIndex: 1, height: '100%', p: { xs: 3, md: 5 } }} justifyContent="space-between">
            <Box>
              <Chip icon={<LockOpenIcon />} label="TalentSignal access" sx={{ mb: 2.5, color: '#fff', bgcolor: 'rgba(255,255,255,0.16)', border: '1px solid rgba(255,255,255,0.22)', '& .MuiChip-icon': { color: '#fff' } }} />
              <Typography variant="h3" sx={{ maxWidth: 560, color: '#fff' }}>Return to your hiring signal.</Typography>
              <Typography sx={{ mt: 2, maxWidth: 520, color: 'rgba(255,255,255,0.78)', fontSize: 17, lineHeight: 1.65 }}>
                Pick up applications, scores, interviews, and profile updates from one focused workspace.
              </Typography>
            </Box>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 5 }}>
              <Card className="float-card" sx={{ width: { xs: '100%', sm: 230 }, bgcolor: 'rgba(255,255,255,0.92)' }}>
                <CardContent sx={{ p: 2.3 }}>
                  <Stack direction="row" spacing={1.4} alignItems="center">
                    <InsightsIcon color="primary" />
                    <Box>
                      <Typography variant="h5">86%</Typography>
                      <Typography variant="body2" color="text.secondary">Top match signal</Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
              <Card className="float-card float-card-delay" sx={{ width: { xs: '100%', sm: 230 }, bgcolor: 'rgba(255,255,255,0.9)' }}>
                <CardContent sx={{ p: 2.3 }}>
                  <Stack direction="row" spacing={1.4} alignItems="center">
                    <TrendingUpIcon color="secondary" />
                    <Box>
                      <Typography variant="h5">Live</Typography>
                      <Typography variant="body2" color="text.secondary">Pipeline updates</Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Stack>
        </Box>

        <Card sx={{ maxWidth: 500, width: '100%', mx: 'auto' }}>
          <CardContent sx={{ p: { xs: 3, md: 4.5 } }}>
            <Chip icon={<AutoAwesomeIcon />} label="Welcome back" color="primary" variant="outlined" sx={{ mb: 2 }} />
            <Typography variant="h4" gutterBottom>Sign in</Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>Access your recruiter or applicant workspace.</Typography>
            <Stack spacing={2} component="form" onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }}>
              {mutation.isError && <Alert severity="error">{errorMessage(mutation.error)}</Alert>}
              <TextField label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              <TextField label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
              <Button type="submit" variant="contained" size="large" disabled={mutation.isPending}>Sign in</Button>
              <Typography variant="body2" color="text.secondary">New here? <Link to="/register">Create an account</Link></Typography>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
