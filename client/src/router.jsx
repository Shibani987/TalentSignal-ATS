
import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from './ui/AppLayout.jsx';
import { ProtectedRoute } from './ui/ProtectedRoute.jsx';
import { RouteError } from './ui/RouteError.jsx';
import { Login } from './views/Login.jsx';
import { Register } from './views/Register.jsx';
import { JobBoard } from './views/JobBoard.jsx';
import { JobDetail } from './views/JobDetail.jsx';
import { ApplicantDashboard } from './views/ApplicantDashboard.jsx';
import { ApplicationDetail } from './views/ApplicationDetail.jsx';
import { RecruiterDashboard } from './views/RecruiterDashboard.jsx';
import { JobsManage } from './views/JobsManage.jsx';
import { Candidates } from './views/Candidates.jsx';
import { CandidateDetail } from './views/CandidateDetail.jsx';
import { Profile } from './views/Profile.jsx';

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    errorElement: <RouteError />,
    children: [
      { path: '/', element: <JobBoard /> },
      { path: '/jobs/:id', element: <JobDetail /> },
      { path: '/login', element: <Login /> },
      { path: '/register', element: <Register /> },
      { path: '/applicant', element: <ProtectedRoute role="applicant"><ApplicantDashboard /></ProtectedRoute> },
      { path: '/applicant/applications/:id', element: <ProtectedRoute role="applicant"><ApplicationDetail /></ProtectedRoute> },
      { path: '/recruiter', element: <ProtectedRoute role="recruiter"><RecruiterDashboard /></ProtectedRoute> },
      { path: '/recruiter/jobs', element: <ProtectedRoute role="recruiter"><JobsManage /></ProtectedRoute> },
      { path: '/recruiter/candidates', element: <ProtectedRoute role="recruiter"><Candidates /></ProtectedRoute> },
      { path: '/recruiter/candidates/:id', element: <ProtectedRoute role="recruiter"><CandidateDetail /></ProtectedRoute> },
      { path: '/profile', element: <ProtectedRoute><Profile /></ProtectedRoute> },
      { path: '*', element: <Navigate to="/" replace /> }
    ]
  }
]);
