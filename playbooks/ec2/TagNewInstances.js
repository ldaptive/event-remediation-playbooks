/**
 * =======================================================================
 * Author: IntelligentDiscovery Support - www.intelligentdiscovery.io
 * Created: 2021-05-12
 * Description: Sets lights out tags on EC2 instance when created
 * Compliance Frameworks: N/A
 * -----------------------  AWS Event Details  ---------------------------
 * eventSource: ec2.amazonaws.com
 * eventName: RunInstances
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
 * @param {Object} event.userDetails the user information of who triggered the event (if user lookup is set in playbook)
 */
module.exports.run = (event) => new Promise(async (resolve) => {
    // setting our credential specific to the region where the event occurred
    var credential = JSON.parse(JSON.stringify(event.credentials));
    if (event.event.region) { credential.region = event.event.region };

    var Instances = [];
    event.event.detail.responseElements.instancesSet.items.forEach(instance => {
        Instances.push(instance.instanceId);
    });

    var tags = [];

    tags.push({ Key: 'createdDate', Value: new Date().toUTCString() });

    var userId;
    if (event.userIdentity) {
        if (event.userIdentity.type === 'IAMUser') {
            userId = event.event.userIdentity.userName;
            tags.push({ Key: 'createdBy', Value: userId });
        } else if (event.userIdentity.type === 'ROOT') {
            userId = 'Root User';
            tags.push({ Key: 'createdBy', Value: userId });
        } else if (event.userIdentity.type === 'AssumedRole' && event.userIdentity.invokedBy) {
            userId = event.userIdentity.principalId.split(':')[1];
            if (userId.includes('@')) {
                tags.push({ Key: 'createdBy', Value: userId });
            }
        };
    } else {
        if (event.event.detail.userIdentity.type === 'IAMUser') {
            userId = event.event.detail.userIdentity.type;
            tags.push({ Key: 'createdBy', Value: userId });
        } else if (event.event.detail.userIdentity.type === 'ROOT') {
            userId = 'Root User';
            tags.push({ Key: 'createdBy', Value: userId });
        } else if (event.event.detail.userIdentity.type === 'AssumedRole' && event.event.detail.userIdentity.invokedBy) {
            userId = event.event.detail.userIdentity.principalId.split(':')[1];
            if (userId.includes('@')) {
                tags.push({ Key: 'createdBy', Value: userId });
                // push additional tags from your IDP
            }
        };
    }

    // adding our tags here!
    var params = { Resources: Instances, Tags: tags };
    var response = await helper.awsApiCall(credential, 'EC2', 'createTags', params);
    resolve({ remediationDone: true, data: response });
});
