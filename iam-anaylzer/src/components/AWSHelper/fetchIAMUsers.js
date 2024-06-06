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

export async function fetchIAMUsers() {
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
    const listUsersCommand = new ListUsersCommand({});
    const usersResponse = await iamClient.send(listUsersCommand);

    if (!usersResponse.Users) {
      throw new Error('No users found');
    }

    const users = await Promise.all(usersResponse.Users.map(async (user) => {
      try {
        const listAccessKeysCommand = new ListAccessKeysCommand({ UserName: user.UserName });
        const accessKeysResponse = await iamClient.send(listAccessKeysCommand);
        const accessKeys = accessKeysResponse.AccessKeyMetadata.map(key => ({
          keyId: key.AccessKeyId,
          created: key.CreateDate,
        }));
        const accessKeysCount = accessKeys.length;
        const accessKeysCreatedDates = accessKeys.map(key => key.created);

        const listUserPoliciesCommand = new ListUserPoliciesCommand({ UserName: user.UserName });
        const userPoliciesResponse = await iamClient.send(listUserPoliciesCommand);
        const inlinePolicies = await Promise.all(userPoliciesResponse.PolicyNames.map(async (policyName) => {
          const getUserPolicyCommand = new GetUserPolicyCommand({ UserName: user.UserName, PolicyName: policyName });
          const userPolicyResponse = await iamClient.send(getUserPolicyCommand);
          const policyDocument = decodeURIComponent(userPolicyResponse.PolicyDocument);

          return {
            PolicyName: policyName,
            PolicyDocument: policyDocument
          };
        }));

        const listAttachedUserPoliciesCommand = new ListAttachedUserPoliciesCommand({ UserName: user.UserName });
        const attachedUserPoliciesResponse = await iamClient.send(listAttachedUserPoliciesCommand);
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

        const listGroupsForUserCommand = new ListGroupsForUserCommand({ UserName: user.UserName });
        const groupsResponse = await iamClient.send(listGroupsForUserCommand);
        const groups = groupsResponse.Groups.map(group => group.GroupName);

        const consoleSignInLink = `https://${region}.signin.aws.amazon.com/console?username=${user.UserName}`;

        return {
          id: user.UserId,
          type: 'user',
          name: user.UserName,
          arn: user.Arn,
          created: user.CreateDate,
          accessKeysCount: accessKeysCount,
          accessKeysCreatedDates: accessKeysCreatedDates,
          inlinePolicies: inlinePolicies,
          attachedPolicies: attachedPolicies,
          groups: groups,
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
          consoleSignInLink: 'Unavailable'
        };
      }
    }));

    console.log('Users fetched:', users);
    return users;
  } catch (error) {
    console.error('Error fetching IAM users:', error);
    throw error;
  }
}
