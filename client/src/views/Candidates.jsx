import React from 'react';
import { Button, Card, CardContent, Chip, Grid, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api, errorMessage } from '../api/client.js';
import { EmptyState, ErrorState, LoadingState } from '../ui/StateViews.jsx';
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

  return (
    <Stack spacing={3}>
      <div>
        <Typography variant="h3">Candidate ranking</Typography>
        <Typography color="text.secondary">
          ATS recommendations are based on resume analysis scores and stay as review support only.
        </Typography>
      </div>

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <TextField
            select
            fullWidth
            label="Status"
            value={filters.status}
            onChange={(event) => setFilters({ ...filters, status: event.target.value })}
          >
            <MenuItem value="">Any</MenuItem>
            {['Applied', 'Screening', 'Interview', 'Offered', 'Rejected'].map((status) => (
              <MenuItem key={status} value={status}>{status}</MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Minimum score"
            type="number"
            value={filters.minScore}
            onChange={(event) => setFilters({ ...filters, minScore: event.target.value })}
          />
        </Grid>
      </Grid>

      {items.length === 0 && (
        <EmptyState title="No candidates found" body="Applications will appear here after applicants submit resumes." />
      )}

      {items.map((application) => {
        const rec = recommendation(application.analysis?.matchScore);
        return (
          <Card key={application._id}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2}>
                <div>
                  <Typography variant="h6">{application.applicant?.name || 'Candidate'}</Typography>
                  <Typography color="text.secondary">
                    {application.job?.title || 'Role'} - {application.applicant?.email}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {application.analysis?.summary || 'Resume analysis is pending.'}
                  </Typography>
                </div>
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                  <Chip label={application.status} />
                  <Chip label={`Score ${application.analysis?.matchScore ?? '-'}`} color="primary" />
                  <Chip label={rec.label} color={rec.color} variant={rec.color === 'default' ? 'outlined' : 'filled'} />
                  <Button component={Link} to={`/recruiter/candidates/${application._id}`} variant="outlined">Review</Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        );
      })}
    </Stack>
  );
}
