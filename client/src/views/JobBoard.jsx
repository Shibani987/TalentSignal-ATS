import React from 'react';
import { Box, Button, Card, CardContent, Chip, Grid, MenuItem, Stack, TextField, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api, errorMessage } from '../api/client.js';
import { EmptyState, ErrorState, LoadingState } from '../ui/StateViews.jsx';

export function JobBoard() {
  const [filters, setFilters] = useState({ q: '', workMode: '', employmentType: '' });
  const hasFilters = Boolean(filters.q || filters.workMode || filters.employmentType);
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['jobs', filters],
    queryFn: async () => (await api.get('/jobs/public', { params: filters })).data
  });
  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h3">Open roles</Typography>
        <Typography color="text.secondary">Search published jobs and submit a resume-backed application.</Typography>
      </Box>
      <Card><CardContent>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}><TextField fullWidth label="Search" value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value })} InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} /> }} /></Grid>
          <Grid item xs={12} md={3}><TextField select fullWidth label="Work mode" value={filters.workMode} onChange={(e) => setFilters({ ...filters, workMode: e.target.value })}><MenuItem value="">Any</MenuItem><MenuItem value="remote">Remote</MenuItem><MenuItem value="hybrid">Hybrid</MenuItem><MenuItem value="onsite">Onsite</MenuItem></TextField></Grid>
          <Grid item xs={12} md={3}><TextField select fullWidth label="Type" value={filters.employmentType} onChange={(e) => setFilters({ ...filters, employmentType: e.target.value })}><MenuItem value="">Any</MenuItem><MenuItem value="full-time">Full-time</MenuItem><MenuItem value="contract">Contract</MenuItem><MenuItem value="internship">Internship</MenuItem></TextField></Grid>
          {hasFilters && (
            <Grid item xs={12}>
              <Button onClick={() => setFilters({ q: '', workMode: '', employmentType: '' })}>Clear filters</Button>
            </Grid>
          )}
        </Grid>
      </CardContent></Card>
      {isLoading && <LoadingState label="Loading jobs" />}
      {isError && <ErrorState message={errorMessage(error)} />}
      {data?.items?.length === 0 && <EmptyState title="No roles found" body="Adjust the search filters or check back later." />}
      <Grid container spacing={2}>
        {data?.items?.map((job) => (
          <Grid item xs={12} md={6} lg={4} key={job._id}>
            <Card sx={{ height: '100%' }}><CardContent sx={{ p: 3 }}>
              <Stack spacing={2}>
                <Box><Typography variant="h6">{job.title}</Typography><Typography color="text.secondary">{job.company} - {job.location}</Typography></Box>
                <Stack direction="row" spacing={1} flexWrap="wrap">{job.requiredSkills?.slice(0, 4).map((s) => <Chip key={s} label={s} size="small" />)}</Stack>
                <Typography color="text.secondary">{job.description.slice(0, 150)}...</Typography>
                <Button component={Link} to={`/jobs/${job._id}`} variant="outlined">View role</Button>
              </Stack>
            </CardContent></Card>
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
}
