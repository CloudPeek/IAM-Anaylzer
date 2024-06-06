import { STSClient, GetCallerIdentityCommand } from "@aws-sdk/client-sts";

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
