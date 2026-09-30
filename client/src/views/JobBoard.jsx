import React from 'react';
import { Box, Button, Card, CardContent, Chip, Grid, MenuItem, Stack, TextField, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import EastIcon from '@mui/icons-material/East';
import WorkHistoryIcon from '@mui/icons-material/WorkHistory';
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
    <Stack spacing={3.5}>
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 3,
          border: '1px solid rgba(148, 163, 184, 0.22)',
          bgcolor: 'rgba(255,255,255,0.7)',
          p: { xs: 3, md: 5 },
          boxShadow: '0 28px 90px rgba(15, 23, 42, 0.08)'
        }}
      >
        <Box
          className="soft-pulse"
          sx={{
            position: 'absolute',
            right: { xs: -72, md: 44 },
            top: { xs: -56, md: 34 },
            width: { xs: 180, md: 260 },
            height: { xs: 180, md: 260 },
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(15,159,110,0.22), transparent 66%)'
          }}
        />
        <Grid container spacing={4} alignItems="center" sx={{ position: 'relative' }}>
          <Grid item xs={12} md={7}>
            <Chip icon={<AutoAwesomeIcon />} label="AI assisted resume screening" color="primary" variant="outlined" sx={{ mb: 2, bgcolor: 'rgba(224,242,254,0.78)' }} />
            <Typography variant="h3" sx={{ maxWidth: 720 }}>
              Find roles, apply faster, and get a clear ATS match signal.
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1.5, maxWidth: 640, fontSize: 18, lineHeight: 1.65 }}>
              Browse active openings, submit a resume, and track how your profile aligns with each hiring team.
            </Typography>
          </Grid>
          <Grid item xs={12} md={5}>
            <Card sx={{ bgcolor: 'rgba(16, 32, 51, 0.92)', color: '#fff', borderColor: 'rgba(255,255,255,0.12)' }}>
              <CardContent sx={{ p: 3 }}>
                <Stack spacing={2}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box sx={{ width: 42, height: 42, borderRadius: 2, display: 'grid', placeItems: 'center', bgcolor: 'rgba(255,255,255,0.1)' }}>
                      <WorkHistoryIcon />
                    </Box>
                    <Box>
                      <Typography variant="h5">{data?.items?.length ?? 0}</Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.68)' }}>Visible openings right now</Typography>
                    </Box>
                  </Stack>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    <Chip label="Resume backed" size="small" sx={{ color: '#fff', bgcolor: 'rgba(15,159,110,0.22)' }} />
                    <Chip label="Score tracking" size="small" sx={{ color: '#fff', bgcolor: 'rgba(249,115,22,0.24)' }} />
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      <Card>
        <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}><TextField fullWidth label="Search by title, company, or skill" value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value })} InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} /> }} /></Grid>
            <Grid item xs={12} md={3}><TextField select fullWidth label="Work mode" value={filters.workMode} onChange={(e) => setFilters({ ...filters, workMode: e.target.value })}><MenuItem value="">Any</MenuItem><MenuItem value="remote">Remote</MenuItem><MenuItem value="hybrid">Hybrid</MenuItem><MenuItem value="onsite">Onsite</MenuItem></TextField></Grid>
            <Grid item xs={12} md={3}><TextField select fullWidth label="Type" value={filters.employmentType} onChange={(e) => setFilters({ ...filters, employmentType: e.target.value })}><MenuItem value="">Any</MenuItem><MenuItem value="full-time">Full-time</MenuItem><MenuItem value="contract">Contract</MenuItem><MenuItem value="internship">Internship</MenuItem></TextField></Grid>
            {hasFilters && (
              <Grid item xs={12}>
                <Button onClick={() => setFilters({ q: '', workMode: '', employmentType: '' })}>Clear filters</Button>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>
      {isLoading && <LoadingState label="Loading jobs" />}
      {isError && <ErrorState message={errorMessage(error)} />}
      {data?.items?.length === 0 && <EmptyState title="No roles found" body="Adjust the search filters or check back later." />}
      <Grid container spacing={2}>
        {data?.items?.map((job) => (
          <Grid item xs={12} md={6} lg={4} key={job._id}>
            <Card className="interactive-card" sx={{ height: '100%' }}><CardContent sx={{ p: 3, height: '100%' }}>
              <Stack spacing={2}>
                <Box><Typography variant="h6">{job.title}</Typography><Typography color="text.secondary">{job.company} - {job.location}</Typography></Box>
                <Stack direction="row" spacing={1} flexWrap="wrap">{job.requiredSkills?.slice(0, 4).map((s) => <Chip key={s} label={s} size="small" />)}</Stack>
                <Typography color="text.secondary">{job.description.slice(0, 150)}...</Typography>
                <Button component={Link} to={`/jobs/${job._id}`} variant="outlined" endIcon={<EastIcon />}>View role</Button>
              </Stack>
            </CardContent></Card>
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
}
