import React from 'react';
import { Alert, Button, Card, CardContent, Chip, Grid, MenuItem, Stack, TextField, Typography } from '@mui/material';
import ReplayIcon from '@mui/icons-material/Replay';
import SendIcon from '@mui/icons-material/Send';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { api, errorMessage } from '../api/client.js';
import { ErrorState, LoadingState } from '../ui/StateViews.jsx';
import { downloadResume, recommendation } from '../utils/recommendation.js';

export function CandidateDetail() {
  const { id } = useParams();
  const qc = useQueryClient();
  const [status, setStatus] = useState('');
  const [interview, setInterview] = useState({
    startsAt: '',
    locationOrLink: '',
    message: 'We would like to invite you for an interview.'
  });
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['application', id],
    queryFn: async () => (await api.get(`/applications/${id}`)).data
  });
  const updateStatus = useMutation({
    mutationFn: async () => (await api.patch(`/applications/${id}/status`, { status })).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['application', id] })
  });
  const retry = useMutation({
    mutationFn: async () => (await api.post(`/applications/${id}/retry-analysis`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['application', id] })
  });
  const resumeDownload = useMutation({
    mutationFn: async () => downloadResume(api, id, data?.application?.resume?.fileName || 'resume')
  });
  const invite = useMutation({
    mutationFn: async () => (await api.post(`/applications/${id}/interview`, interview)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['application', id] })
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
              <Typography variant="h4">{app.applicant.name}</Typography>
              <Typography color="text.secondary">{app.job.title} - {app.applicant.email}</Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 2 }} flexWrap="wrap">
                <Chip label={app.status} color="primary" />
                <Chip label={`Analysis ${app.analysis?.status || 'pending'}`} />
                <Chip label={`Provider ${app.analysis?.provider || 'demo'}`} variant="outlined" />
                <Chip label={rec.label} color={rec.color} />
              </Stack>
            </CardContent>
          </Card>

          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>ATS analysis and recommendation</Typography>
              {app.analysis?.status === 'failed' && <Alert severity="warning">{app.analysis.error}</Alert>}
              <Typography variant="h3">{app.analysis?.matchScore ?? '-'}</Typography>
              <Typography color="text.secondary" gutterBottom>
                Match score is decision support only. Recruiters can override or ignore it.
              </Typography>
              <Typography>{app.analysis?.summary || 'Analysis is pending or has not been run yet.'}</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ my: 2 }}>
                {app.analysis?.matchedSkills?.map((skill) => <Chip key={skill} label={skill} color="success" />)}
                {app.analysis?.missingSkills?.map((skill) => <Chip key={skill} label={skill} color="warning" variant="outlined" />)}
              </Stack>
              <Typography>{app.analysis?.relevantExperience}</Typography>
              <Button startIcon={<ReplayIcon />} onClick={() => retry.mutate()} disabled={retry.isPending} sx={{ mt: 2 }}>
                Retry analysis
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>Resume</Typography>
              {resumeDownload.isError && <Alert severity="warning">{errorMessage(resumeDownload.error)}</Alert>}
              <Typography color="text.secondary" gutterBottom>{app.resume?.fileName || 'Uploaded resume'}</Typography>
              <Button variant="outlined" onClick={() => resumeDownload.mutate()} disabled={resumeDownload.isPending}>
                Download resume
              </Button>
              <Typography variant="subtitle2" sx={{ mt: 3, mb: 1 }}>Extracted text preview</Typography>
              <Typography color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                {(app.resumeText || 'No extracted resume text available.').slice(0, 1600)}
              </Typography>
            </CardContent>
          </Card>

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
        </Stack>
      </Grid>

      <Grid item xs={12} lg={4}>
        <Stack spacing={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Pipeline action</Typography>
              {updateStatus.isError && <Alert severity="error">{errorMessage(updateStatus.error)}</Alert>}
              <Stack spacing={2}>
                <TextField select label="Status" value={status} onChange={(event) => setStatus(event.target.value)}>
                  {['Applied', 'Screening', 'Interview', 'Offered', 'Rejected'].map((nextStatus) => (
                    <MenuItem key={nextStatus} value={nextStatus}>{nextStatus}</MenuItem>
                  ))}
                </TextField>
                <Button variant="contained" disabled={!status || updateStatus.isPending} onClick={() => updateStatus.mutate()}>
                  Update status
                </Button>
              </Stack>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Interview invitation</Typography>
              {invite.isError && <Alert severity="error">{errorMessage(invite.error)}</Alert>}
              <Stack spacing={2}>
                <TextField type="datetime-local" value={interview.startsAt} onChange={(event) => setInterview({ ...interview, startsAt: event.target.value })} />
                <TextField label="Location or meeting link" value={interview.locationOrLink} onChange={(event) => setInterview({ ...interview, locationOrLink: event.target.value })} />
                <TextField label="Message" multiline minRows={4} value={interview.message} onChange={(event) => setInterview({ ...interview, message: event.target.value })} />
                <Button startIcon={<SendIcon />} variant="outlined" disabled={invite.isPending} onClick={() => invite.mutate()}>
                  Send invite
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Grid>
    </Grid>
  );
}
