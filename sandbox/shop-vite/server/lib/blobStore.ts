
import { DefaultAzureCredential } from '@azure/identity'
import { SASProtocol, BlobSASPermissions, BlobSASSignatureValues, generateBlobSASQueryParameters, BlobServiceClient, ContainerClient, BlobItem, ContainerListBlobFlatSegmentResponse } from "@azure/storage-blob"

// from https://learn.microsoft.com/en-us/azure/storage/blobs/storage-blob-create-user-delegation-sas-javascript#blob-create-sas-token-with-defaultazurecredential
export  function listBlobs(blobName : string)  {

    // Get environment variables
    const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
    const containerName = process.env.AZURE_STORAGE_BLOB_CONTAINER_NAME;

    // Best practice: use managed identity - DefaultAzureCredential
    const containerClient = new ContainerClient(
        `https://${accountName}.blob.core.windows.net/${containerName}`,
        new DefaultAzureCredential()
      );

    return containerClient.listBlobsFlat()

}


// from https://learn.microsoft.com/en-us/azure/storage/blobs/storage-blob-create-user-delegation-sas-javascript#blob-create-sas-token-with-defaultazurecredential
export async function createBlobSas(blobName : string, create : boolean = false): Promise<{sasToken: string, accountName: string, containerName: string}> {

    // Get environment variables
    const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME as string;
    const containerName = process.env.AZURE_STORAGE_BLOB_CONTAINER_NAME as string;

    // Best practice: create time limits
    const TEN_MINUTES = 10 * 60 * 1000;
    const NOW = new Date();

    // Best practice: set start time a little before current time to 
    // make sure any clock issues are avoided
    const TEN_MINUTES_BEFORE_NOW = new Date(NOW.valueOf() - TEN_MINUTES);
    const TEN_MINUTES_AFTER_NOW = new Date(NOW.valueOf() + TEN_MINUTES);

    // Best practice: use managed identity - DefaultAzureCredential
    const blobServiceClient = new BlobServiceClient(
        `https://${accountName}.blob.core.windows.net`,
        new DefaultAzureCredential()
      );

    // Best practice: delegation key is time-limited  
    // When using a user delegation key, container must already exist 
    const userDelegationKey = await blobServiceClient.getUserDelegationKey(
        TEN_MINUTES_BEFORE_NOW, 
        TEN_MINUTES_AFTER_NOW
    );

    // Need only create/write permission to upload file
    const blobPermissionsForAnonymousUser = create ? "cw" : "r"

    // Best practice: SAS options are time-limited
    const sasOptions : BlobSASSignatureValues= {
        blobName,
        containerName,                                           
        permissions: BlobSASPermissions.parse(blobPermissionsForAnonymousUser), 
        protocol: SASProtocol.HttpsAndHttp,
        startsOn: TEN_MINUTES_BEFORE_NOW,
        expiresOn: TEN_MINUTES_AFTER_NOW
    };
 
    const sasToken = generateBlobSASQueryParameters(
        sasOptions,
        userDelegationKey,
        accountName 
    ).toString();

    return {sasToken, accountName, containerName};
}
