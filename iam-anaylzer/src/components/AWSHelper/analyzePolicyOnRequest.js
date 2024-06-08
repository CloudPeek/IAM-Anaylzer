import { analyzePolicy } from '@/utils/openAIUtility';

export async function analyzePolicyOnRequest(apiKey, policyDocument) {
  try {
    const analysis = await analyzePolicy(apiKey, policyDocument);
    return analysis;
  } catch (error) {
    console.error('Error analyzing policy:', error);
    return 'Analysis failed.';
  }
}

export async function analyzeEntityOnLoad(apiKey, entityToAnaylze) {
  try {
    const analysis = await overviewAnalysis(apiKey, entityToAnaylze);
    return analysis;
  } catch (error) {
    console.error('Error analyzing enterty:', error);
    return 'Analysis failed.';
  }
}