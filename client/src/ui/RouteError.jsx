import React from 'react';
import { Alert, Box, Button, Card, CardContent, Stack, Typography } from '@mui/material';
import { Link, useRouteError } from 'react-router-dom';

export function RouteError() {
  const error = useRouteError();
  return (
    <Box className="page-shell" sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 3 }}>
      <Card sx={{ maxWidth: 640, width: '100%' }}>
        <CardContent sx={{ p: 4 }}>
          <Stack spacing={2}>
            <Typography variant="h4">Something needs attention</Typography>
            <Alert severity="error">{error?.message || 'The page could not be loaded.'}</Alert>
            <Typography color="text.secondary">
              Refresh the page. If it repeats, check the browser console for the first red error.
            </Typography>
            <Button component={Link} to="/" variant="contained">Go to jobs</Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
