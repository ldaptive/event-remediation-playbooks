/**
 * =======================================================================
 * Author: IntelligentDiscovery Support - www.intelligentdiscovery.io
 * Created: 2021-05-12
 * Description: Changes Public AMI to Private AMI
 * ControlID: AMI.02
 * Compliance Frameworks: NIST, GDPR
 * -----------------------  AWS Event Details  ---------------------------
 * eventSource: ec2.amazonaws.com
 * eventName: ModifyImageAttribute
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
        var url = `api/ami/images/${event.accountDetails.accountId}?RecordStatus=Active&Public=true&fields=CreationDate,ImageId,Region,Platform,Public`;

        // calling the api endpoint
        var data = await helper.apiQuery(url);
        data = JSON.parse(JSON.stringify(data));

        for (var i = 0; i < data.length; i++) {
            // setting credential specific for region of the expired certificate
            var regionCredential = JSON.parse(JSON.stringify(credential));

            regionCredential.region = data[i].Region;
            await helper.awsApiCall(regionCredential, 'EC2', 'modifyImageAttribute', { ImageId: data[i].ImageId, OperationType: 'remove', LaunchPermission: { Remove: [{ Group: 'all' }] } });
        }
        resolve({ remediationDone: true, data: data });

    } else if (event.playbook.type === 'event') {
        var item = event.event.detail.requestParameters;
        if (item.attributeType === 'launchPermission' && item.launchPermission.add.items[0].group && item.launchPermission.add.items[0].group === 'all') {
            await helper.awsApiCall(credential, 'EC2', 'modifyImageAttribute', { ImageId: data[i].ImageId, OperationType: 'remove', LaunchPermission: { Remove: [{ Group: 'all' }] } });
            resolve({ remediationDone: true, data: image });
        }
    }
});
