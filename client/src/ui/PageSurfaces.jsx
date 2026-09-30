import React from 'react';
import { Box, Card, CardContent, Chip, Stack, Typography } from '@mui/material';

export function PageHero({ eyebrow, title, body, icon, actions, children, tone = 'teal' }) {
  const tones = {
    teal: ['#0f4657', '#0f9f6e'],
    orange: ['#7c2d12', '#f97316'],
    blue: ['#1e3a8a', '#155e75']
  };
  const [from, to] = tones[tone] || tones.teal;

  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 3,
        p: { xs: 3, md: 4 },
        border: '1px solid rgba(148, 163, 184, 0.24)',
        color: '#fff',
        background: `linear-gradient(135deg, ${from}, ${to})`,
        boxShadow: '0 24px 80px rgba(15, 23, 42, 0.14)'
      }}
    >
      <Box
        className="soft-pulse"
        sx={{
          position: 'absolute',
          right: { xs: -90, md: 64 },
          top: { xs: -90, md: -62 },
          width: { xs: 220, md: 320 },
          height: { xs: 220, md: 320 },
          borderRadius: '50%',
          bgcolor: 'rgba(255,255,255,0.13)'
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          right: { xs: 28, md: 180 },
          bottom: { xs: -84, md: -120 },
          width: { xs: 180, md: 280 },
          height: { xs: 180, md: 280 },
          borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.16)'
        }}
      />
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems={{ xs: 'flex-start', md: 'center' }} justifyContent="space-between" sx={{ position: 'relative' }}>
        <Box sx={{ maxWidth: 760 }}>
          <Chip icon={icon} label={eyebrow} sx={{ mb: 2, color: '#fff', bgcolor: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.2)', '& .MuiChip-icon': { color: '#fff' } }} />
          <Typography variant="h3" sx={{ maxWidth: 740 }}>{title}</Typography>
          <Typography sx={{ mt: 1.4, maxWidth: 650, color: 'rgba(255,255,255,0.78)', fontSize: 17, lineHeight: 1.65 }}>{body}</Typography>
          {actions && <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25} sx={{ mt: 3 }}>{actions}</Stack>}
        </Box>
        {children}
      </Stack>
    </Box>
  );
}

export function MetricCard({ label, value, icon, accent = '#0f9f6e' }) {
  return (
    <Card className="interactive-card" sx={{ height: '100%' }}>
      <CardContent sx={{ p: 2.5 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box sx={{ width: 44, height: 44, borderRadius: 2, display: 'grid', placeItems: 'center', color: accent, bgcolor: `${accent}18` }}>
            {icon}
          </Box>
          <Box>
            <Typography variant="h4" sx={{ lineHeight: 1 }}>{value}</Typography>
            <Typography color="text.secondary">{label}</Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
