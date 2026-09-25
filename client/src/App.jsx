import { Box, Button, Chip, Container, Stack, Typography } from "@mui/material";

function App() {
  const stats = [
    { label: "Active roles", value: "18" },
    { label: "Candidates screened", value: "1,248" },
    { label: "Avg. shortlist time", value: "12m" },
  ];

  const pipeline = [
    { label: "Applied", count: 84, color: "#2563eb" },
    { label: "Screening", count: 37, color: "#7c3aed" },
    { label: "Interview", count: 16, color: "#059669" },
    { label: "Offer", count: 5, color: "#d97706" },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #f8fafc 0%, #eef2ff 45%, #f7fee7 100%)",
        color: "#111827",
      }}
    >
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 7 } }}>
        <Stack spacing={5}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={4}
            alignItems={{ xs: "flex-start", md: "center" }}
            justifyContent="space-between"
          >
            <Box sx={{ maxWidth: 620 }}>
              <Chip
                label="AI recruiting workspace"
                sx={{
                  mb: 2,
                  bgcolor: "#dcfce7",
                  color: "#166534",
                  fontWeight: 700,
                }}
              />
              <Typography
                component="h1"
                variant="h2"
                sx={{ fontWeight: 800, letterSpacing: 0, lineHeight: 1.05 }}
              >
                AI-Powered ATS
              </Typography>

              <Typography
                variant="h6"
                sx={{ mt: 2, color: "#4b5563", maxWidth: 560, lineHeight: 1.6 }}
              >
                Review resumes, prioritize qualified candidates, and keep the
                hiring pipeline moving from one focused dashboard.
              </Typography>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 4 }}>
                <Button variant="contained" size="large">
                  View Jobs
                </Button>
                <Button variant="outlined" size="large">
                  Review Candidates
                </Button>
              </Stack>
            </Box>

            <Box
              aria-label="Hiring pipeline summary"
              sx={{
                width: { xs: "100%", md: 380 },
                bgcolor: "rgba(255,255,255,0.82)",
                border: "1px solid #e5e7eb",
                borderRadius: 2,
                boxShadow: "0 24px 70px rgba(15,23,42,0.12)",
                p: 3,
              }}
            >
              <Typography variant="overline" sx={{ color: "#6b7280", fontWeight: 700 }}>
                Pipeline today
              </Typography>
              <Stack spacing={2} sx={{ mt: 2 }}>
                {pipeline.map((stage) => (
                  <Box key={stage.label}>
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.75 }}>
                      <Typography fontWeight={700}>{stage.label}</Typography>
                      <Typography color="text.secondary">{stage.count}</Typography>
                    </Stack>
                    <Box sx={{ height: 8, borderRadius: 999, bgcolor: "#e5e7eb" }}>
                      <Box
                        sx={{
                          width: `${Math.max(stage.count, 12)}%`,
                          maxWidth: "100%",
                          height: "100%",
                          borderRadius: 999,
                          bgcolor: stage.color,
                        }}
                      />
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Box>
          </Stack>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
              gap: 2,
            }}
          >
            {stats.map((item) => (
              <Box
                key={item.label}
                sx={{
                  bgcolor: "rgba(255,255,255,0.76)",
                  border: "1px solid #e5e7eb",
                  borderRadius: 2,
                  p: 3,
                }}
              >
                <Typography variant="h4" fontWeight={800}>
                  {item.value}
                </Typography>
                <Typography sx={{ mt: 0.5, color: "#6b7280" }}>{item.label}</Typography>
              </Box>
            ))}
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}

export default App;
