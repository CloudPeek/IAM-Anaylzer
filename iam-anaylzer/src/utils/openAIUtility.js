// src/utils/openAIUtility.js
export const analyzePolicy = async (apiKey, policyDocument) => {
    try {
      const response = await fetch('/api/analyzePolicy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apiKey, policyDocument }),
      });
  
      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }
  
      const data = await response.json();
      return data.analysis;
    } catch (error) {
      console.error('Error analyzing policy:', error);
      return 'Analysis failed.';
    }
  };
  