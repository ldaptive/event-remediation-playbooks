/**
 * =======================================================================
 * Author: IntelligentDiscovery Support - www.intelligentdiscovery.io
 * Created: 2021-09-25
 * Description: Sets S3 to enforce encryption over SSL
 * Compliance Frameworks: NIST, HIPPA, GDPR, PCI-DSS
 * -----------------------  AWS Event Details  ---------------------------
 * eventSource: s3.amazonaws.com
 * eventName: CreateBucket
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
        var url = `api/s3/buckets/${event.accountDetails.accountId}?RecordStatus=Active&EnforceSSL=false&fields=Name,EnforceSSL,Region`;

        // calling the api endpoint
        var data = await helper.apiQuery(url);

        for (var i = 0; i < data.length; i++) {
            // setting credential specific for region of the expired certificate
            var regionCredential = JSON.parse(JSON.stringify(credential));
            regionCredential.region = data[i].Region;
            
            // getting our existing bucket policy
            var policy = await helper.awsApiCall(regionCredential, 'S3', 'getBucketPolicy', { Bucket: bucket.bucketName});
            console.log('here is my bucket policy', policy);
            // Setting basic encryption on the bucket
            // await helper.awsApiCall(regionCredential, 'S3', 'putBucketEncryption', { Bucket: bucket.bucketName, ServerSideEncryptionConfiguration: { Rules: [{ ApplyServerSideEncryptionByDefault: { SSEAlgorithm: "AES256" } }] } });
        }
        resolve({ remediationDone: true, data: data });
    } else if (event.playbook.type === 'event') {
        // getting our eventObject
        var bucket = event.event.detail.requestParameters;

        // checking if encryption is currently enabled
        var encryption = await helper.awsApiCall(credential, 'S3', 'getBucketEncryption', { Bucket: bucket.bucketName });

        // If error returned from API call then encryption is not enabled
        if (encryption.success === false) {
            // Setting basic encryption on the bucket
            await helper.awsApiCall(credential, 'S3', 'putBucketEncryption', { Bucket: bucket.bucketName, ServerSideEncryptionConfiguration: { Rules: [{ ApplyServerSideEncryptionByDefault: { SSEAlgorithm: "AES256" } }] } });
            resolve({ remediationDone: true, data: table });
        } else {
            // Encryption is enabled so nothing to change
            resolve({ remediationDone: false, data: 'encryption has been enabled on this bucket' });
        }
    }
});
