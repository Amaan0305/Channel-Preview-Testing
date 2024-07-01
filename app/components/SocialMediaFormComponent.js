import React, { useState } from 'react';
import Editor from '@monaco-editor/react';

const exampleCode = `// Example code:
const closeButton = document.querySelector('div[role=button][aria-label="Close"]');
if (closeButton) {
  closeButton.click();
}

// Wait for the nosnippet element to appear
const waitForNosnippet = new Promise(resolve => {
  const interval = setInterval(() => {
    const nosnippetDiv = document.querySelector('div[data-nosnippet]');
    if (nosnippetDiv) {
      clearInterval(interval);
      resolve();
    }
  }, 100); // Adjust interval as needed
});

return waitForNosnippet.then(() => {
  // Add style tag to hide elements
  const style = document.createElement('style');
  style.textContent = \`
    div[data-nosnippet], div[role=banner] {
      display: none !important;
    }
  \`;
  document.head.appendChild(style);
});
`;

const SocialMediaFormComponent = ({ onSubmit }) => {
  const [channelName, setChannelName] = useState('');
  const [divSelector, setDivSelector] = useState('');
  const [loginByPass, setLoginByPass] = useState(exampleCode); // Set example code as initial value
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleEditorChange = (value, event) => {
    setLoginByPass(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const formData = {
      channelName,
      divSelector,
      data: [],
      loginByPass
    };

    try {
      await onSubmit(formData);
      setChannelName('');
      setDivSelector('');
      setLoginByPass(exampleCode); // Reset to example code after submission
      setSuccess('Form submitted successfully');
    } catch (err) {
      setError('Error submitting form: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto p-8 bg-white shadow-md rounded-lg">
      <div className="mb-6">
        <label htmlFor="channelName" className="block text-lg font-semibold text-gray-900 mb-2">Channel Name</label>
        <input
          type="text"
          id="channelName"
          value={channelName}
          onChange={(e) => setChannelName(e.target.value)}
          placeholder="Enter Channel Name"
          className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          required
        />
      </div>
      <div className="mb-6">
        <label htmlFor="divSelector" className="block text-lg font-semibold text-gray-900 mb-2">Div Selector</label>
        <input
          type="text"
          id="divSelector"
          value={divSelector}
          onChange={(e) => setDivSelector(e.target.value)}
          placeholder="Enter DivSelector"
          className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          required
        />
      </div>
      <div className="mb-6">
        <label htmlFor="loginByPass" className="block text-lg font-semibold text-gray-900 mb-2">Login ByPass</label>
        <div className="border border-gray-300 rounded-md">
          <Editor
            height="400px" // Initial height
            defaultLanguage="javascript"
            theme="vs-dark"
            value={loginByPass}
            onChange={handleEditorChange}
            options={{
              minimap: { enabled: false },
              scrollbar: { verticalScrollbarSize: 8, horizontalScrollbarSize: 8 },
              lineNumbers: 'on',
              glyphMargin: false,
              folding: false,
              lineNumbersMinChars: 3
            }}
          />
        </div>
      </div>
      {loading && <div className="text-blue-500 mb-4">Submitting...</div>}
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {success && <div className="text-green-500 mb-4">{success}</div>}
      <button type="submit" className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}>
        Submit
      </button>
    </form>
  );
};

export default SocialMediaFormComponent;
