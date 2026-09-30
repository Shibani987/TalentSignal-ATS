import React from 'react';
import { Alert, Box, Button, Card, CardContent, Chip, Grid, LinearProgress, Stack, TextField, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { api, errorMessage } from '../api/client.js';
import { useAuth } from '../state/AuthContext.jsx';
import { PageHero } from '../ui/PageSurfaces.jsx';

const emptyExperience = { title: '', company: '', years: '', summary: '' };
const emptyEducation = { school: '', degree: '', startYear: '', endYear: '' };

function initialList(items, fallback) {
  return items?.length ? items.map((item) => ({ ...fallback, ...item })) : [{ ...fallback }];
}

export function Profile() {
  const { user, refresh } = useAuth();
  const profile = user.applicantProfile || {};
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
    skills: profile.skills?.join(', ') || ''
  });
  const [experiences, setExperiences] = useState(() => initialList(profile.experience, emptyExperience));
  const [educations, setEducations] = useState(() => initialList(profile.education, emptyEducation));
  const [resume, setResume] = useState(null);

  const updateExperience = (index, patch) => {
    setExperiences((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item));
  };

  const updateEducation = (index, patch) => {
    setEducations((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item));
  };

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
              experience: experiences
                .map((item) => ({ ...item, years: Number(item.years || 0) }))
                .filter((item) => item.title || item.company || item.summary),
              education: educations
                .map((item) => ({ ...item, startYear: Number(item.startYear || 0), endYear: Number(item.endYear || 0) }))
                .filter((item) => item.school || item.degree)
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
          <PageHero
            eyebrow={user.role === 'recruiter' ? 'Recruiter profile' : 'Candidate profile'}
            title="Keep your hiring identity sharp."
            body="Update account details, profile context, and resume signals used across TalentSignal ATS."
            icon={<ManageAccountsIcon />}
            tone={user.role === 'recruiter' ? 'blue' : 'teal'}
          >
            <Card className="float-card" sx={{ width: { xs: '100%', md: 280 }, bgcolor: 'rgba(255,255,255,0.92)' }}>
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="subtitle2" color="text.secondary">Signed in as</Typography>
                <Typography variant="h5" color="text.primary">{user.name}</Typography>
                <Chip sx={{ mt: 1 }} size="small" label={user.role} color="primary" variant="outlined" />
              </CardContent>
            </Card>
          </PageHero>

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
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                        <Typography variant="h6">Experience</Typography>
                        <Button size="small" startIcon={<AddIcon />} onClick={() => setExperiences((items) => [...items, { ...emptyExperience }])}>Add experience</Button>
                      </Stack>
                      <Stack spacing={2}>
                        {experiences.map((experience, index) => (
                          <Box key={`experience-${index}`} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2, bgcolor: 'rgba(255,255,255,0.58)' }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                              <Typography variant="subtitle2">Experience {index + 1}</Typography>
                              {experiences.length > 1 && (
                                <Button size="small" color="error" startIcon={<RemoveCircleOutlineIcon />} onClick={() => setExperiences((items) => items.filter((_, itemIndex) => itemIndex !== index))}>
                                  Remove
                                </Button>
                              )}
                            </Stack>
                            <Grid container spacing={2}>
                              <Grid item xs={12} md={4}>
                                <TextField fullWidth label="Title" value={experience.title} onChange={(event) => updateExperience(index, { title: event.target.value })} />
                              </Grid>
                              <Grid item xs={12} md={4}>
                                <TextField fullWidth label="Company" value={experience.company} onChange={(event) => updateExperience(index, { company: event.target.value })} />
                              </Grid>
                              <Grid item xs={12} md={4}>
                                <TextField fullWidth label="Years" type="number" value={experience.years} onChange={(event) => updateExperience(index, { years: event.target.value })} />
                              </Grid>
                              <Grid item xs={12}>
                                <TextField fullWidth label="Experience summary" multiline minRows={3} value={experience.summary} onChange={(event) => updateExperience(index, { summary: event.target.value })} />
                              </Grid>
                            </Grid>
                          </Box>
                        ))}
                      </Stack>
                    </Box>

                    <Box>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                        <Typography variant="h6">Education</Typography>
                        <Button size="small" startIcon={<AddIcon />} onClick={() => setEducations((items) => [...items, { ...emptyEducation }])}>Add education</Button>
                      </Stack>
                      <Stack spacing={2}>
                        {educations.map((education, index) => (
                          <Box key={`education-${index}`} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2, bgcolor: 'rgba(255,255,255,0.58)' }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                              <Typography variant="subtitle2">Education {index + 1}</Typography>
                              {educations.length > 1 && (
                                <Button size="small" color="error" startIcon={<RemoveCircleOutlineIcon />} onClick={() => setEducations((items) => items.filter((_, itemIndex) => itemIndex !== index))}>
                                  Remove
                                </Button>
                              )}
                            </Stack>
                            <Grid container spacing={2}>
                              <Grid item xs={12} md={6}>
                                <TextField fullWidth label="School" value={education.school} onChange={(event) => updateEducation(index, { school: event.target.value })} />
                              </Grid>
                              <Grid item xs={12} md={6}>
                                <TextField fullWidth label="Degree" value={education.degree} onChange={(event) => updateEducation(index, { degree: event.target.value })} />
                              </Grid>
                              <Grid item xs={12} md={6}>
                                <TextField fullWidth label="Start year" type="number" value={education.startYear} onChange={(event) => updateEducation(index, { startYear: event.target.value })} />
                              </Grid>
                              <Grid item xs={12} md={6}>
                                <TextField fullWidth label="End year" type="number" value={education.endYear} onChange={(event) => updateEducation(index, { endYear: event.target.value })} />
                              </Grid>
                            </Grid>
                          </Box>
                        ))}
                      </Stack>
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
                    <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2, bgcolor: 'rgba(255,255,255,0.62)' }}>
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
