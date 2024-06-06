import {
    IAMClient,
    ListOpenIDConnectProvidersCommand
  } from "@aws-sdk/client-iam";
  
  export async function fetchIAMIdentityProviders() {
    try {
      const accessKeyId = localStorage.getItem('accessKeyId');
      const secretAccessKey = localStorage.getItem('secretAccessKey');
      const sessionToken = localStorage.getItem('sessionToken');
      const region = 'eu-west-2';
  
      if (!accessKeyId || !secretAccessKey || !sessionToken) {
        throw new Error('Missing credentials');
      }
  
      const iamConfig = {
        credentials: {
          accessKeyId: accessKeyId,
          secretAccessKey: secretAccessKey,
          sessionToken: sessionToken
        },
        region: region
      };
  
      const iamClient = new IAMClient(iamConfig);
      const listIdentityProvidersCommand = new ListOpenIDConnectProvidersCommand({});
      const providersResponse = await iamClient.send(listIdentityProvidersCommand);
  
      if (!providersResponse.OpenIDConnectProviderList) {
        throw new Error('No identity providers found');
      }
  
      const identityProviders = await Promise.all(providersResponse.OpenIDConnectProviderList.map(async (provider) => {
        try {
          // Assume you have functions to get details of each provider and count policies
          const providerDetails = await getProviderDetails(provider.Arn); // Implement this function based on your requirements
          const inlinePolicies = await getProviderInlinePolicies(provider.Arn); // Implement this function based on your requirements
          const attachedPolicies = await getProviderAttachedPolicies(provider.Arn); // Implement this function based on your requirements
  
          return {
            id: providerDetails.Arn,
            type: 'identityProvider',
            name: providerDetails.ProviderName,
            created: providerDetails.CreateDate,
            status: 'Best Practice',
            moreInfo: 'moreinfo',
            createdBy: 'Unknown',
            inlinePoliciesCount: inlinePolicies.length,
            attachedPoliciesCount: attachedPolicies.length
          };
        } catch (providerError) {
          console.error(`Error fetching details for provider ${provider.Arn}:`, providerError);
          return {
            id: provider.Arn,
            type: 'identityProvider',
            name: 'Unknown',
            created: 'Unknown',
            status: 'Error',
            moreInfo: 'Information not found',
            createdBy: 'Unknown',
            inlinePoliciesCount: 0,
            attachedPoliciesCount: 0
          };
        }
      }));
      console.log('identityProviders:', identityProviders);
      return identityProviders;
    } catch (error) {
      console.error('Error fetching IAM identity providers:', error);
      throw error;
    }
  }
  