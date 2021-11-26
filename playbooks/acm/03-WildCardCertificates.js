/**
 * =======================================================================
 * Author: IntelligentDiscovery Support - www.intelligentdiscovery.io
 * Created: 2021-05-12
 * Description: removes wildcard certificates
 * Compliance Frameworks: N/A
 * -----------------------  AWS Event Details  ---------------------------
 * eventSource: acm.amazonaws.com
 * eventName: RequestCertificate
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
        var url = `api/acm/certificates/${event.accountDetails.accountId}?RecordStatus=Active&fields=NotAfter,Region,CertificateArn,DomainName,AlternativeNames`;

        // calling the api endpoint
        var data = await helper.apiQuery(url);
        var wildCardCerts = [];
        data.forEach(x => {
            if (x.AlternativeNames) {
                x.AlternativeNames.forEach(n => {
                    if (n.Name.startsWith("*")) {
                        wildCardCerts.push(x);
                    }
                });
            } else if (x.DomainName.startsWith("*")) {
                wildCardCerts.push(x);
            }
        });

        //handle remediation here;
        for (var i = 0; i < wildCardCerts.length; i++) {
            // setting credential specific for region of the expired certificate
            var regionCredential = JSON.parse(JSON.stringify(credential));
            regionCredential.region = wildCardCerts[i].Region;
            await helper.awsApiCall(regionCredential, 'ACM', 'deleteCertificate', { CertificateArn: wildCardCerts[i].CertificateArn });
        }
        resolve({ remediationDone: true, data: wildCardCerts });
    } else if (event.playbook.type === 'event') {
        // getting our event item
        var item = event.event.detail.requestParameters;
        if (item.domainName.startsWith('*') || item.subjectAlternativeNames.filter(f => f.startsWith('*')).length > 0) {
            await helper.awsApiCall(credential, 'ACM', 'deleteCertificate', { CertificateArn: event.event.detail.responseElements.certificateArn });
            resolve({ remediationDone: true, data: certificate });
        } else {
            
        }
    }
});
