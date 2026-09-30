import React from 'react';
import { Alert, Box, Button, Card, CardContent, Chip, Grid, MenuItem, Stack, TextField, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { api, errorMessage } from '../api/client.js';
import { ErrorState, LoadingState } from '../ui/StateViews.jsx';
import { MetricCard, PageHero } from '../ui/PageSurfaces.jsx';

const emptyJob = { title: '', company: '', location: '', workMode: 'hybrid', employmentType: 'full-time', description: '', responsibilities: '', requiredSkills: '', experienceRequirements: '', status: 'draft' };

export function JobsManage() {
  const [form, setForm] = useState(emptyJob);
  const qc = useQueryClient();
  const { data, isLoading, isError, error } = useQuery({ queryKey: ['my-jobs'], queryFn: async () => (await api.get('/jobs/mine')).data });
  const create = useMutation({
    mutationFn: async () => (await api.post('/jobs', { ...form, responsibilities: form.responsibilities.split('\n').filter(Boolean), requiredSkills: form.requiredSkills.split(',').map((skill) => skill.trim()).filter(Boolean) })).data,
    onSuccess: () => { setForm(emptyJob); qc.invalidateQueries({ queryKey: ['my-jobs'] }); }
  });
  const status = useMutation({ mutationFn: async ({ id, value }) => (await api.patch(`/jobs/${id}/status`, { status: value })).data, onSuccess: () => qc.invalidateQueries({ queryKey: ['my-jobs'] }) });

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState message={errorMessage(error)} />;

  const published = data.items.filter((job) => job.status === 'published').length;

  return (
    <Stack spacing={3.5}>
      <PageHero
        eyebrow="Job publishing"
        title="Create roles that are ready for better applicants."
        body="Draft job posts, publish openings, and keep every role connected to the ATS scoring workflow."
        icon={<RocketLaunchIcon />}
        tone="orange"
      >
        <Box sx={{ width: { xs: '100%', md: 360 } }}>
          <MetricCard label="Published roles" value={published} icon={<FactCheckIcon />} accent="#f97316" />
        </Box>
      </PageHero>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={5}>
          <Card sx={{ position: { lg: 'sticky' }, top: { lg: 98 } }}>
            <CardContent sx={{ p: 3 }}>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="h5">Create job</Typography>
                  <Typography color="text.secondary">Use clear skills and responsibilities to improve matching.</Typography>
                </Box>
                {create.isError && <Alert severity="error">{errorMessage(create.error)}</Alert>}
                <TextField label="Title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
                <TextField label="Company" value={form.company} onChange={(event) => setForm({ ...form, company: event.target.value })} />
                <TextField label="Location" value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} />
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth select label="Work mode" value={form.workMode} onChange={(event) => setForm({ ...form, workMode: event.target.value })}><MenuItem value="remote">Remote</MenuItem><MenuItem value="hybrid">Hybrid</MenuItem><MenuItem value="onsite">Onsite</MenuItem></TextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth select label="Type" value={form.employmentType} onChange={(event) => setForm({ ...form, employmentType: event.target.value })}><MenuItem value="full-time">Full-time</MenuItem><MenuItem value="contract">Contract</MenuItem><MenuItem value="internship">Internship</MenuItem></TextField>
                  </Grid>
                </Grid>
                <TextField label="Required skills" helperText="Comma separated" value={form.requiredSkills} onChange={(event) => setForm({ ...form, requiredSkills: event.target.value })} />
                <TextField label="Description" multiline minRows={4} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
                <TextField label="Responsibilities" multiline minRows={3} value={form.responsibilities} onChange={(event) => setForm({ ...form, responsibilities: event.target.value })} />
                <TextField label="Experience requirements" value={form.experienceRequirements} onChange={(event) => setForm({ ...form, experienceRequirements: event.target.value })} />
                <Button startIcon={<AddIcon />} variant="contained" onClick={() => create.mutate()} disabled={create.isPending}>Create job</Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={7}>
          <Stack spacing={2}>
            <Box>
              <Typography variant="h4">Your jobs</Typography>
              <Typography color="text.secondary">{data.items.length} roles in your workspace.</Typography>
            </Box>
            {data.items.map((job) => (
              <Card className="interactive-card" key={job._id}>
                <CardContent sx={{ p: 3 }}>
                  <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2}>
                    <Stack direction="row" spacing={1.5} alignItems="flex-start">
                      <Box sx={{ width: 44, height: 44, borderRadius: 2, display: 'grid', placeItems: 'center', color: 'primary.main', bgcolor: 'rgba(21,94,117,0.1)' }}>
                        <WorkOutlineIcon />
                      </Box>
                      <Box>
                        <Typography variant="h6">{job.title}</Typography>
                        <Typography color="text.secondary">{job.company} - {job.location}</Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1 }}>
                          <Chip size="small" label={job.status} color={job.status === 'published' ? 'success' : 'default'} />
                          <Chip size="small" label={`${job.applicationCount} applications`} variant="outlined" />
                          <Chip size="small" label={job.workMode} />
                        </Stack>
                      </Box>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Button onClick={() => status.mutate({ id: job._id, value: 'published' })}>Publish</Button>
                      <Button onClick={() => status.mutate({ id: job._id, value: 'archived' })}>Archive</Button>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  );
}
