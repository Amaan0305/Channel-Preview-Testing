"use client"

import ImageGallery from "./components/ImageGallery";
import { useEffect, useState } from "react";
import Loader from "./components/loader";
import Link from "next/link";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [imagePaths, setImagePaths] = useState([]);

  useEffect(() => {
    fetchImagePaths();
  }, []);

  const fetchImagePaths = async () => {
    try {
      const response = await fetch("/api/getImagePaths", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      console.log("Image Paths",data);
      setImagePaths(data);
    } catch (error) {
      console.error("Failed to fetch image paths:", error);
    }
  };

  const runTest = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/runTest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      // After test completes, fetch image paths again to update the gallery
      await fetchImagePaths();
    } catch (err) {
      console.log("Error running test:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-align:center">
      <h1 className="head-text">Channel Preview Testing</h1>

      {loading ? (
        <Loader type="TailSpin" color="#00BFFF" height={50} width={50} />
      ) : (
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 m-2 rounded"
          onClick={runTest}
          disabled={loading} // Disable button when loading
        >
          Run Test
        </button>
      )}
      <Link href="./admin">
        <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 m-2 rounded">
          Go to Admin Page
        </button>
      </Link>
      {Object.keys(imagePaths).map(jobDate => (
        <div key={jobDate}>
          <h2>{jobDate}</h2>
          <ImageGallery imagePaths={imagePaths[jobDate]} />
        </div>
      ))}
    </div>
  );
}
