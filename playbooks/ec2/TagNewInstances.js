/**
 * =======================================================================
 * Author: IntelligentDiscovery Support - www.intelligentdiscovery.io
 * Created: 2021-05-12
 * Description: Sets lights out tags on EC2 instance when created
 * Compliance Frameworks: Compliance
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
 * @param {Object} event.userDetails the user information of who triggered the event
 */
module.exports.run = (event) => new Promise(async (resolve) => {
    // setting our credential specific to the region where the event occurred
    var credential = JSON.parse(JSON.stringify(event.credentials));
    if (event.event.region) { credential.region = event.event.region };

    var Instances = [];
    event.event.detail.responseElements.instancesSet.items.forEach(instance => {
        Instances.push(instance.instanceId);
    });
    var userId;
    if(event.event.userIdentity.type === 'IAMUser'){
        userId = event.event.userIdentity.userName;
    } else if(event.event.userIdentity.type === 'ROOT'){
        userId = 'Root User';
    } else if(event.event.userIdentity.type === 'IAMUser'){
        userId = ''
    }

    //if leveraging User Lookup via playbook, enrich tags with user data from IDP

    var params = {
        Resources: Instances,
        Tags: [
            {
                Key: 'launchedBy',
                Value: userId
            },
            // {
            //     Key: 'costCenter',
            //     Value: event.userDetails.costCenter
            // },
            // {
            //     Key: 'department',
            //     Value: event.userDetails.department
            // },
            // {
            //     Key: 'group',
            //     Value: event.userDetails.group
            // }
        ]
    };
    var response = await helper.awsApiCall(credential, 'EC2', 'createTags', params);
    resolve({remediationDone: true,  data: response });
});
