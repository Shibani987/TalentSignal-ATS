import React from 'react';
import { Box, Button, Card, CardContent, Chip, Grid, LinearProgress, MenuItem, Stack, TextField, Typography } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api, errorMessage } from '../api/client.js';
import { EmptyState, ErrorState, LoadingState } from '../ui/StateViews.jsx';
import { PageHero } from '../ui/PageSurfaces.jsx';
import { recommendation } from '../utils/recommendation.js';

function compactParams(filters) {
  return Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== ''));
}

export function Candidates() {
  const [filters, setFilters] = useState({ status: '', minScore: '' });
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['candidates', filters],
    queryFn: async () => (await api.get('/applications/recruiter', { params: compactParams(filters) })).data
  });
  const items = data?.items || [];

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState message={errorMessage(error)} />;

  const topScore = Math.max(0, ...items.map((item) => item.analysis?.matchScore || 0));

  return (
    <Stack spacing={3.5}>
      <PageHero
        eyebrow="Candidate intelligence"
        title="Rank candidates with context, not guesswork."
        body="Filter applications by pipeline stage and match score while keeping every recommendation reviewable."
        icon={<PersonSearchIcon />}
        tone="blue"
      >
        <Card className="float-card" sx={{ width: { xs: '100%', md: 330 }, bgcolor: 'rgba(255,255,255,0.92)' }}>
          <CardContent sx={{ p: 2.5 }}>
            <Typography variant="subtitle2" color="text.secondary">Top visible score</Typography>
            <Typography variant="h3" color="text.primary">{topScore}</Typography>
            <LinearProgress variant="determinate" value={topScore} sx={{ mt: 1.5, height: 8, borderRadius: 4 }} />
          </CardContent>
        </Card>
      </PageHero>

      <Card>
        <CardContent sx={{ p: 3 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
            <FilterAltIcon color="primary" />
            <Typography variant="h5">Filters</Typography>
          </Stack>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField select fullWidth label="Status" value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}>
                <MenuItem value="">Any</MenuItem>
                {['Applied', 'Screening', 'Interview', 'Offered', 'Rejected'].map((status) => (
                  <MenuItem key={status} value={status}>{status}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Minimum score" type="number" value={filters.minScore} onChange={(event) => setFilters({ ...filters, minScore: event.target.value })} />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {items.length === 0 && <EmptyState title="No candidates found" body="Applications will appear here after applicants submit resumes." />}

      <Grid container spacing={2}>
        {items.map((application) => {
          const rec = recommendation(application.analysis?.matchScore);
          const score = application.analysis?.matchScore || 0;
          return (
            <Grid item xs={12} lg={6} key={application._id}>
              <Card className="interactive-card" sx={{ height: '100%' }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack spacing={2.2}>
                    <Stack direction="row" justifyContent="space-between" spacing={2}>
                      <Box>
                        <Typography variant="h6">{application.applicant?.name || 'Candidate'}</Typography>
                        <Typography color="text.secondary">{application.job?.title || 'Role'} - {application.applicant?.email}</Typography>
                      </Box>
                      <Chip icon={<AutoAwesomeIcon />} label={`Score ${application.analysis?.matchScore ?? '-'}`} color="primary" />
                    </Stack>
                    <Box>
                      <LinearProgress variant="determinate" value={score} sx={{ height: 8, borderRadius: 4 }} />
                    </Box>
                    <Typography variant="body2" color="text.secondary">{application.analysis?.summary || 'Resume analysis is pending.'}</Typography>
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                      <Chip label={application.status} />
                      <Chip label={rec.label} color={rec.color} variant={rec.color === 'default' ? 'outlined' : 'filled'} />
                      <Box sx={{ flex: 1 }} />
                      <Button component={Link} to={`/recruiter/candidates/${application._id}`} variant="outlined">Review</Button>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Stack>
  );
}
