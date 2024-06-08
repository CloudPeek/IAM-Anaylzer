import { overviewAnalysis } from '@/utils/openAIUtility';
import { replaceEscapedQuotes } from '@/utils/stringReplaceUtil';

export async function analyzeOverview(forOverviewAnalysisString) {
  try {
    const apiKey = localStorage.getItem('openaiApiKey');
    if (!apiKey) {
      console.error('OpenAI API key is missing');
      return 'analysis failed: missing API key.';
    }

    const forOverviewAnalysisBase64 = btoa(forOverviewAnalysisString);

    const response = await fetch('/api/analyzeEntity', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ apiKey, forOverviewAnalysisBase64 }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Raw received data:', data);

    // Clean the string to remove escape characters
    const cleanedString = replaceEscapedQuotes(data.analysis);
    console.log("Cleaned string:", cleanedString);

    // Parse the cleaned JSON string in the `analysis` field
    let analysisData;
    try {
      analysisData = JSON.parse(cleanedString);
      console.log("Converted data:", analysisData);
    } catch (error) {
      console.error('Error parsing JSON:', error);
      throw new Error('Failed to parse AI analysis JSON');
    }

    return analysisData;
  } catch (error) {
    console.error('Error analyzing overview:', error);
    return 'analysis failed.';
  }
}
