import { Box, Button, Container, Typography } from "@mui/material";

function App() {
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 6 }}>
        <Typography variant="h3" fontWeight="bold">
          AI-Powered ATS
        </Typography>

        <Typography variant="h6" sx={{ mt: 2 }}>
          Applicant Tracking System
        </Typography>

        <Button variant="contained" sx={{ mt: 4 }}>
          View Jobs
        </Button>
      </Box>
    </Container>
  );
}

export default App;