import {
    IAMClient,
    ListGroupsCommand,
    GetGroupCommand,
    ListGroupPoliciesCommand,
    GetGroupPolicyCommand,
    ListAttachedGroupPoliciesCommand,
    GetPolicyCommand,
    GetPolicyVersionCommand
  } from "@aws-sdk/client-iam";
  
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
            status: 'Best Practice',
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
  
      console.log('Groups fetched:', groups);
      return groups;
    } catch (error) {
      console.error('Error fetching IAM groups:', error);
      throw error;
    }
  }
  