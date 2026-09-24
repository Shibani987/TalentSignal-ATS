import React from 'react';
import { Button, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api, errorMessage } from '../api/client.js';
import { EmptyState, ErrorState, LoadingState } from '../ui/StateViews.jsx';
import { recommendation } from '../utils/recommendation.js';

export function ApplicantDashboard() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['my-applications'],
    queryFn: async () => (await api.get('/applications/mine')).data
  });
  const items = data?.items || [];

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState message={errorMessage(error)} />;

  return (
    <Stack spacing={3}>
      <div>
        <Typography variant="h3">My applications</Typography>
        <Typography color="text.secondary">
          Track status updates and view your ATS resume match analysis for each application.
        </Typography>
      </div>

      {items.length === 0 && (
        <EmptyState title="No applications yet" body="Browse jobs and submit your resume when a role fits." />
      )}

      {items.map((application) => {
        const rec = recommendation(application.analysis?.matchScore);
        return (
          <Card key={application._id}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2}>
                <div>
                  <Typography variant="h6">{application.job.title}</Typography>
                  <Typography color="text.secondary">
                    {application.job.company} - Applied {new Date(application.createdAt).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {application.analysis?.summary || 'ATS analysis will appear after your resume is processed.'}
                  </Typography>
                </div>
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                  <Chip label={application.status} color="primary" />
                  <Chip label={`Score ${application.analysis?.matchScore ?? '-'}`} color="secondary" variant="outlined" />
                  <Chip label={rec.label} color={rec.color} variant={rec.color === 'default' ? 'outlined' : 'filled'} />
                  <Button component={Link} to={`/applicant/applications/${application._id}`} variant="outlined">View details</Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        );
      })}
    </Stack>
  );
}
