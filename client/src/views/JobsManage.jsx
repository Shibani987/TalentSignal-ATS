import React from 'react';
import { Alert, Box, Button, Card, CardContent, Grid, MenuItem, Stack, TextField, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { api, errorMessage } from '../api/client.js';
import { ErrorState, LoadingState } from '../ui/StateViews.jsx';

const emptyJob = { title: '', company: '', location: '', workMode: 'hybrid', employmentType: 'full-time', description: '', responsibilities: '', requiredSkills: '', experienceRequirements: '', status: 'draft' };

export function JobsManage() {
  const [form, setForm] = useState(emptyJob);
  const qc = useQueryClient();
  const { data, isLoading, isError, error } = useQuery({ queryKey: ['my-jobs'], queryFn: async () => (await api.get('/jobs/mine')).data });
  const create = useMutation({
    mutationFn: async () => (await api.post('/jobs', { ...form, responsibilities: form.responsibilities.split('\n').filter(Boolean), requiredSkills: form.requiredSkills.split(',').map((s) => s.trim()).filter(Boolean) })).data,
    onSuccess: () => { setForm(emptyJob); qc.invalidateQueries({ queryKey: ['my-jobs'] }); }
  });
  const status = useMutation({ mutationFn: async ({ id, value }) => (await api.patch(`/jobs/${id}/status`, { status: value })).data, onSuccess: () => qc.invalidateQueries({ queryKey: ['my-jobs'] }) });
  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState message={errorMessage(error)} />;
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} lg={5}>
        <Card><CardContent sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>Create job</Typography>
          <Stack spacing={2}>
            {create.isError && <Alert severity="error">{errorMessage(create.error)}</Alert>}
            <TextField label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <TextField label="Company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
            <TextField label="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            <TextField select label="Work mode" value={form.workMode} onChange={(e) => setForm({ ...form, workMode: e.target.value })}><MenuItem value="remote">Remote</MenuItem><MenuItem value="hybrid">Hybrid</MenuItem><MenuItem value="onsite">Onsite</MenuItem></TextField>
            <TextField label="Required skills" helperText="Comma separated" value={form.requiredSkills} onChange={(e) => setForm({ ...form, requiredSkills: e.target.value })} />
            <TextField label="Description" multiline minRows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <TextField label="Responsibilities" multiline minRows={3} value={form.responsibilities} onChange={(e) => setForm({ ...form, responsibilities: e.target.value })} />
            <TextField label="Experience requirements" value={form.experienceRequirements} onChange={(e) => setForm({ ...form, experienceRequirements: e.target.value })} />
            <Button startIcon={<AddIcon />} variant="contained" onClick={() => create.mutate()} disabled={create.isPending}>Create job</Button>
          </Stack>
        </CardContent></Card>
      </Grid>
      <Grid item xs={12} lg={7}>
        <Stack spacing={2}>
          <Typography variant="h4">Your jobs</Typography>
          {data.items.map((job) => (
            <Card key={job._id}><CardContent>
              <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2}>
                <Box><Typography variant="h6">{job.title}</Typography><Typography color="text.secondary">{job.status} · {job.applicationCount} applications</Typography></Box>
                <Stack direction="row" spacing={1}><Button onClick={() => status.mutate({ id: job._id, value: 'published' })}>Publish</Button><Button onClick={() => status.mutate({ id: job._id, value: 'archived' })}>Archive</Button></Stack>
              </Stack>
            </CardContent></Card>
          ))}
        </Stack>
      </Grid>
    </Grid>
  );
}
