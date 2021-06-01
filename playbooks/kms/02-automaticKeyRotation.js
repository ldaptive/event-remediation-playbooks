/**
 * =======================================================================
 * Author: IntelligentDiscovery Support - www.intelligentdiscovery.io
 * Created: 2021-05-12
 * Description: Sets KMS Key for automatic rotation
 * Compliance Frameworks: NIST, GDPR
 * -----------------------  AWS Event Details  ---------------------------
 * eventSource: kms.amazonaws.com
 * eventName: CreateKey, DisableKeyRotation
 * =======================================================================
 */

//import required to interact with aws
const AWS = require('aws-sdk');
const helper = require('./helper');
const now = new Date().toISOString();

/**
 * @param {Object} event the entire payload being passed from step function
 * @param {Object} event.accountDetails the information specific to this account
 * @param {Object} event.credentials the credentials needed to interact with the offending account
 * @param {Object} event.event the cloudwatch alarm event that was passed
 * @param {Object} event.playbook the information of what steps should be taken on this event
 * @param {Object} event.userDetails the user information of who triggered the event
 */

module.exports.run = (event) => new Promise(async (resolve) => {
    // setting our credential specific to the region where the event occurred
    var credential = JSON.parse(JSON.stringify(event.credentials));
    if (event.event.awsRegion) { credential.region = event.event.awsRegion };

    if (event.event.detail.eventName === 'DisableKeyRotation') {
        var item = event.event.detail.requestParameters

    } else if (event.event.detail.eventName === 'CreateKey') {
        var item = event.event.detail.responseElements.keyMetadata;
    }

    await helper.awsApiCall(credential, 'KMS', 'enableKeyRotation', { KeyId: item.keyId });
    resolve({ remediationDone: true, data: item });
});
