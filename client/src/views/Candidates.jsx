import React from 'react';
import { Box, Button, Card, CardContent, Chip, Grid, LinearProgress, MenuItem, Stack, TextField, Typography } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api, errorMessage } from '../api/client.js';
import { EmptyState, ErrorState, LoadingState } from '../ui/StateViews.jsx';
import { PageHero } from '../ui/PageSurfaces.jsx';
import { recommendation } from '../utils/recommendation.js';

const stages = ['Applied', 'Screening', 'Interview', 'Offered', 'Rejected'];

function compactParams(filters) {
  return Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== ''));
}

export function Candidates() {
  const [filters, setFilters] = useState({ status: '', minScore: '', skill: '', minExperience: '' });
  const qc = useQueryClient();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['candidates', filters],
    queryFn: async () => (await api.get('/applications/recruiter', { params: compactParams(filters) })).data
  });
  const moveCandidate = useMutation({
    mutationFn: async ({ id, status }) => (await api.patch(`/applications/${id}/status`, { status })).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['candidates'] })
  });
  const items = data?.items || [];

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState message={errorMessage(error)} />;

  const topScore = Math.max(0, ...items.map((item) => item.analysis?.matchScore || 0));

  return (
    <Stack spacing={3.5}>
      <PageHero eyebrow="Candidate intelligence" title="Rank candidates with context, not guesswork."
        body="Filter applications by skills, experience, score, or stage, then move candidates through the hiring pipeline."
        icon={<PersonSearchIcon />} tone="blue">
        <Card className="float-card" sx={{ width: { xs: '100%', md: 330 }, bgcolor: 'rgba(255,255,255,0.92)' }}>
          <CardContent sx={{ p: 2.5 }}>
            <Typography variant="subtitle2" color="text.secondary">Top visible score</Typography>
            <Typography variant="h3" color="text.primary">{topScore}</Typography>
            <LinearProgress variant="determinate" value={topScore} sx={{ mt: 1.5, height: 8, borderRadius: 4 }} />
          </CardContent>
        </Card>
      </PageHero>

      <Card><CardContent sx={{ p: 3 }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <FilterAltIcon color="primary" /><Typography variant="h5">Candidate filters</Typography>
        </Stack>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField select fullWidth label="Status" value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}>
              <MenuItem value="">Any status</MenuItem>{stages.map((status) => <MenuItem key={status} value={status}>{status}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField fullWidth label="Minimum score" type="number" inputProps={{ min: 0, max: 100 }} value={filters.minScore} onChange={(event) => setFilters({ ...filters, minScore: event.target.value })} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField fullWidth label="Skill" placeholder="e.g. React" value={filters.skill} onChange={(event) => setFilters({ ...filters, skill: event.target.value })} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField fullWidth label="Minimum experience (years)" type="number" inputProps={{ min: 0, max: 60 }} value={filters.minExperience} onChange={(event) => setFilters({ ...filters, minExperience: event.target.value })} />
          </Grid>
        </Grid>
      </CardContent></Card>

      {items.length === 0 && <EmptyState title="No candidates found" body="Try changing the filters, or review candidates after applicants submit resumes." />}

      <Box sx={{ overflowX: 'auto', pb: 1 }}>
        <Grid container spacing={2} sx={{ minWidth: 1120, flexWrap: 'nowrap' }}>
          {stages.map((stage) => {
            const laneItems = items.filter((application) => application.status === stage);
            return (
              <Grid item key={stage} sx={{ width: 300, flex: '0 0 300px' }}>
                <Stack spacing={1.5} onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => { event.preventDefault(); const id = event.dataTransfer.getData('text/application-id'); if (id) moveCandidate.mutate({ id, status: stage }); }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 0.5 }}>
                    <Typography variant="h6">{stage}</Typography><Chip size="small" label={laneItems.length} />
                  </Stack>
                  <Stack spacing={1.5} sx={{ minHeight: 180, p: 1.25, borderRadius: 3, bgcolor: 'rgba(15, 23, 42, 0.045)' }}>
                    {laneItems.map((application) => {
                      const score = application.analysis?.matchScore;
                      const rec = recommendation(score);
                      const profile = application.applicant?.applicantProfile || {};
                      const skills = profile.skills || [];
                      const years = (profile.experience || []).reduce((maximum, item) => Math.max(maximum, Number(item.years) || 0), 0);
                      return (
                        <Card key={application._id} draggable onDragStart={(event) => event.dataTransfer.setData('text/application-id', application._id)}
                          sx={{ cursor: 'grab', '&:active': { cursor: 'grabbing' } }}>
                          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                            <Stack spacing={1.4}>
                              <Box>
                                <Typography fontWeight={800}>{application.applicant?.name || 'Candidate'}</Typography>
                                <Typography variant="body2" color="text.secondary">{application.job?.title || 'Role'}</Typography>
                                <Typography variant="caption" color="text.secondary">{application.applicant?.email}</Typography>
                              </Box>
                              <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                                <Chip size="small" icon={<AutoAwesomeIcon />} label={`Score ${score ?? '—'}`} color="primary" />
                                <Chip size="small" label={`${years}+ yrs`} variant="outlined" />
                              </Stack>
                              {skills.length > 0 && <Typography variant="caption" color="text.secondary">Skills: {skills.slice(0, 5).join(', ')}</Typography>}
                              <Typography variant="body2" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                {application.analysis?.summary || 'Resume analysis is pending.'}
                              </Typography>
                              <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Chip size="small" label={rec.label} color={rec.color} variant={rec.color === 'default' ? 'outlined' : 'filled'} />
                                <Button component={Link} to={`/recruiter/candidates/${application._id}`} size="small">Review</Button>
                              </Stack>
                            </Stack>
                          </CardContent>
                        </Card>
                      );
                    })}
                    {laneItems.length === 0 && <Typography variant="body2" color="text.secondary" sx={{ p: 1 }}>Drop candidates here</Typography>}
                  </Stack>
                </Stack>
              </Grid>
            );
          })}
        </Grid>
      </Box>
      {moveCandidate.isError && <Typography color="error">{errorMessage(moveCandidate.error)}</Typography>}
    </Stack>
  );
}
