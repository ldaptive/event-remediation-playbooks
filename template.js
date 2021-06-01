/**
 * =======================================================================
 * Author: 
 * Created: 
 * Description: 
 * Compliance Frameworks: 
 * -----------------------  AWS Event Details  ---------------------------
 * eventSource: 
 * eventName: 
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
    /** setting our credential specific to the region where the event occurred */
    var credential = JSON.parse(JSON.stringify(event.credentials));
    if (event.event.awsRegion) { credential.region = event.event.awsRegion };

    /** this section of code will run if your playbook is a scheduled event */
    if (event.playbook.type === 'schedule') {
        /** 
         * Call our api endpoint to cary out our scheduled task 
         * setting our API endpoint to get data from IntelligentDiscovery - see api documentation for all endpoints
         */
        var url = `api/<service>/<endpoint>/${event.accountDetails.accountId}?RecordStatus=Active&fields=Region,`;

        /** calling the api endpoint */
        var data = await helper.apiQuery(url);

        for (var i = 0; i < data.length; i++) {
             /** setting credential specific for region of the expired certificate */
            var regionCredential = JSON.parse(JSON.stringify(credential));
            regionCredential.region = data[i].Region;

            /** use api generator above to help you with aws api calls */
            await helper.awsApiCall(regionCredential, '<awsClass>', '<awsMethod>', '{<awsParams>}');
        }
        resolve({ remediationDone: true, data: data });

    /** this section of code will run if your playbook is based on an event pattern */
    } else if (event.playbook.type === 'event') {
          /** this gets our item from the event = leverage requestParameters or responseElements of the event */
        var item = event.event.detail.requestParameters;

        /** handle remediation logic on event item */
        /** use api generator above to help you with aws api calls */
        await helper.awsApiCall(credential, '<awsClass>', '<awsMethod>', '{<awsParams>}');

        resolve({ remediationDone: true, data: 'this has been remediated' });
    }
});
