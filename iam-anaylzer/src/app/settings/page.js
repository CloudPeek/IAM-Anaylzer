'use client'
import React, { useState, useEffect } from 'react';
import { AWSStsReturns } from '@/components/AWSHelper';
import ErrorNotification from '@/components/Error';

const Settings = () => {
  const [accessKeyId, setAccessKeyId] = useState('');
  const [secretAccessKey, setSecretAccessKey] = useState('');
  const [sessionToken, setSessionToken] = useState('');
  const [apiKey, setApiKey] = useState(''); // Initialize API key state
  const [arn, setArn] = useState('');
  const [error, setError] = useState('');
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    // Retrieve tokens and API key from local storage when component mounts
    const storedAccessKeyId = localStorage.getItem('accessKeyId');
    const storedSecretAccessKey = localStorage.getItem('secretAccessKey');
    const storedSessionToken = localStorage.getItem('sessionToken');
    const storedApiKey = localStorage.getItem('openaiApiKey');

    if (storedAccessKeyId) setAccessKeyId(storedAccessKeyId);
    if (storedSecretAccessKey) setSecretAccessKey(storedSecretAccessKey);
    if (storedSessionToken) setSessionToken(storedSessionToken);
    if (storedApiKey) setApiKey(storedApiKey);
  }, []);

  const handleApiKeyChange = (event) => {
    setApiKey(event.target.value);
    localStorage.setItem('openaiApiKey', event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      // Store tokens in local storage
      localStorage.setItem('accessKeyId', accessKeyId);
      localStorage.setItem('secretAccessKey', secretAccessKey);
      localStorage.setItem('sessionToken', sessionToken);

      const result = await AWSStsReturns(accessKeyId, secretAccessKey, sessionToken);
      setArn(result);
    } catch (error) {
      setError('Authentication failed. Please check your credentials.');
      setShowError(true);
      console.error('Authentication failed:', error);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md space-y-4">
      <h2 className="text-2xl font-bold text-black">Settings</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-black">Access Key ID:</label>
          <input
            type="text"
            value={accessKeyId}
            onChange={(e) => setAccessKeyId(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-black"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-black">Secret Access Key:</label>
          <input
            type="text"
            value={secretAccessKey}
            onChange={(e) => setSecretAccessKey(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-black"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-black">Session Token:</label>
          <input
            type="text"
            value={sessionToken}
            onChange={(e) => setSessionToken(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-black"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-black">OpenAI API Key:</label>
          <input
            type="text"
            value={apiKey}
            onChange={handleApiKeyChange}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-black"
          />
        </div>
        <button type="submit" className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700">
          Authenticate
        </button>
      </form>
      {arn && (
        <div className="mt-4 p-4 bg-gray-100 rounded-md">
          <h3 className="text-xl font-bold text-black">Assumed IAM Role ARN:</h3>
          <p className="text-black">{arn}</p>
        </div>
      )}
      <ErrorNotification message={error} show={showError} setShow={setShowError} />
    </div>
  );
};

export default Settings;
