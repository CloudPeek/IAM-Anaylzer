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
