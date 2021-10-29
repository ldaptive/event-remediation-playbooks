/**
 * =======================================================================
 * Author: IntelligentDiscovery Support - www.intelligentdiscovery.io
 * Created: 2021-05-12
 * Description: Set password policy on account
 * Compliance Frameworks: CIS, NIST, AWS
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
 * @param {Object} event.userDetails the user information of who triggered the event (if user lookup is set in playbook)
 */

module.exports.run = (event) => new Promise(async (resolve) => {
    // setting our credential specific to the region where the event occurred
    var credential = JSON.parse(JSON.stringify(event.credentials));
    credential.region = 'us-east-1';

    // setting our password policy settings
    var passwordPolicy = {
        AllowUsersToChangePassword: true,
        HardExpiry: true,
        MaxPasswordAge: 90,
        MinimumPasswordLength: 14,
        PasswordReusePrevention: 24,
        RequireLowercaseCharacters: true,
        RequireNumbers: true,
        RequireSymbols: true,
        RequireUppercaseCharacters: true
    }

    // making the api call to set the account password policy
    await helper.awsApiCall(credential, 'IAM', 'updateAccountPasswordPolicy', passwordPolicy);

    // returning back to our workflow
    resolve({ remediationDone: true, data: 'Account password policy has been set' });
});
