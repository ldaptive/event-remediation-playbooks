/**
 * =======================================================================
 * Author: IntelligentDiscovery Support - www.intelligentdiscovery.io
 * Created: 2021-05-12
 * Description: Resize over provisioned EC2 Instances
 * Compliance Frameworks: Cost Savings
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

    var url = `api/ec2/instances/${event.accountDetails.accountId}?RecordStatus=Active&OverProvisioned=true&UsageType=On Demand&fields=Tags,UsageType,RecommendedInstanceType,InstanceType,StateChange,Platform,LaunchTime,MaxCpu`;

    //calling our API endpoint to get the data
    var data = await helper.apiQuery(url);

    var resizableInstances = [];
    data.forEach(x => {
        // specify tags that you would want to look for to ignore deletion
        if (x.Tags) {
            if (x.Tags.filter(f => f.Key === 'ignoreResize').length === 0 &&
                x.Tags.filter(f => f.Key === 'IncidentResponse').length === 0) {
                resizableInstances.push(x);
            }
        } else {
            resizableInstances.push(x);
        }
        // validate for a specific needed tag that would flag not to be deleted:
    });

    //var response = await helper.awsApiCall(credential, 'EC2', 'createTags', params);
    resolve({ remediationDone: true, data: response });
});
