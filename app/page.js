"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Button,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DeleteIcon from "@mui/icons-material/Delete";
import Loader from "./components/Loader";
import CountDisplay from "./components/CountDisplay";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [jobData, setJobData] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [deletingJobId, setDeletingJobId] = useState(null);
  const [openAccordions, setOpenAccordions] = useState([]);

  useEffect(() => {
    fetchJobData();
  }, []);

  const fetchJobData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/getPaths");
      if (!response.ok) {
        throw new Error("Failed to fetch job data");
      }
      const data = await response.json();
      setJobData(data);
      setOpenAccordions(Array(data.length).fill(false));
      setOpenAccordions((prev) => {
        const updated = [...prev];
        for (let i = 0; i < Math.min(5, data.length); i++) {
          updated[i] = true; // Open first 5 accordions
        }
        return updated;
      });
    } catch (error) {
      console.error("Error fetching job data:", error);
      setErrorMessage("Failed to fetch job data");
    } finally {
      setLoading(false);
    }
  };

  const deleteJob = async (jobId) => {
    try {
      setLoading(true);
      setDeletingJobId(jobId);
      const response = await fetch(`/api/deleteJob?jobId=${jobId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete job");
      }
      await fetchJobData();
      setSuccessMessage("Job deleted successfully");
    } catch (error) {
      console.error("Error deleting job:", error);
      setErrorMessage("Failed to delete job");
    } finally {
      setLoading(false);
      setDeletingJobId(null);
    }
  };

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSuccessMessage("");
    setErrorMessage("");
  };

  const handleAccordionChange = (index) => {
    setOpenAccordions((prev) =>
      prev.map((isOpen, i) => (i === index ? !isOpen : isOpen))
    );
  };

  return (
    <div style={{ textAlign: "center", padding: "0 20px", borderRadius: "8px" }}>
      <header style={{ marginBottom: "20px" }}>
        <Typography variant="h4" className="head-text">Channel Preview Testing</Typography>
        <Link href="/admin" passHref>
          <Button variant="contained" color="secondary" style={{ margin: "10px" }}>
            Go to Admin Page
          </Button>
        </Link>
      </header>

      {loading && <Loader size={50} color="primary" />}

      {jobData.map(({ jobId, jobDate }, index) => (
        <Accordion
          key={jobId}
          expanded={openAccordions[index]}
          onChange={() => handleAccordionChange(index)}
          sx={{
            borderRadius: "12px",
            marginBottom: "10px",
            border: openAccordions[index] ?  "1px solid rgba(0, 0, 0, 0.12)" : "none", // No border when expanded
            boxShadow: openAccordions[index] ?  "initial" : "none", // Remove shadow when expanded
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls={`${jobDate}-content`}
            id={`${jobDate}-header`}
          >
            <Typography variant="h6">{jobDate}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <CountDisplay jobId={jobId} />
            <Link href={`/job/${jobId}`} passHref>
              <Button variant="contained" color="primary" style={{ marginRight: "10px" }}>
                View Details
              </Button>
            </Link>
            <Tooltip title="Delete Job">
              <IconButton
                aria-label="delete"
                onClick={() => deleteJob(jobId)}
                disabled={loading}
                sx={{ "&:hover": { backgroundColor: "rgba(255, 0, 0, 0.1)" } }}
              >
                {deletingJobId === jobId ? <CircularProgress size={24} /> : <DeleteIcon />}
              </IconButton>
            </Tooltip>
          </AccordionDetails>
        </Accordion>
      ))}


      <Snackbar open={!!successMessage} autoHideDuration={6000} onClose={handleClose}>
        <Alert onClose={handleClose} severity="success">
          {successMessage}
        </Alert>
      </Snackbar>

      <Snackbar open={!!errorMessage} autoHideDuration={6000} onClose={handleClose}>
        <Alert onClose={handleClose} severity="error">
          {errorMessage}
        </Alert>
      </Snackbar>
    </div>
  );
}
