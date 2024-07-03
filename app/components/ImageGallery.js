import React, { useState, useEffect } from 'react';

const ImageGallery = ({ imagePaths, onFixedSuccess }) => {
  const labels = ["old", "new", "difference"];
  const [loading, setLoading] = useState(false); // State for loading indicator

  useEffect(() => {
    console.log('Image paths updated:', imagePaths);
  }, []);

  const fixed = async (channel, referenceUrl, onFixedSuccess) => {
    console.log(channel);
    console.log(referenceUrl);
    setLoading(true); // Set loading to true when fixing starts

    try {
      const response = await fetch("/api/fixed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel,
          referenceUrl,
        })
      });
      console.log(response);

      // Call the callback to refresh image paths
      if (response.ok) {
        onFixedSuccess();
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false); // Set loading to false when fixing ends (success or error)
    }
  }

  return (
    <div className='m-4'>
      {Object.keys(imagePaths).map((platform, index) => (
        <div key={index} style={{ marginBottom: '20px' }}>
          <h1>{platform.charAt(0).toUpperCase() + platform.slice(1)}</h1>
          {Object.keys(imagePaths[platform]).map((folder, idx) => (
            <div key={idx} style={{ marginBottom: '10px' }}>
              <h3>
                {folder}
                <button
                  className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 m-2 rounded'
                  onClick={() => fixed(platform, imagePaths[platform][folder][0], onFixedSuccess)}
                  disabled={loading} // Disable button when loading
                >
                  {loading ? 'Fixing...' : 'Fixed'}
                </button>
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: "space-around" }}>
                {imagePaths[platform][folder].map((imagePath, imgIdx) => (
                  <div key={imgIdx} style={{ textAlign: 'center', marginRight: '10px', marginBottom: '10px' }}>
                    <img
                      src={imagePath}
                      alt={`${platform}/${folder}/${imgIdx}`}
                      style={{ width: '400px', height: 'auto' }}
                    />
                    <div style={{ marginTop: '5px' }}>{labels[imgIdx % labels.length]}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default ImageGallery;
