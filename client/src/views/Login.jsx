import React from 'react';
import { Alert, Box, Button, Card, CardContent, Stack, TextField, Typography } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, errorMessage } from '../api/client.js';
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
    <Box sx={{ maxWidth: 460, mx: 'auto' }}>
      <Card><CardContent sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>Sign in</Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>Access your recruiting or applicant workspace.</Typography>
        <Stack spacing={2} component="form" onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }}>
          {mutation.isError && <Alert severity="error">{errorMessage(mutation.error)}</Alert>}
          <TextField label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <TextField label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          <Button type="submit" variant="contained" size="large" disabled={mutation.isPending}>Sign in</Button>
          <Typography variant="body2">New here? <Link to="/register">Create an account</Link></Typography>
        </Stack>
      </CardContent></Card>
    </Box>
  );
}
