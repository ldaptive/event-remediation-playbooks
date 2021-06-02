/**
 * =======================================================================
 * Author: IntelligentDiscovery Support - www.intelligentdiscovery.io
 * Created: 2021-05-12
 * Description: Sets EBS Snapshot to private when made public
 * Compliance Frameworks: NIST, HIPPA, GDPR, PCI-DSS
 * -----------------------  AWS Event Details  ---------------------------
 * eventSource: ec2.amazonaws.com
 * eventName: ModifySnapshotAttribute
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

    var item = event.event.detail.requestParameters;
    if (item.createVolumePermission.add) {
        if (item.createVolumePermission.add.items[0].group && item.createVolumePermission.add.items[0].group == 'all') {
            await helper.awsApiCall(credential, 'EC2', 'modifySnapshotAttribute', { 
                SnapshotId: item.snapshotId, 
                Attribute: 'createVolumePermission', 
                OperationType: 'remove', 
                GroupNames: ['all'] 
            });
        }
    }
    resolve({ remediationDone: true, data: item });
});
