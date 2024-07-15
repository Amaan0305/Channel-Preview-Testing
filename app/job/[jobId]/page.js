"use client";
import ImageGallery from "@/app/components/ImageGallery";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Loader from "@/app/components/Loader";
import Link from "next/link";
import { Button, Snackbar, Alert } from "@mui/material";
import CountDisplay from "@/app/components/CountDisplay";

export default function JobGallery() {
  const pathname = usePathname();
  const jobId = pathname.split("/").pop();
  const [loading, setLoading] = useState(false);
  const [mostRecentJobId, setMostRecentJobId] = useState(null);
  const [jobDate, setJobDate] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    fetchMostRecentJobId();
  }, []);

  useEffect(() => {
    if (jobId) {
      fetchJobDate(jobId);
    }
  }, [jobId]);

  const fetchMostRecentJobId = async () => {
    try {
      const response = await fetch("/api/getMostRecentJobId", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        const data = await response.json();
        setMostRecentJobId(data.jobId);
      } else {
        setErrorMessage("Failed to fetch most recent job ID.");
      }
    } catch (error) {
      setErrorMessage("Failed to fetch most recent job ID.");
    }
  };

  const fetchJobDate = async (jobId) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/getJobDate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      });

      if (response.ok) {
        const data = await response.json();
        setJobDate(formatDate(data.jobDate));
      } else {
        setErrorMessage("Failed to fetch job date.");
      }
    } catch (error) {
      setErrorMessage("Failed to fetch job date.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const istOptions = {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    };
    return date.toLocaleString('en-IN', istOptions);
  };

  return (
    <div style={{ textAlign: "center", margin: "20px", padding: "20px", border: "1px solid #ddd", borderRadius: "10px", backgroundColor: "#f9f9f9" }}>
      <h1 className="head-text" style={{ color: "#333", marginBottom: "20px" }}>Image Gallery For Job Dated {jobDate}</h1>
      {errorMessage && (
        <Snackbar open={!!errorMessage} autoHideDuration={6000} onClose={() => setErrorMessage(null)} style={{ marginBottom: "20px" }}>
          <Alert onClose={() => setErrorMessage(null)} style={{ marginBottom: "20px" }} severity="error">
            {errorMessage}
          </Alert>
        </Snackbar>
      )}
      {loading ? (
        <Loader color="#00BFFF" height={50} width={200} />
      ) : (
        <>
          <CountDisplay jobId={jobId} />
          <ImageGallery showFixedButton={mostRecentJobId === jobId} jobId={jobId} />
        </>
      )}
      <Link href="/">
        <Button variant="contained" color="primary" style={{ margin: "10px" }}>
          Back to Home
        </Button>
      </Link>
    </div>
  );
}
