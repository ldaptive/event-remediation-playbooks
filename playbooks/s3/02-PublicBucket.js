/**
 * =======================================================================
 * Author: IntelligentDiscovery Support - www.intelligentdiscovery.io
 * Created: 2021-05-12
 * Description: Removes public access to the bucket
 * Compliance Frameworks: NIST, HIPPA, PCI-DSS
 * -----------------------  AWS Event Details  ---------------------------
 * eventSource: s3.amazonaws.com
 * eventName: CreateBucket, PutPublicAccessBlock, 
 *            PutObjectAcl, DeletePublicAccessBlock
 * =======================================================================
 */

//import required to interact with aws
const AWS = require('aws-sdk');
const helper = require('./helper');
const now = new Date().toISOString();

/**
 * @param {Object} event                    the entire payload being passed from step function
 * @param {Object} event.accountDetails     the information specific to this account
 * @param {Object} event.credentials        the credentials needed to interact with the offending account
 * @param {Object} event.event              the cloudwatch alarm event that was passed
 * @param {Object} event.playbook           the information of what steps should be taken on this event
 * @param {Object} event.userDetails        the user information of who triggered the event
 */

module.exports.run = (event) => new Promise(async (resolve) => {
    // setting our credential specific to the region where the event occurred
    var credential = JSON.parse(JSON.stringify(event.credentials));
    if (event.event.region) { credential.region = event.event.region };

    if (event.playbook.type === 'schedule') {
        // setting our API endpoint to get data from IntelligentDiscovery
        var url = `api/s3/buckets/${event.accountDetails.accountId}?IsPublic=true&fields=Region,Name,IsPublic,ExternalAccess,Tags`;

        // calling the api endpoint
        var data = await helper.apiQuery(url);

        for (var i = 0; i < data.length; i++) {
            // setting credential specific for region of the expired certificate
            var regionCredential = JSON.parse(JSON.stringify(credential));
            regionCredential.region = data[i].Region;

            // Setting basic encryption on the bucket
            await helper.awsApiCall(regionCredential, 'S3', 'putPublicAccessBlock', { Bucket: bucket.bucketName, PublicAccessBlockConfiguration: { IgnorePublicAcls: true, BlockPublicAcls: true } });
        }
        resolve({ remediationDone: true, data: data });
    } else if (event.playbook.type === 'event') {
        // getting our eventObject
        var bucket = event.event.detail.requestParameters;

        // checking if encryption is currently enabled
        var acl = await helper.awsApiCall(credential, 'S3', 'getBucketAcl', { Bucket: bucket.bucketName });
        var publicAccessBlock = await helper.awsApiCall(credential, 'S3', 'getPublicAccessBlock', { Bucket: bucket.bucketName });
        if (acl.data.Grants.length > 1 && publicAccessBlock.data.PublicAccessBlockConfiguration.IgnorePublicAcls) {
            await helper.awsApiCall(credential, 'S3', 'putPublicAccessBlock', { Bucket: bucket.bucketName, PublicAccessBlockConfiguration: { IgnorePublicAcls: true, BlockPublicAcls: true } });
            resolve({ remediationDone: true, data: 'public access has not been set on this bucket' });
        } else {
            // Encryption is enabled so nothing to change
            resolve({ remediationDone: false, data: 'public access has not been set on this bucket' });
        }
    }
});
