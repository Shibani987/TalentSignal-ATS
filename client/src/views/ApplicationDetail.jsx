import React from 'react';
import { Alert, Button, Card, CardContent, Chip, Grid, Stack, Typography } from '@mui/material';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { api, errorMessage } from '../api/client.js';
import { ErrorState, LoadingState } from '../ui/StateViews.jsx';
import { downloadResume, recommendation } from '../utils/recommendation.js';

export function ApplicationDetail() {
  const { id } = useParams();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['my-application', id],
    queryFn: async () => (await api.get(`/applications/${id}`)).data
  });
  const resumeDownload = useMutation({
    mutationFn: async () => downloadResume(api, id, data?.application?.resume?.fileName || 'resume')
  });

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState message={errorMessage(error)} />;

  const app = data?.application;
  if (!app) return <ErrorState message="Application data was not returned by the server." />;
  const rec = recommendation(app.analysis?.matchScore);

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} lg={8}>
        <Stack spacing={3}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h4">{app.job.title}</Typography>
              <Typography color="text.secondary">{app.job.company} - {app.job.location}</Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 2 }} flexWrap="wrap">
                <Chip label={app.status} color="primary" />
                <Chip label={`Score ${app.analysis?.matchScore ?? '-'}`} color="secondary" />
                <Chip label={rec.label} color={rec.color} />
                <Chip label={`Provider ${app.analysis?.provider || 'demo'}`} variant="outlined" />
              </Stack>
            </CardContent>
          </Card>

          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>Your ATS analysis</Typography>
              {app.analysis?.status === 'failed' && <Alert severity="warning">{app.analysis.error}</Alert>}
              <Typography color="text.secondary" gutterBottom>
                This score compares your uploaded resume with the job requirements. It is not an automatic decision.
              </Typography>
              <Typography>{app.analysis?.summary || 'Analysis is pending or has not been run yet.'}</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ my: 2 }}>
                {app.analysis?.matchedSkills?.map((skill) => <Chip key={skill} label={skill} color="success" />)}
                {app.analysis?.missingSkills?.map((skill) => <Chip key={skill} label={skill} color="warning" variant="outlined" />)}
              </Stack>
              <Typography>{app.analysis?.relevantExperience}</Typography>
            </CardContent>
          </Card>

          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>Your resume</Typography>
              {resumeDownload.isError && <Alert severity="warning">{errorMessage(resumeDownload.error)}</Alert>}
              <Typography color="text.secondary" gutterBottom>{app.resume?.fileName || 'Uploaded resume'}</Typography>
              <Button variant="outlined" onClick={() => resumeDownload.mutate()} disabled={resumeDownload.isPending}>
                Download resume
              </Button>
            </CardContent>
          </Card>
        </Stack>
      </Grid>

      <Grid item xs={12} lg={4}>
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>Status history</Typography>
            <Stack spacing={1}>
              {app.statusHistory.map((item, index) => (
                <Typography key={`${item.status}-${index}`}>
                  {item.status} - {new Date(item.changedAt).toLocaleString()} {item.note ? `- ${item.note}` : ''}
                </Typography>
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
