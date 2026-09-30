import React from 'react';
import { Box, Button, Card, CardContent, Chip, Grid, MenuItem, Stack, TextField, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import EastIcon from '@mui/icons-material/East';
import WorkHistoryIcon from '@mui/icons-material/WorkHistory';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api, errorMessage } from '../api/client.js';
import { EmptyState, ErrorState, LoadingState } from '../ui/StateViews.jsx';
import heroImage from '../assets/ats-hero-recruiter.png';

export function JobBoard() {
  const [filters, setFilters] = useState({ q: '', workMode: '', employmentType: '' });
  const hasFilters = Boolean(filters.q || filters.workMode || filters.employmentType);
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['jobs', filters],
    queryFn: async () => (await api.get('/jobs/public', { params: filters })).data
  });
  return (
    <Stack spacing={4}>
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          minHeight: { xs: 720, md: 570 },
          borderRadius: { xs: 3, md: 5 },
          border: '1px solid rgba(148, 163, 184, 0.24)',
          bgcolor: '#0f4657',
          boxShadow: '0 34px 110px rgba(15, 23, 42, 0.18)'
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `linear-gradient(90deg, rgba(15,70,87,0.98) 0%, rgba(15,70,87,0.88) 38%, rgba(15,70,87,0.16) 70%), url(${heroImage})`,
            backgroundSize: 'cover',
            backgroundPosition: { xs: '68% center', md: 'center' }
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            left: { xs: -190, md: -120 },
            bottom: { xs: -260, md: -250 },
            width: { xs: 560, md: 780 },
            height: { xs: 560, md: 780 },
            borderRadius: '50%',
            bgcolor: '#ffffff'
          }}
        />
        <Box
          className="soft-pulse"
          sx={{
            position: 'absolute',
            right: { xs: -70, md: 72 },
            top: { xs: 34, md: 70 },
            width: { xs: 170, md: 240 },
            height: { xs: 170, md: 240 },
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(249,115,22,0.24), transparent 68%)'
          }}
        />

        <Grid container spacing={4} alignItems="center" sx={{ position: 'relative', minHeight: { xs: 720, md: 570 }, p: { xs: 3, md: 6 } }}>
          <Grid item xs={12} md={6.2}>
            <Chip icon={<AutoAwesomeIcon />} label="TalentSignal ATS" sx={{ mb: 2.5, color: '#dff7ef', bgcolor: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.22)' }} />
            <Typography variant="h2" sx={{ maxWidth: 680, color: '#fff', fontSize: { xs: 44, md: 72 }, lineHeight: 1.02 }}>
              Hire smarter candidates. Faster.
            </Typography>
            <Typography sx={{ mt: 2.5, maxWidth: 610, color: 'rgba(255,255,255,0.82)', fontSize: { xs: 17, md: 20 }, lineHeight: 1.65 }}>
              Publish roles, collect resumes, and surface the best-fit applicants with clear ATS scoring.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 4, maxWidth: 620 }}>
              <Button component={Link} to="/register" size="large" variant="contained" sx={{ bgcolor: '#f59e0b', backgroundImage: 'none', color: '#102033', '&:hover': { bgcolor: '#fbbf24' } }}>
                Start hiring
              </Button>
              <Button size="large" variant="outlined" sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.42)', '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.1)' } }}>
                Browse roles
              </Button>
            </Stack>
          </Grid>
          <Grid item xs={12} md={5.8}>
            <Box sx={{ position: 'relative', minHeight: { xs: 280, md: 420 } }}>
              <Card
                className="float-card"
                sx={{
                  position: 'absolute',
                  right: { xs: 0, md: 38 },
                  top: { xs: 18, md: 12 },
                  width: { xs: '88%', sm: 360 },
                  bgcolor: 'rgba(255,255,255,0.9)'
                }}
              >
                <CardContent sx={{ p: 2.4 }}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box sx={{ width: 44, height: 44, borderRadius: 2, display: 'grid', placeItems: 'center', color: '#0f172a', bgcolor: 'rgba(15, 23, 42, 0.06)' }}>
                      <WorkHistoryIcon />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h4" sx={{ lineHeight: 1 }}>{data?.items?.length ?? 0}</Typography>
                      <Typography variant="body2" color="text.secondary">Open roles ready for applicants</Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>

              <Card
                className="float-card float-card-delay"
                sx={{
                  position: 'absolute',
                  left: { xs: 0, md: 10 },
                  top: { xs: 136, md: 160 },
                  width: { xs: '92%', sm: 390 },
                  bgcolor: 'rgba(255,255,255,0.92)'
                }}
              >
                <CardContent sx={{ p: 2.4 }}>
                  <Stack spacing={1.4}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="subtitle2" color="text.secondary">ATS match</Typography>
                      <Chip size="small" label="Live ranking" color="primary" variant="outlined" />
                    </Stack>
                    <Typography variant="h4">86%</Typography>
                    <Box sx={{ height: 8, borderRadius: 99, bgcolor: 'rgba(15, 70, 87, 0.12)', overflow: 'hidden' }}>
                      <Box sx={{ width: '86%', height: '100%', borderRadius: 99, background: 'linear-gradient(90deg, #0f9f6e, #f97316)' }} />
                    </Box>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {['React', 'Node.js', 'MongoDB'].map((skill) => <Chip key={skill} size="small" icon={<CheckCircleIcon />} label={skill} />)}
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>

              <Card
                className="float-card"
                sx={{
                  position: 'absolute',
                  right: { xs: 18, md: 0 },
                  bottom: { xs: 6, md: 26 },
                  width: { xs: '82%', sm: 320 },
                  bgcolor: 'rgba(255,255,255,0.94)'
                }}
              >
                <CardContent sx={{ p: 2.2 }}>
                  <Stack direction="row" spacing={1.3} alignItems="center">
                    <SearchIcon color="primary" />
                    <Box>
                      <Typography fontWeight={800}>Resume search</Typography>
                      <Typography variant="body2" color="text.secondary">Shortlist qualified candidates in minutes.</Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Box>
          </Grid>
        </Grid>
      </Box>

      <Card sx={{ mt: { xs: -1, md: -5 }, mx: { xs: 0, md: 4 }, position: 'relative', zIndex: 2 }}>
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
              <Stack spacing={2} sx={{ height: '100%' }}>
                <Box><Typography variant="h6">{job.title}</Typography><Typography color="text.secondary">{job.company} - {job.location}</Typography></Box>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <Chip label={job.workMode || 'role'} size="small" color="primary" variant="outlined" />
                  <Chip label={job.employmentType || 'job'} size="small" sx={{ bgcolor: 'rgba(249,115,22,0.12)' }} />
                </Stack>
                <Stack direction="row" spacing={1} flexWrap="wrap">{job.requiredSkills?.slice(0, 4).map((s) => <Chip key={s} label={s} size="small" />)}</Stack>
                <Typography color="text.secondary">{job.description.slice(0, 150)}...</Typography>
                <Box sx={{ flex: 1 }} />
                <Button component={Link} to={`/jobs/${job._id}`} variant="outlined" endIcon={<EastIcon />}>View role</Button>
              </Stack>
            </CardContent></Card>
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
}
