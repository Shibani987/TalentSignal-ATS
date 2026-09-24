import React from 'react';
import { Alert, Box, Button, Card, CardContent, FormControl, InputLabel, MenuItem, Select, Stack, TextField, Typography } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, errorMessage } from '../api/client.js';
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
    <Box sx={{ maxWidth: 520, mx: 'auto' }}>
      <Card><CardContent sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>Create account</Typography>
        <Stack spacing={2} component="form" onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }}>
          {mutation.isError && <Alert severity="error">{errorMessage(mutation.error)}</Alert>}
          <TextField label="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <TextField label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <TextField label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required helperText="At least 8 characters" />
          <FormControl><InputLabel>Account type</InputLabel><Select label="Account type" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}><MenuItem value="applicant">Applicant</MenuItem><MenuItem value="recruiter">Recruiter</MenuItem></Select></FormControl>
          {form.role === 'recruiter' && <TextField label="Company name" value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} />}
          <Button type="submit" variant="contained" size="large" disabled={mutation.isPending}>Create account</Button>
        </Stack>
      </CardContent></Card>
    </Box>
  );
}
