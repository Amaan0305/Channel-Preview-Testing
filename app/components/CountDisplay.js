import React, { useState, useEffect, memo } from 'react';
import { Box, Typography, Alert, Snackbar } from '@mui/material';

const CountDisplay = ({ jobId }) => {
  const [totalTests, setTotalTests] = useState(0);
  const [failedTests, setFailedTests] = useState(0);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    if (jobId) {
      fetchTestCounts(jobId);
    }
  }, [jobId]);

  const fetchTestCounts = async (jobId) => {
    try {
      const response = await fetch(`/api/getTestCounts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      });

      if (response.ok) {
        const data = await response.json();
        setTotalTests(data.totalTests || 0);
        setFailedTests(data.failedTests || 0);
      } else {
        setErrorMessage("Failed to fetch test counts.");
      }
    } catch (error) {
      setErrorMessage("Failed to fetch test counts.");
    }
  };

  return (
    <div>
      {errorMessage && (
        <Snackbar open={!!errorMessage} autoHideDuration={6000} onClose={() => setErrorMessage(null)} style={{ marginBottom: "20px" }}>
          <Alert onClose={() => setErrorMessage(null)} severity="error">
            {errorMessage}
          </Alert>
        </Snackbar>
      )}
      <div style={{ display: "flex", justifyContent: "space-around", marginBottom: "20px" }}>
        <Box 
          width="30%" 
          bgcolor="#f0f0f0" 
          p={2} 
          borderRadius={10} 
          boxShadow={3} // Added shadow for card-like effect
          display="flex" 
          flexDirection="column" 
          alignItems="center"
        >
          <Typography variant="body1">Total Tests: {totalTests}</Typography>
        </Box>
        <Box 
          width="30%" 
          bgcolor="#66BB6A" 
          p={2} 
          borderRadius={10} 
          boxShadow={3} // Added shadow for card-like effect
          display="flex" 
          flexDirection="column" 
          alignItems="center"
        >
          <Typography variant="body1">Success: {totalTests - failedTests}</Typography>
        </Box>
        <Box 
          width="30%" 
          bgcolor="#EF5350" 
          p={2} 
          borderRadius={10} 
          boxShadow={3} // Added shadow for card-like effect
          display="flex" 
          flexDirection="column" 
          alignItems="center"
        >
          <Typography variant="body1">Failed: {failedTests}</Typography>
        </Box>
      </div>
    </div>
  );
};

export default memo(CountDisplay);
