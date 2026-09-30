import React from 'react';
import { Box, Button, Card, CardContent, Chip, LinearProgress, Stack, Typography } from '@mui/material';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api, errorMessage } from '../api/client.js';
import { EmptyState, ErrorState, LoadingState } from '../ui/StateViews.jsx';
import { PageHero } from '../ui/PageSurfaces.jsx';
import { recommendation } from '../utils/recommendation.js';

export function ApplicantDashboard() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['my-applications'],
    queryFn: async () => (await api.get('/applications/mine')).data
  });
  const items = data?.items || [];

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState message={errorMessage(error)} />;

  const bestScore = Math.max(0, ...items.map((item) => item.analysis?.matchScore || 0));

  return (
    <Stack spacing={3.5}>
      <PageHero
        eyebrow="Applicant tracker"
        title="See every application and ATS signal in one place."
        body="Follow status updates, resume match scores, and recruiter decisions without losing the thread."
        icon={<AssignmentTurnedInIcon />}
      >
        <Card className="float-card" sx={{ width: { xs: '100%', md: 320 }, bgcolor: 'rgba(255,255,255,0.92)' }}>
          <CardContent sx={{ p: 2.5 }}>
            <Typography variant="subtitle2" color="text.secondary">Best match score</Typography>
            <Typography variant="h3" color="text.primary">{bestScore}</Typography>
            <LinearProgress variant="determinate" value={bestScore} sx={{ mt: 1.5, height: 8, borderRadius: 4 }} />
          </CardContent>
        </Card>
      </PageHero>

      {items.length === 0 && <EmptyState title="No applications yet" body="Browse jobs and submit your resume when a role fits." />}

      {items.map((application) => {
        const rec = recommendation(application.analysis?.matchScore);
        const score = application.analysis?.matchScore || 0;
        return (
          <Card className="interactive-card" key={application._id}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2}>
                <Box sx={{ maxWidth: 760 }}>
                  <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 1 }}>
                    <Chip label={application.status} color="primary" />
                    <Chip icon={<AutoAwesomeIcon />} label={`Score ${application.analysis?.matchScore ?? '-'}`} color="secondary" variant="outlined" />
                  </Stack>
                  <Typography variant="h6">{application.job.title}</Typography>
                  <Typography color="text.secondary">{application.job.company} - Applied {new Date(application.createdAt).toLocaleDateString()}</Typography>
                  <LinearProgress variant="determinate" value={score} sx={{ maxWidth: 460, mt: 2, height: 8, borderRadius: 4 }} />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
                    {application.analysis?.summary || 'ATS analysis will appear after your resume is processed.'}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
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
