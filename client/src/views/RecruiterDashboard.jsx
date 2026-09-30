import React from 'react';
import { Box, Card, CardContent, Chip, Grid, Stack, Typography } from '@mui/material';
import DashboardCustomizeIcon from '@mui/icons-material/DashboardCustomize';
import GroupsIcon from '@mui/icons-material/Groups';
import ScheduleIcon from '@mui/icons-material/Schedule';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import { useQuery } from '@tanstack/react-query';
import { api, errorMessage } from '../api/client.js';
import { ErrorState, LoadingState } from '../ui/StateViews.jsx';
import { MetricCard, PageHero } from '../ui/PageSurfaces.jsx';

export function RecruiterDashboard() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => (await api.get('/applications/stats/dashboard')).data
  });

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState message={errorMessage(error)} />;

  const pipeline = Object.fromEntries(data.pipeline.map((item) => [item._id, item.count]));
  const metrics = [
    ['Active jobs', data.activeJobs, <WorkOutlineIcon />, '#155e75'],
    ['Applied', pipeline.Applied || 0, <GroupsIcon />, '#0f9f6e'],
    ['Screening', pipeline.Screening || 0, <TrendingUpIcon />, '#f97316'],
    ['Interview', pipeline.Interview || 0, <ScheduleIcon />, '#7c3aed']
  ];
  const inMotion = (pipeline.Applied || 0) + (pipeline.Screening || 0) + (pipeline.Interview || 0);

  return (
    <Stack spacing={3.5}>
      <PageHero
        eyebrow="Recruiter command center"
        title="Move from resume pile to ranked shortlist."
        body="Track open jobs, screen candidates, and keep hiring momentum visible from one polished workspace."
        icon={<DashboardCustomizeIcon />}
      >
        <Card className="float-card" sx={{ width: { xs: '100%', md: 330 }, bgcolor: 'rgba(255,255,255,0.92)' }}>
          <CardContent sx={{ p: 2.5 }}>
            <Typography variant="subtitle2" color="text.secondary">Pipeline snapshot</Typography>
            <Typography variant="h3" color="text.primary" sx={{ my: 0.8 }}>{inMotion}</Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Chip size="small" label={`${pipeline.Applied || 0} applied`} />
              <Chip size="small" label={`${pipeline.Screening || 0} screening`} color="primary" variant="outlined" />
            </Stack>
          </CardContent>
        </Card>
      </PageHero>

      <Grid container spacing={2}>
        {metrics.map(([label, value, icon, accent]) => (
          <Grid item xs={12} sm={6} md={3} key={label}>
            <MetricCard label={label} value={value} icon={icon} accent={accent} />
          </Grid>
        ))}
      </Grid>

      <Card>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="h5">Recent activity</Typography>
            <Typography color="text.secondary">Latest candidate movement across your jobs.</Typography>
          </Box>
          <Stack spacing={1.25}>
            {data.recent.map((app) => (
              <Box key={app._id} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider', bgcolor: 'rgba(255,255,255,0.58)' }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent="space-between">
                  <Typography fontWeight={800}>{app.applicant?.name || 'Candidate'}</Typography>
                  <Chip size="small" label={app.status} color="primary" variant="outlined" />
                </Stack>
                <Typography color="text.secondary">{app.job?.title || 'Role'}</Typography>
              </Box>
            ))}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
