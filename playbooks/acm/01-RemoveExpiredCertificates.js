/**
 * =======================================================================
 * Author: IntelligentDiscovery Support - www.intelligentdiscovery.io
 * Created: 2021-05-12
 * Description: removes expired certificates
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

    // setting our API endpoint to get data from IntelligentDiscovery
    var url = `api/acm/certificates/${event.accountDetails.accountId}?RecordStatus=Active&NotAfter[lt]=${now}&fields=NotAfter,Region,CertificateArn,DomainName`;

    // calling the api endpoint
    var data = await helper.apiQuery(url);

    for (var i = 0; i < data.length; i++) {
        // setting credential specific for region of the expired certificate
        var regionCredential = JSON.parse(JSON.stringify(credential));
        regionCredential.region = data[i].Region;
        await helper.awsApiCall(regionCredential, 'ACM', 'deleteCertificate', { CertificateArn: data[i].CertificateArn });
    }

    // returning back to our workflow
    resolve({ remediationDone: true, data: data });
});
