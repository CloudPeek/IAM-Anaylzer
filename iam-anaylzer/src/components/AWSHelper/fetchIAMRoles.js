import {
    IAMClient,
    ListRolesCommand,
    GetRoleCommand,
    ListRolePoliciesCommand,
    GetRolePolicyCommand,
    ListAttachedRolePoliciesCommand,
    GetPolicyCommand,
    GetPolicyVersionCommand
  } from "@aws-sdk/client-iam";
  
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
            status: 'Best Practice',
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
  
      console.log('Roles fetched:', roles);
      return roles;
    } catch (error) {
      console.error('Error fetching IAM roles:', error);
      throw error;
    }
  }
  