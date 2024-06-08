import {
  IAMClient,
  ListUsersCommand,
  ListAccessKeysCommand,
  ListUserPoliciesCommand,
  GetUserPolicyCommand,
  ListAttachedUserPoliciesCommand,
  GetPolicyCommand,
  GetPolicyVersionCommand,
  ListGroupsForUserCommand
} from "@aws-sdk/client-iam";
import { analyzeOverview } from "./analyzeOverview";

export async function fetchIAMUsers() {
  try {
    const accessKeyId = localStorage.getItem('accessKeyId');
    const secretAccessKey = localStorage.getItem('secretAccessKey');
    const sessionToken = localStorage.getItem('sessionToken');
    const region = 'eu-west-2';

    if (!accessKeyId || !secretAccessKey || !sessionToken) {
      throw new Error('Missing AWS credentials');
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
    const listUsersCommand = new ListUsersCommand({});
    const usersResponse = await iamClient.send(listUsersCommand);

    if (!usersResponse.Users) {
      throw new Error('No users found');
    }

    const users = await Promise.all(usersResponse.Users.map(async (user) => {
      try {
        const [accessKeysResponse, userPoliciesResponse, attachedUserPoliciesResponse, groupsResponse] = await Promise.all([
          iamClient.send(new ListAccessKeysCommand({ UserName: user.UserName })),
          iamClient.send(new ListUserPoliciesCommand({ UserName: user.UserName })),
          iamClient.send(new ListAttachedUserPoliciesCommand({ UserName: user.UserName })),
          iamClient.send(new ListGroupsForUserCommand({ UserName: user.UserName }))
        ]);

        const accessKeys = accessKeysResponse.AccessKeyMetadata.map(key => ({
          keyId: key.AccessKeyId,
          created: key.CreateDate,
        }));
        const accessKeysCount = accessKeys.length;
        const accessKeysCreatedDates = accessKeys.map(key => key.created);

        const inlinePolicies = await Promise.all(userPoliciesResponse.PolicyNames.map(async (policyName) => {
          const getUserPolicyCommand = new GetUserPolicyCommand({ UserName: user.UserName, PolicyName: policyName });
          const userPolicyResponse = await iamClient.send(getUserPolicyCommand);
          const policyDocument = decodeURIComponent(userPolicyResponse.PolicyDocument);

          return {
            PolicyName: policyName,
            PolicyDocument: policyDocument
          };
        }));

        const attachedPolicies = await Promise.all(attachedUserPoliciesResponse.AttachedPolicies.map(async (policy) => {
          const getPolicyCommand = new GetPolicyCommand({ PolicyArn: policy.PolicyArn });
          const policyResponse = await iamClient.send(getPolicyCommand);

          const getPolicyVersionCommand = new GetPolicyVersionCommand({
            PolicyArn: policy.PolicyArn,
            VersionId: policyResponse.Policy.DefaultVersionId
          });
          const policyVersionResponse = await iamClient.send(getPolicyVersionCommand);

          const policyDocument = JSON.stringify(policyVersionResponse.PolicyVersion.Document);

          return {
            PolicyName: policy.PolicyName,
            PolicyDocument: policyDocument
          };
        }));

        const groups = groupsResponse.Groups.map(group => group.GroupName);

        const consoleSignInLink = `https://${region}.signin.aws.amazon.com/console?username=${user.UserName}`;
        const forOverviewAnalysis = {
          inlinePolicies,
          attachedPolicies,
          arn: user.Arn,
          created: user.CreateDate,
          accessKeysCount,
          accessKeysCreatedDates,
          groups
        };
        const inlinePoliciesCount = inlinePolicies.length;
        const attachedPoliciesCount = attachedPolicies.length;
        const forOverviewAnalysisString = JSON.stringify(forOverviewAnalysis);
        const analysisData = await analyzeOverview(forOverviewAnalysisString);

        // Log the entire response first
        console.log('Received data:', analysisData);

        // Ensure `analysisData` is properly parsed
        const arnCapabilities = analysisData.ARN_capabilities || 'Not Available';
        const bestPractice = analysisData.Best_Practice !== undefined ? (analysisData.Best_Practice ? 'Yes' : 'No') : 'Not Available';
        const bestPracticeDescription = analysisData.BestPractice_description || 'Not Available';
        const securityConcerns = analysisData.Security_Concerns !== undefined ? (analysisData.Security_Concerns ? 'Yes' : 'No') : 'Not Available';
        const securityDescription = analysisData.SecurityDescription || 'Not Available';
        const recommendations = analysisData.Recommendations || 'Not Available';

        console.log('ARN Capabilities:', arnCapabilities);
        console.log('Best Practice:', bestPractice);
        console.log('Best Practice Description:', bestPracticeDescription);
        console.log('Security Concerns:', securityConcerns);
        console.log('Security Description:', securityDescription);
        console.log('Recommendations:', recommendations);

        return {
          id: user.UserId,
          type: 'user',
          name: user.UserName,
          arn: user.Arn,
          created: user.CreateDate,
          accessKeysCount: accessKeysCount,
          accessKeysCreatedDates: accessKeysCreatedDates,
          inlinePoliciesCount: inlinePoliciesCount,
          inlinePolicies: inlinePolicies,
          attachedPoliciesCount: attachedPoliciesCount,
          attachedPolicies: attachedPolicies,
          groups: groups,
          arnCapabilities: arnCapabilities,
          bestPractice: bestPractice,
          bestPracticeDescription: bestPracticeDescription,
          securityConcerns: securityConcerns,
          securityDescription: securityDescription,
          recommendations: recommendations,
          consoleSignInLink: consoleSignInLink
        };
      } catch (userError) {
        console.error(`Error fetching details for user ${user.UserName}:`, userError);
        return {
          id: user.UserName,
          type: 'user',
          name: user.UserName,
          arn: 'Unknown',
          created: 'Unknown',
          accessKeysCount: 0,
          accessKeysCreatedDates: [],
          inlinePolicies: [],
          attachedPolicies: [],
          groups: [],
          arnCapabilities: 'Not Available',
          bestPractice: 'Not Available',
          bestPracticeDescription: 'Not Available',
          securityConcerns: 'Not Available',
          securityDescription: 'Not Available',
          recommendations: 'Not Available',
          consoleSignInLink: 'Unavailable'
        };
      }
    }));

    return users;
  } catch (error) {
    console.error('Error fetching IAM users:', error);
    throw error;
  }
}
