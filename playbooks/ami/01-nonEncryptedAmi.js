/**
 * =======================================================================
 * Author: IntelligentDiscovery Support - www.intelligentdiscovery.io
 * Created: 2021-05-12
 * Description: removes non encrypted AMI's
 * Compliance Frameworks: NIST, HIPPA, GDPR, PCI-DSS
 * -----------------------  AWS Event Details  ---------------------------
 * eventSource: N/A
 * eventName: N/A
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

    var pastDate = new Date(new Date().setDate(dte.getDate() - 180)).toISOString();
    // setting our API endpoint to get data from IntelligentDiscovery
    var url = `api/ami/images/${event.accountDetails.accountId}?RecordStatus=Active&fields=*`;

    // calling the api endpoint
    var data = await helper.apiQuery(url);

    var nonEncrypted = [];
    data.forEach(x => {
        if (x.BlockDeviceMappings) {
            x.BlockDeviceMappings.forEach(y => {
                if (y.Ebs) {
                    if (y.Ebs.Encrypted === false) {
                        nonEncrypted.push(x);
                    }
                }
            });
        }
    });

    for (var i = 0; i < nonEncrypted.length; i++) {
        // setting credential specific for region of the expired certificate
        var regionCredential = JSON.parse(JSON.stringify(credential));
        regionCredential.region = data[i].Region;
        await helper.awsApiCall(regionCredential, 'EC2', 'deregisterImage', { ImageId: nonEncrypted[i].ImageId });
    }

    // returning back to our workflow
    resolve({ remediationDone: true, data: data });
});
