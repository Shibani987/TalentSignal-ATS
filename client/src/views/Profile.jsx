import React from 'react';
import { Alert, Box, Button, Card, CardContent, Chip, Grid, LinearProgress, Stack, TextField, Typography } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { useMutation } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { api, errorMessage } from '../api/client.js';
import { useAuth } from '../state/AuthContext.jsx';

function firstItem(items, fallback) {
  return items?.[0] || fallback;
}

export function Profile() {
  const { user, refresh } = useAuth();
  const profile = user.applicantProfile || {};
  const firstExperience = useMemo(() => firstItem(profile.experience, { title: '', company: '', years: '', summary: '' }), [profile.experience]);
  const firstEducation = useMemo(() => firstItem(profile.education, { school: '', degree: '', startYear: '', endYear: '' }), [profile.education]);

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [company, setCompany] = useState({
    name: user.company?.name || '',
    website: user.company?.website || '',
    size: user.company?.size || '',
    description: user.company?.description || ''
  });
  const [applicant, setApplicant] = useState({
    phone: profile.phone || '',
    location: profile.location || '',
    skills: profile.skills?.join(', ') || '',
    experienceTitle: firstExperience.title || '',
    experienceCompany: firstExperience.company || '',
    experienceYears: firstExperience.years || '',
    experienceSummary: firstExperience.summary || '',
    educationSchool: firstEducation.school || '',
    educationDegree: firstEducation.degree || '',
    educationStartYear: firstEducation.startYear || '',
    educationEndYear: firstEducation.endYear || ''
  });
  const [resume, setResume] = useState(null);

  const saveProfile = useMutation({
    mutationFn: async () => {
      const payload = user.role === 'recruiter'
        ? { name, email, company }
        : {
            name,
            email,
            applicantProfile: {
              ...profile,
              phone: applicant.phone,
              location: applicant.location,
              skills: applicant.skills.split(',').map((skill) => skill.trim()).filter(Boolean),
              experience: [{
                title: applicant.experienceTitle,
                company: applicant.experienceCompany,
                years: Number(applicant.experienceYears || 0),
                summary: applicant.experienceSummary
              }].filter((item) => item.title || item.company || item.summary),
              education: [{
                school: applicant.educationSchool,
                degree: applicant.educationDegree,
                startYear: Number(applicant.educationStartYear || 0),
                endYear: Number(applicant.educationEndYear || 0)
              }].filter((item) => item.school || item.degree)
            }
          };
      return (await api.put('/users/me', payload)).data;
    },
    onSuccess: refresh
  });

  const uploadResume = useMutation({
    mutationFn: async () => {
      const form = new FormData();
      form.append('resume', resume);
      return (await api.put('/users/me/resume', form)).data;
    },
    onSuccess: async () => {
      setResume(null);
      await refresh();
    }
  });

  return (
    <Grid container spacing={3} justifyContent="center">
      <Grid item xs={12} lg={8}>
        <Stack spacing={3}>
          <Card>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h4" gutterBottom>Profile</Typography>
              <Typography color="text.secondary">
                Keep your account and candidate details updated. Applicants can maintain a reusable resume here and still upload a role-specific resume while applying.
              </Typography>
            </CardContent>
          </Card>

          <Card>
            <CardContent sx={{ p: 4 }}>
              <Stack spacing={2}>
                <Typography variant="h5">{user.role === 'recruiter' ? 'Recruiter profile' : 'Candidate profile'}</Typography>
                {saveProfile.isSuccess && <Alert severity="success">Profile updated.</Alert>}
                {saveProfile.isError && <Alert severity="error">{errorMessage(saveProfile.error)}</Alert>}
                <TextField label="Full name" value={name} onChange={(event) => setName(event.target.value)} />
                <TextField label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />

                {user.role === 'recruiter' ? (
                  <>
                    <TextField label="Company name" value={company.name} onChange={(event) => setCompany({ ...company, name: event.target.value })} />
                    <TextField label="Website" value={company.website} onChange={(event) => setCompany({ ...company, website: event.target.value })} />
                    <TextField label="Company size" value={company.size} onChange={(event) => setCompany({ ...company, size: event.target.value })} />
                    <TextField label="Company description" multiline minRows={3} value={company.description} onChange={(event) => setCompany({ ...company, description: event.target.value })} />
                  </>
                ) : (
                  <>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <TextField fullWidth label="Phone" value={applicant.phone} onChange={(event) => setApplicant({ ...applicant, phone: event.target.value })} />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField fullWidth label="Location" value={applicant.location} onChange={(event) => setApplicant({ ...applicant, location: event.target.value })} />
                      </Grid>
                    </Grid>
                    <TextField label="Skills" helperText="Comma separated" value={applicant.skills} onChange={(event) => setApplicant({ ...applicant, skills: event.target.value })} />

                    <Box>
                      <Typography variant="h6" gutterBottom>Experience</Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                          <TextField fullWidth label="Title" value={applicant.experienceTitle} onChange={(event) => setApplicant({ ...applicant, experienceTitle: event.target.value })} />
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <TextField fullWidth label="Company" value={applicant.experienceCompany} onChange={(event) => setApplicant({ ...applicant, experienceCompany: event.target.value })} />
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <TextField fullWidth label="Years" type="number" value={applicant.experienceYears} onChange={(event) => setApplicant({ ...applicant, experienceYears: event.target.value })} />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField fullWidth label="Experience summary" multiline minRows={3} value={applicant.experienceSummary} onChange={(event) => setApplicant({ ...applicant, experienceSummary: event.target.value })} />
                        </Grid>
                      </Grid>
                    </Box>

                    <Box>
                      <Typography variant="h6" gutterBottom>Education</Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <TextField fullWidth label="School" value={applicant.educationSchool} onChange={(event) => setApplicant({ ...applicant, educationSchool: event.target.value })} />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField fullWidth label="Degree" value={applicant.educationDegree} onChange={(event) => setApplicant({ ...applicant, educationDegree: event.target.value })} />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField fullWidth label="Start year" type="number" value={applicant.educationStartYear} onChange={(event) => setApplicant({ ...applicant, educationStartYear: event.target.value })} />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField fullWidth label="End year" type="number" value={applicant.educationEndYear} onChange={(event) => setApplicant({ ...applicant, educationEndYear: event.target.value })} />
                        </Grid>
                      </Grid>
                    </Box>
                  </>
                )}

                <Button variant="contained" onClick={() => saveProfile.mutate()} disabled={saveProfile.isPending}>
                  Save profile
                </Button>
              </Stack>
            </CardContent>
          </Card>

          {user.role === 'applicant' && (
            <Card>
              <CardContent sx={{ p: 4 }}>
                <Stack spacing={2}>
                  <Typography variant="h5">Resume</Typography>
                  {uploadResume.isSuccess && <Alert severity="success">Resume updated.</Alert>}
                  {uploadResume.isError && <Alert severity="error">{errorMessage(uploadResume.error)}</Alert>}
                  <Typography color="text.secondary">
                    Current resume: {user.applicantProfile?.resume?.fileName || 'No profile resume uploaded yet'}
                  </Typography>
                  {user.applicantProfile?.resumeAnalysis?.status === 'succeeded' && (
                    <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2 }}>
                      <Stack spacing={1.5}>
                        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1}>
                          <Typography variant="h6">ATS resume score</Typography>
                          <Chip label={`${user.applicantProfile.resumeAnalysis.score}/100`} color="primary" />
                        </Stack>
                        <LinearProgress variant="determinate" value={user.applicantProfile.resumeAnalysis.score} sx={{ height: 8, borderRadius: 4 }} />
                        <Typography color="text.secondary">{user.applicantProfile.resumeAnalysis.summary}</Typography>
                        <Box>
                          <Typography variant="subtitle2" gutterBottom>What is working</Typography>
                          <Stack direction="row" spacing={1} flexWrap="wrap">
                            {user.applicantProfile.resumeAnalysis.strengths?.map((item) => <Chip key={item} label={item} color="success" variant="outlined" />)}
                          </Stack>
                        </Box>
                        <Box>
                          <Typography variant="subtitle2" gutterBottom>Improve this before applying</Typography>
                          <Stack spacing={1}>
                            {user.applicantProfile.resumeAnalysis.improvements?.map((item) => (
                              <Typography key={item} color="text.secondary">- {item}</Typography>
                            ))}
                          </Stack>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          Provider: {user.applicantProfile.resumeAnalysis.provider || 'demo'}
                        </Typography>
                      </Stack>
                    </Box>
                  )}
                  {user.applicantProfile?.resumeAnalysis?.status === 'failed' && (
                    <Alert severity="warning">{user.applicantProfile.resumeAnalysis.error || 'Resume analysis failed.'}</Alert>
                  )}
                  <Button component="label" variant="outlined" startIcon={<UploadFileIcon />}>
                    {resume ? resume.name : 'Choose PDF or DOCX'}
                    <input
                      hidden
                      type="file"
                      accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={(event) => setResume(event.target.files[0])}
                    />
                  </Button>
                  <Button variant="contained" disabled={!resume || uploadResume.isPending} onClick={() => uploadResume.mutate()}>
                    Upload resume
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          )}
        </Stack>
      </Grid>
    </Grid>
  );
}
