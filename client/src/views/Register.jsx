import React from 'react';
import { Alert, Box, Button, Card, CardContent, Chip, FormControl, InputLabel, MenuItem, Select, Stack, TextField, Typography } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, errorMessage } from '../api/client.js';
import heroImage from '../assets/ats-hero-recruiter.png';
import { useAuth } from '../state/AuthContext.jsx';

export function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'applicant', companyName: '' });
  const auth = useAuth();
  const navigate = useNavigate();
  const mutation = useMutation({
    mutationFn: async () => (await api.post('/auth/register', form)).data,
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
          gridTemplateColumns: { xs: '1fr', lg: '0.95fr 1.05fr' },
          gap: { xs: 3, lg: 4 },
          alignItems: 'center'
        }}
      >
        <Card sx={{ maxWidth: 540, width: '100%', mx: 'auto', order: { xs: 2, lg: 1 } }}>
          <CardContent sx={{ p: { xs: 3, md: 4.5 } }}>
            <Chip icon={<HowToRegIcon />} label="Join TalentSignal" color="primary" variant="outlined" sx={{ mb: 2 }} />
            <Typography variant="h4" gutterBottom>Create account</Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>Set up a focused workspace for job search or hiring.</Typography>
            <Stack spacing={2} component="form" onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }}>
              {mutation.isError && <Alert severity="error">{errorMessage(mutation.error)}</Alert>}
              <TextField label="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              <TextField label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              <TextField label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required helperText="At least 8 characters" />
              <FormControl>
                <InputLabel>Account type</InputLabel>
                <Select label="Account type" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  <MenuItem value="applicant">Applicant</MenuItem>
                  <MenuItem value="recruiter">Recruiter</MenuItem>
                </Select>
              </FormControl>
              {form.role === 'recruiter' && <TextField label="Company name" value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} />}
              <Button type="submit" variant="contained" size="large" disabled={mutation.isPending}>Create account</Button>
              <Typography variant="body2" color="text.secondary">Already registered? <Link to="/login">Sign in</Link></Typography>
            </Stack>
          </CardContent>
        </Card>

        <Box
          sx={{
            position: 'relative',
            overflow: 'hidden',
            minHeight: { xs: 390, md: 540 },
            borderRadius: 4,
            border: '1px solid rgba(148, 163, 184, 0.24)',
            backgroundImage: `linear-gradient(135deg, rgba(124,45,18,0.92), rgba(21,94,117,0.7)), url(${heroImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            boxShadow: '0 34px 110px rgba(15, 23, 42, 0.18)',
            order: { xs: 1, lg: 2 }
          }}
        >
          <Box
            className="soft-pulse"
            sx={{
              position: 'absolute',
              right: { xs: -74, md: 54 },
              top: { xs: -74, md: 52 },
              width: { xs: 190, md: 250 },
              height: { xs: 190, md: 250 },
              borderRadius: '50%',
              bgcolor: 'rgba(255,255,255,0.15)'
            }}
          />
          <Stack sx={{ position: 'relative', zIndex: 1, height: '100%', p: { xs: 3, md: 5 } }} justifyContent="space-between">
            <Box>
              <Chip icon={<AutoAwesomeIcon />} label="AI-powered hiring flow" sx={{ mb: 2.5, color: '#fff', bgcolor: 'rgba(255,255,255,0.16)', border: '1px solid rgba(255,255,255,0.22)', '& .MuiChip-icon': { color: '#fff' } }} />
              <Typography variant="h3" sx={{ maxWidth: 570, color: '#fff' }}>Start with the right workspace.</Typography>
              <Typography sx={{ mt: 2, maxWidth: 520, color: 'rgba(255,255,255,0.78)', fontSize: 17, lineHeight: 1.65 }}>
                Applicants track opportunities while recruiters publish roles, review scores, and move candidates forward.
              </Typography>
            </Box>
            <Stack spacing={2} sx={{ mt: 5, maxWidth: 430 }}>
              <Card className="float-card" sx={{ bgcolor: 'rgba(255,255,255,0.92)' }}>
                <CardContent sx={{ p: 2.3 }}>
                  <Stack direction="row" spacing={1.4} alignItems="center">
                    <PersonSearchIcon color="primary" />
                    <Box>
                      <Typography variant="h6">Applicant</Typography>
                      <Typography variant="body2" color="text.secondary">Resume uploads and application history.</Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
              <Card className="float-card float-card-delay" sx={{ ml: { xs: 0, sm: 6 }, bgcolor: 'rgba(255,255,255,0.9)' }}>
                <CardContent sx={{ p: 2.3 }}>
                  <Stack direction="row" spacing={1.4} alignItems="center">
                    <BusinessCenterIcon color="secondary" />
                    <Box>
                      <Typography variant="h6">Recruiter</Typography>
                      <Typography variant="body2" color="text.secondary">Job publishing and ranked candidates.</Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
              <Card className="float-card" sx={{ ml: { xs: 0, sm: 12 }, bgcolor: 'rgba(255,255,255,0.92)' }}>
                <CardContent sx={{ p: 2.3 }}>
                  <Stack direction="row" spacing={1.4} alignItems="center">
                    <AccountCircleIcon color="success" />
                    <Box>
                      <Typography variant="h6">Profile ready</Typography>
                      <Typography variant="body2" color="text.secondary">Skills, resume, and analysis in one place.</Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
