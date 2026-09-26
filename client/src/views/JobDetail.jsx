import React from 'react';
import { Alert, Box, Button, Card, CardContent, Chip, Stack, TextField, Typography } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { api, errorMessage } from '../api/client.js';
import { useAuth } from '../state/AuthContext.jsx';
import { ErrorState, LoadingState } from '../ui/StateViews.jsx';

export function JobDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [resume, setResume] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const { data, isLoading, isError, error } = useQuery({ queryKey: ['job', id], queryFn: async () => (await api.get(`/jobs/${id}`)).data });
  const apply = useMutation({
    mutationFn: async () => {
      const form = new FormData();
      form.append('jobId', id);
      form.append('coverLetter', coverLetter);
      form.append('resume', resume);
      return (await api.post('/applications', form)).data;
    }
  });
  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState message={errorMessage(error)} />;
  const job = data.job;
  return (
    <Stack spacing={3}>
      <Card><CardContent sx={{ p: { xs: 3, md: 5 } }}>
        <Stack spacing={2}>
          <Box><Typography variant="h3">{job.title}</Typography><Typography color="text.secondary">{job.company} - {job.location}</Typography></Box>
          <Stack direction="row" spacing={1} flexWrap="wrap"><Chip label={job.workMode} /><Chip label={job.employmentType} />{job.requiredSkills?.map((s) => <Chip key={s} label={s} variant="outlined" />)}</Stack>
          <Typography>{job.description}</Typography>
          <Box><Typography variant="h6">Responsibilities</Typography><ul>{job.responsibilities?.map((r) => <li key={r}>{r}</li>)}</ul></Box>
          <Box><Typography variant="h6">Experience</Typography><Typography>{job.experienceRequirements}</Typography></Box>
        </Stack>
      </CardContent></Card>
      {user?.role === 'applicant' ? (
        <Card><CardContent sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>Apply for this role</Typography>
          <Stack spacing={2}>
            {apply.isSuccess && <Alert severity="success">Application submitted. Resume analysis has started.</Alert>}
            {apply.isError && <Alert severity="error">{errorMessage(apply.error)}</Alert>}
            <TextField label="Cover letter" multiline minRows={4} value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} />
            <Button component="label" variant="outlined" startIcon={<UploadFileIcon />}>{resume ? resume.name : 'Upload PDF or DOCX'}<input hidden type="file" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={(e) => setResume(e.target.files[0])} /></Button>
            <Button variant="contained" disabled={!resume || apply.isPending} onClick={() => apply.mutate()}>Submit application</Button>
          </Stack>
        </CardContent></Card>
      ) : (
        <Alert severity="info">Sign in as an applicant to apply.</Alert>
      )}
    </Stack>
  );
}
