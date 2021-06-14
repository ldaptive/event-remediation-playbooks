/**
 * =======================================================================
 * Author: IntelligentDiscovery Support - www.intelligentdiscovery.io
 * Created: 2021-05-12
 * Description: Deletes snapshots that have been orphaned and past certain date
 * Compliance Frameworks: Cost Optimization
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
    if (event.event.region) { credential.region = event.event.region };

    var days = 180
    var pastDate = new Date(new Date().setDate(dte.getDate() - days)).toISOString();
    // setting our API endpoint to get data from IntelligentDiscovery
    var url = `api/ec2/snapshots/${event.accountDetails.accountId}?RecordStatus=Active&Orphaned=true&StartTime[lt]=${pastDate}&fields=Region,VolumeId,SnapshotId,StartTime,Tags`;

    // calling the api endpoint
    var data = await helper.apiQuery(url);

    var removals = [];
    data.forEach(x => {
        // specify tags that you would want to look for to ignore deletion
        if (x.Tags) {
            if (x.Tags.filter(f => f.Key === 'IncidentResponse').length === 0 &&
                x.Tags.filter(f => f.Key === 'IncidentResponse').length === 0) {
                removals.push(x);
            }
        } else {
            removals.push(x);
        }
        // validate for a specific needed tag that would flag not to be deleted:
    });


    for (var i = 0; i < removals.length; i++) {
        // setting credential specific for region of the expired certificate
        var regionCredential = JSON.parse(JSON.stringify(credential));
        regionCredential.region = removals[i].Region;
        await helper.awsApiCall(regionCredential, 'EC2', 'deleteSnapshot', { SnapshotId: removals[i].SnapshotId });
    }
    resolve({ remediationDone: true, data: removals });
});
