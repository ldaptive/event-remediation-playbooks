/**
 * =======================================================================
 * Author: IntelligentDiscovery Support - www.intelligentdiscovery.io
 * Created: 2021-05-12
 * Description: alerts on expiring certificates
 * Compliance Frameworks: NIST, PCI-DSS
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

    var futureDate = new Date(new Date().setDate(dte.getDate() - 14)).toISOString();
    // setting our API endpoint to get data from IntelligentDiscovery
    var url = `api/acm/certificates/${event.accountDetails.accountId}?RecordStatus=Active&NotAfter[lt]=${futureDate}&RenewalEligibility=INELIGIBLE&fields=NotAfter,Region,CertificateArn,DomainName,RenewalEligibility`;

    // calling the api endpoint
    var data = await helper.apiQuery(url);

    // returning back to our workflow
    resolve({ remediationDone: true, data: data });
});
