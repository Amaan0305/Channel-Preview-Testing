import React, { useState } from 'react';

const FormComponent = ({ channels }) => {
  const [option1, setOption1] = useState('');
  const [inputUrl, setInputUrl] = useState('');
  const [inputScenario, setInputScenario] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch('/api/addLink', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: inputUrl,
          channel: option1,
          scenario: inputScenario,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.message === 'URL already exists') {
          setError('This URL already exists in the selected channel.');
        } else {
          setError('Failed to add URL. Please try again.');
        }
        throw new Error(data.message);
      }

      setSuccess('URL added successfully');
      setInputUrl('');
      setInputScenario('');
      setOption1('');

      console.log('Response:', data);
      // Optionally, you can update your UI or state based on the response data
    } catch (error) {
      console.error('Error adding URL:', error);
      if (!error.message.includes('URL already exists')) {
        setError('Error adding URL. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto p-8 bg-white shadow-md rounded-lg">
      <div className="mb-4">
        <label htmlFor="dropdown1" className="block text-lg font-semibold text-gray-900 mb-2">
          Select Channel
        </label>
        <select
          id="dropdown1"
          value={option1}
          onChange={(e) => setOption1(e.target.value)}
          className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="" disabled>
            Select a Channel
          </option>
          {channels.map((channel) => (
            <option key={channel} value={channel}>
              {channel.charAt(0).toUpperCase() + channel.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label htmlFor="inputUrl" className="block text-lg font-semibold text-gray-900 mb-2">
          Enter URL
        </label>
        <input
          id="inputUrl"
          type="text"
          value={inputUrl}
          onChange={(e) => setInputUrl(e.target.value)}
          className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="Enter URL"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="inputScenario" className="block text-lg font-semibold text-gray-900 mb-2">
          Enter Scenario
        </label>
        <input
          id="inputScenario"
          type="text"
          value={inputScenario}
          onChange={(e) => setInputScenario(e.target.value)}
          className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="Enter Scenario"
        />
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}
      {success && <p className="text-green-500 mb-4">{success}</p>}

      <div>
        <button
          type="submit"
          className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Submit'}
        </button>
      </div>
    </form>
  );
};

export default FormComponent;
