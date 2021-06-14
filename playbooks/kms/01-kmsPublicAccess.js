/**
 * =======================================================================
 * Author: IntelligentDiscovery Support - www.intelligentdiscovery.io
 * Created: 2021-05-12
 * Description: Removes public access for KMS key
 * Compliance Frameworks: NIST, GDPR
 * -----------------------  AWS Event Details  ---------------------------
 * eventSource: kms.amazonaws.com
 * eventName: CreateKey, PutKeyPolicy
 * =======================================================================
 */

//import required to interact with aws
const AWS = require('aws-sdk');
const helper = require('../helper');
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
    if (event.event.region) { credential.region = event.event.region };

    if (event.event.detail.eventName === 'PutKeyPolicy') {
        var item = event.event.detail.requestParameters

    } else if (event.event.detail.eventName === 'CreateKey') {
        var item = event.event.detail.responseElements.keyMetadata;
        item.policy = JSON.parse(event.event.detail.requestParameters.policy);
    }

    // looking for all AWS accounts and removing in policy
    var isPublic = false;
    for (var i = 0; i < item.policy.Statement.length; i++) {
        if (item.policy.Statement[i].Principal) {
            if (item.policy.Statement[i].Principal.AWS) {
                if (item.policy.Statement[i].Principal.AWS === '*') {
                    item.policy.Statement.splice(i, 1);
                    isPublic = true;
                }
            }
        }
    }

    if (isPublic) {
        await helper.awsApiCall(credential, 'KMS', 'putKeyPolicy', { KeyId: item.keyId, PolicyName: 'default', Policy: JSON.stringify(item.policy, null, 2) });
        resolve({ remediationDone: true, data: item });
    } else {
        resolve({ remediationDone: false, data: 'no public access found' });
    }
});
