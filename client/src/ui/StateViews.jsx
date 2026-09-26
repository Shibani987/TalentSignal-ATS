import React from 'react';
import { Alert, Box, CircularProgress, Typography } from '@mui/material';

export function LoadingState({ label = 'Loading' }) {
  return <Box sx={{ py: 8, display: 'grid', placeItems: 'center', gap: 2 }}><CircularProgress /><Typography color="text.secondary">{label}</Typography></Box>;
}

export function ErrorState({ message }) {
  return <Alert severity="error">{message}</Alert>;
}

export function EmptyState({ title, body }) {
  return <Box sx={{ py: 8, textAlign: 'center' }}><Typography variant="h5">{title}</Typography><Typography color="text.secondary">{body}</Typography></Box>;
}
