/**
 * =======================================================================
 * Author: IntelligentDiscovery Support - www.intelligentdiscovery.io
 * Created: 2021-05-12
 * Description: Disable users that have not been used for specified days
 * Compliance Frameworks: CIS, NIST
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
    credential.region = 'us-east-1';

    var days = 30;

    var pastDate = new Date(new Date().setDate(dte.getDate() - days)).toISOString();
    // setting our API endpoint to get data from IntelligentDiscovery
    var url = `api/iam/users/${event.accountDetails.accountId}?RecordStatus=Active&status=active&password_enabled=true&password_last_used[lt]=${pastDate}&fields=user,password_last_used`;

    // calling the api endpoint
    var data = await helper.apiQuery(url);

    // filtering out root accounts as these can not be disabled
    data = data.filter(f=> f.user !== 'root');

    for (var i = 0; i < data.length; i++) {
        // setting credential specific for region of the expired certificate
        await helper.awsApiCall(credential, 'IAM', 'deleteLoginProfile', { UserName: data[i].user });
    }

    // returning back to our workflow
    resolve({ remediationDone: true, data: data });
});
