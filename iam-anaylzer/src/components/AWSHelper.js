import { STSClient, GetCallerIdentityCommand } from "@aws-sdk/client-sts";
import {
  IAMClient,
  ListRolesCommand,
  GetRoleCommand,
  ListRolePoliciesCommand,
  GetRolePolicyCommand,
  ListAttachedRolePoliciesCommand,
  GetPolicyCommand,
  GetPolicyVersionCommand,
  ListOpenIDConnectProvidersCommand,
  ListUsersCommand,
  ListGroupsCommand,
  GetGroupCommand,
  ListGroupPoliciesCommand,
  GetGroupPolicyCommand,
  ListAttachedGroupPoliciesCommand
} from "@aws-sdk/client-iam";
import { analyzePolicy, overviewAnylsis } from '@/utils/openAIUtility';

export async function AWSStsReturns() {
  try {
    const accessKeyId = localStorage.getItem('accessKeyId');
    const secretAccessKey = localStorage.getItem('secretAccessKey');
    const sessionToken = localStorage.getItem('sessionToken');
    const region = 'eu-west-2';

    if (!accessKeyId || !secretAccessKey || !sessionToken) {
      throw new Error('Missing credentials');
    }

    const iam = {
      credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
        sessionToken: sessionToken
      },
      region: region
    };

    const client = new STSClient(iam);
    const command = new GetCallerIdentityCommand({});
    const response = await client.send(command);
    
    return response.Arn;
  } catch (error) {
    console.error('Error fetching caller identity:', error);
    throw error;
  }
}

export async function fetchIAMRoles() {
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
    const listRolesCommand = new ListRolesCommand({});
    const rolesResponse = await iamClient.send(listRolesCommand);

    if (!rolesResponse.Roles) {
      throw new Error('No roles found');
    }

    const roles = await Promise.all(rolesResponse.Roles.map(async (role) => {
      try {
        const getRoleCommand = new GetRoleCommand({ RoleName: role.RoleName });
        const roleDetails = await iamClient.send(getRoleCommand);

        const assumeRolePolicyDocument = roleDetails.Role.AssumeRolePolicyDocument
          ? JSON.parse(decodeURIComponent(roleDetails.Role.AssumeRolePolicyDocument))
          : null;
        const createdBy = assumeRolePolicyDocument && assumeRolePolicyDocument.Statement && assumeRolePolicyDocument.Statement[0]
          ? assumeRolePolicyDocument.Statement[0].Principal.AWS
          : 'Unknown';

        // Fetch inline policies
        const listRolePoliciesCommand = new ListRolePoliciesCommand({ RoleName: role.RoleName });
        const rolePoliciesResponse = await iamClient.send(listRolePoliciesCommand);
        const inlinePolicies = await Promise.all(rolePoliciesResponse.PolicyNames.map(async (policyName) => {
          const getRolePolicyCommand = new GetRolePolicyCommand({ RoleName: role.RoleName, PolicyName: policyName });
          const rolePolicyResponse = await iamClient.send(getRolePolicyCommand);

          const policyDocument = decodeURIComponent(rolePolicyResponse.PolicyDocument);

          return {
            PolicyName: policyName,
            PolicyDocument: policyDocument
          };
        }));

        // Fetch attached managed policies
        const listAttachedRolePoliciesCommand = new ListAttachedRolePoliciesCommand({ RoleName: role.RoleName });
        const attachedRolePoliciesResponse = await iamClient.send(listAttachedRolePoliciesCommand);
        const attachedPolicies = await Promise.all(attachedRolePoliciesResponse.AttachedPolicies.map(async (policy) => {
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

        return {
          id: roleDetails.Role.Arn,
          type: 'role',
          name: roleDetails.Role.RoleName,
          created: roleDetails.Role.CreateDate,
          status: 'Best Practice', // This should be set based on your application's logic
          moreInfo: 'moreinfo',
          inlinePoliciesCount: inlinePolicies.length,
          attachedPoliciesCount: attachedPolicies.length,
          createdBy: createdBy,
          inlinePolicies: inlinePolicies,
          attachedPolicies: attachedPolicies
        };
      } catch (roleError) {
        console.error(`Error fetching details for role ${role.RoleName}:`, roleError);
        return {
          id: role.RoleName,
          type: 'role',
          name: role.RoleName,
          created: 'Unknown',
          status: 'Error',
          inlinePoliciesCount: 0,
          attachedPoliciesCount: 0,
          moreInfo: 'Information not found',
          createdBy: 'Unknown',
          inlinePolicies: [],
          attachedPolicies: []
        };
      }
    }));

    console.log('Roles fetched:', roles); // Logging roles to verify
    return roles;
  } catch (error) {
    console.error('Error fetching IAM roles:', error);
    throw error;
  }
}

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
          status: 'Best Practice', // This should be set based on your application's logic
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

    const users = usersResponse.Users.map(user => ({
      id: user.UserId,
      type: 'user',
      name: user.UserName,
      created: user.CreateDate,
    }));

    console.log('Users fetched:', users); // Logging users to verify
    return users;
  } catch (error) {
    console.error('Error fetching IAM users:', error);
    throw error;
  }
}

export async function fetchIAMGroups() {
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
    const listGroupsCommand = new ListGroupsCommand({});
    const groupsResponse = await iamClient.send(listGroupsCommand);

    if (!groupsResponse.Groups) {
      throw new Error('No groups found');
    }

    const groups = await Promise.all(groupsResponse.Groups.map(async (group) => {
      try {
        const getGroupCommand = new GetGroupCommand({ GroupName: group.GroupName });
        const groupDetails = await iamClient.send(getGroupCommand);

        // Fetch inline policies
        const listGroupPoliciesCommand = new ListGroupPoliciesCommand({ GroupName: group.GroupName });
        const groupPoliciesResponse = await iamClient.send(listGroupPoliciesCommand);
        const inlinePolicies = await Promise.all(groupPoliciesResponse.PolicyNames.map(async (policyName) => {
          const getGroupPolicyCommand = new GetGroupPolicyCommand({ GroupName: group.GroupName, PolicyName: policyName });
          const groupPolicyResponse = await iamClient.send(getGroupPolicyCommand);

          const policyDocument = decodeURIComponent(groupPolicyResponse.PolicyDocument);

          return {
            PolicyName: policyName,
            PolicyDocument: policyDocument
          };
        }));

        // Fetch attached managed policies
        const listAttachedGroupPoliciesCommand = new ListAttachedGroupPoliciesCommand({ GroupName: group.GroupName });
        const attachedGroupPoliciesResponse = await iamClient.send(listAttachedGroupPoliciesCommand);
        const attachedPolicies = await Promise.all(attachedGroupPoliciesResponse.AttachedPolicies.map(async (policy) => {
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

        return {
          id: groupDetails.Group.Arn,
          type: 'group',
          name: groupDetails.Group.GroupName,
          created: groupDetails.Group.CreateDate,
          status: 'Best Practice', // This should be set based on your application's logic
          moreInfo: 'moreinfo',
          inlinePoliciesCount: inlinePolicies.length,
          attachedPoliciesCount: attachedPolicies.length,
          inlinePolicies: inlinePolicies,
          attachedPolicies: attachedPolicies
        };
      } catch (groupError) {
        console.error(`Error fetching details for group ${group.GroupName}:`, groupError);
        return {
          id: group.GroupName,
          type: 'group',
          name: group.GroupName,
          created: 'Unknown',
          status: 'Error',
          inlinePoliciesCount: 0,
          attachedPoliciesCount: 0,
          moreInfo: 'Information not found',
          inlinePolicies: [],
          attachedPolicies: []
        };
      }
    }));

    console.log('Groups fetched:', groups); // Logging groups to verify
    return groups;
  } catch (error) {
    console.error('Error fetching IAM groups:', error);
    throw error;
  }
}

export async function analyzePolicyOnRequest(apiKey, policyDocument) {
  try {
    const analysis = await analyzePolicy(apiKey, policyDocument);
    return analysis;
  } catch (error) {
    console.error('Error analyzing policy:', error);
    return 'Analysis failed.';
  }
}
