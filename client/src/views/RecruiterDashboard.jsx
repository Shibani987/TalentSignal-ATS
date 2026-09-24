import React from 'react';
import { Card, CardContent, Grid, Stack, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { api, errorMessage } from '../api/client.js';
import { ErrorState, LoadingState } from '../ui/StateViews.jsx';

export function RecruiterDashboard() {
  const { data, isLoading, isError, error } = useQuery({ queryKey: ['dashboard'], queryFn: async () => (await api.get('/applications/stats/dashboard')).data });
  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState message={errorMessage(error)} />;
  const pipeline = Object.fromEntries(data.pipeline.map((x) => [x._id, x.count]));
  return (
    <Stack spacing={3}>
      <Typography variant="h3">Recruiter dashboard</Typography>
      <Grid container spacing={2}>
        {[['Active jobs', data.activeJobs], ['Applied', pipeline.Applied || 0], ['Screening', pipeline.Screening || 0], ['Interview', pipeline.Interview || 0]].map(([label, value]) => (
          <Grid item xs={6} md={3} key={label}><Card><CardContent><Typography color="text.secondary">{label}</Typography><Typography variant="h3">{value}</Typography></CardContent></Card></Grid>
        ))}
      </Grid>
      <Card><CardContent>
        <Typography variant="h5" gutterBottom>Recent activity</Typography>
        <Stack spacing={1}>{data.recent.map((app) => <Typography key={app._id}>{app.applicant?.name} · {app.job?.title} · {app.status}</Typography>)}</Stack>
      </CardContent></Card>
    </Stack>
  );
}
